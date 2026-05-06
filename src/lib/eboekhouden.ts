/**
 * e-Boekhouden.nl REST API client
 * Base URL: https://api.e-boekhouden.nl/v2
 * Auth: Bearer token
 */

const BASE_URL = "https://api.e-boekhouden.nl/v2";

function getToken(): string {
  const token = process.env.EBOEKHOUDEN_API_TOKEN;
  if (!token) throw new Error("EBOEKHOUDEN_API_TOKEN not configured");
  return token;
}

async function apiCall(method: string, endpoint: string, body?: unknown): Promise<unknown> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`e-Boekhouden API error [${response.status}]:`, errorText);
    throw new Error(`e-Boekhouden API ${response.status}: ${errorText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// ═══ RELATIONS (Debiteuren) ═══

type Relation = {
  id?: number;
  type: "P" | "B"; // P=particulier, B=zakelijk
  name: string;
  contact?: string;
  emailAddress?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  phoneNumber?: string;
  ledgerId?: number;
};

/**
 * Find relation by email, or create if not exists.
 * Returns the relation ID.
 */
export async function findOrCreateRelation(
  naam: string,
  email: string,
): Promise<number | null> {
  try {
    // Search existing relations
    const relations = await apiCall("GET", `/relations?search=${encodeURIComponent(email)}&limit=5`) as { content?: Relation[] };

    if (relations.content && relations.content.length > 0) {
      return relations.content[0].id || null;
    }

    // Create new relation
    const newRelation = await apiCall("POST", "/relations", {
      type: "P",
      name: naam,
      emailAddress: email,
      country: "Nederland",
      ledgerId: 1300,
    }) as { id?: number };

    return newRelation.id || null;
  } catch (e) {
    console.error("e-Boekhouden relation error:", e);
    return null;
  }
}

// ═══ MUTATIONS (Boekingen/Facturen) ═══

type MutationLine = {
  amount: number;         // Bedrag incl BTW
  amountExVat: number;    // Bedrag excl BTW
  vatPercentage: number;  // BTW percentage
  ledgerAccountCode: string;
  description: string;
};

type MutationData = {
  type: number;           // 2 = Verkoopfactuur
  date: string;           // YYYY-MM-DD
  description: string;
  invoiceNumber: string;
  relationId: number;
  lines: MutationLine[];
};

/**
 * Push a sales invoice to e-Boekhouden.
 * Returns the mutation ID or null on failure.
 */
export async function pushInvoice(data: {
  invoiceNumber: string;
  relationId: number;
  description: string;
  lines: {
    description: string;
    amountExcl: number;
    btwPercentage: number;
    grootboekCode: string;
  }[];
}): Promise<string | null> {
  try {
    const mutationLines: MutationLine[] = data.lines.map(line => ({
      amount: Math.round(line.amountExcl * (1 + line.btwPercentage / 100) * 100) / 100,
      amountExVat: line.amountExcl,
      vatPercentage: line.btwPercentage,
      ledgerAccountCode: line.grootboekCode,
      description: line.description,
    }));

    const mutation: MutationData = {
      type: 2, // Verkoopfactuur
      date: new Date().toISOString().split("T")[0],
      description: data.description,
      invoiceNumber: data.invoiceNumber,
      relationId: data.relationId,
      lines: mutationLines,
    };

    const result = await apiCall("POST", "/mutations", mutation) as { id?: string };
    return result?.id?.toString() || "synced";
  } catch (e) {
    console.error("e-Boekhouden mutation error:", e);
    return null;
  }
}
