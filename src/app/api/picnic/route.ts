import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/*
 * Picnic Integration for Huis ter Huynen
 * 
 * Uses the lodge's own Picnic account to order groceries for guests.
 * Requires: npm install picnic-api
 * Env vars: PICNIC_EMAIL, PICNIC_PASSWORD
 * 
 * Flow:
 * 1. Guest picks a package (welkomst/boodschappen)
 * 2. Server searches Picnic for each item
 * 3. Adds to cart → returns summary + delivery slots
 * 4. Guest confirms → order placed
 */

/* ═══ PRE-DEFINED PACKAGES ═══ */
const PACKAGES: Record<string, { label: string; items: string[] }> = {
  welkomst: {
    label: "Welkomstpakket Drenthe",
    items: [
      "speciaal bier",
      "boerenkaas stuk",
      "droge worst",
      "honing",
      "beschuit",
      "rode wijn",
    ],
  },
  boodschappen: {
    label: "Boodschappenpakket",
    items: [
      "volkoren brood",
      "halfvolle melk 1l",
      "scharreleieren 6",
      "roomboter",
      "filterkoffie",
      "thee",
      "witte suiker",
      "jus d orange",
    ],
  },
};

/* ═══ CLIENT CACHE — reuse auth across requests ═══ */
let picnicClient: unknown = null;
let authExpiry = 0;

async function getClient() {
  const email = process.env.PICNIC_EMAIL;
  const password = process.env.PICNIC_PASSWORD;

  if (!email || !password) {
    return null;
  }

  // Reuse client if auth is still valid (1 hour cache)
  if (picnicClient && Date.now() < authExpiry) {
    return picnicClient;
  }

  try {
    // Dynamic import — only loads when actually needed
    const { default: PicnicClient } = await import("picnic-api");
    const client = new PicnicClient({ countryCode: "NL" });
    await client.auth.login(email, password);
    picnicClient = client;
    authExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    return client;
  } catch (err) {
    console.error("Picnic login failed:", err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, packageId, products } = await request.json();

    /* ═══ ACTION: search — find products for a package ═══ */
    if (action === "search") {
      const pkg = PACKAGES[packageId];
      if (!pkg) {
        return NextResponse.json({ error: "Onbekend pakket" }, { status: 400 });
      }

      const client = await getClient() as any;
      if (!client) {
        return NextResponse.json({
          available: false,
          reason: "Picnic niet geconfigureerd. Bestel handmatig via de lodge.",
        });
      }

      // Search for each item
      const results = [];
      for (const searchTerm of pkg.items) {
        try {
          const searchResults = await client.catalog.search(searchTerm);
          // Get first product from results
          const items = searchResults?.items || searchResults || [];
          if (items.length > 0) {
            const product = items[0];
            results.push({
              searchTerm,
              productId: product.id || product.product_id,
              name: product.name || product.display_name || searchTerm,
              price: product.price || product.display_price || 0,
              unit: product.unit_quantity || "",
              image: product.image_url || null,
            });
          } else {
            results.push({
              searchTerm,
              productId: null,
              name: searchTerm,
              price: 0,
              unit: "",
              image: null,
            });
          }
        } catch {
          results.push({
            searchTerm,
            productId: null,
            name: searchTerm,
            price: 0,
            unit: "",
            image: null,
          });
        }
      }

      return NextResponse.json({
        available: true,
        package: pkg.label,
        products: results,
      });
    }

    /* ═══ ACTION: add-to-cart — add selected products ═══ */
    if (action === "add-to-cart") {
      const client = await getClient() as any;
      if (!client) {
        return NextResponse.json({ available: false });
      }

      if (!products || !Array.isArray(products)) {
        return NextResponse.json({ error: "Geen producten opgegeven" }, { status: 400 });
      }

      // Add each product
      const added = [];
      for (const p of products) {
        if (p.productId) {
          try {
            await client.cart.addProductToCart(p.productId, p.quantity || 1);
            added.push(p.name || p.productId);
          } catch {
            // Product might not be available — skip silently
          }
        }
      }

      // Get delivery slots
      let slots: unknown[] = [];
      try {
        const slotData = await client.cart.getDeliverySlots();
        slots = (slotData?.delivery_slots || slotData || []).slice(0, 5);
      } catch {
        // No slots available
      }

      return NextResponse.json({
        success: true,
        added,
        deliverySlots: slots,
      });
    }

    /* ═══ ACTION: slots — just get delivery slots ═══ */
    if (action === "slots") {
      const client = await getClient() as any;
      if (!client) {
        return NextResponse.json({ available: false });
      }

      try {
        const slotData = await client.cart.getDeliverySlots();
        const slots = (slotData?.delivery_slots || slotData || []).slice(0, 5);
        return NextResponse.json({ slots });
      } catch {
        return NextResponse.json({ slots: [] });
      }
    }

    return NextResponse.json({ error: "Onbekende actie" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: "Er ging iets mis met Picnic" },
      { status: 500 }
    );
  }
}
