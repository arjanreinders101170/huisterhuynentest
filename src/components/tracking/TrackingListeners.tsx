"use client";
import { useEffect } from "react";
import { pushEvent, baseEnvelope } from "@/lib/tracking/dataLayer";

/* ═══ Global click delegation for outbound + contact events ═══
 * One listener at document level catches:
 *   • WhatsApp links            → Contact (whatsapp)
 *   • tel: links                → Contact (phone)
 *   • mailto: links             → Contact (email)
 *   • booking.com links         → BookingComRedirect
 * Components don't need to call anything — links just work.
 */

export function TrackingListeners() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      const label = (anchor.textContent ?? "").trim().slice(0, 80);

      if (href.startsWith("https://wa.me/") || href.startsWith("whatsapp://")) {
        pushEvent({
          ...baseEnvelope("Contact"),
          contact: { method: "whatsapp", destination: href, label },
        });
        return;
      }
      if (href.startsWith("tel:")) {
        pushEvent({
          ...baseEnvelope("Contact"),
          contact: { method: "phone", destination: href, label },
        });
        return;
      }
      if (href.startsWith("mailto:")) {
        pushEvent({
          ...baseEnvelope("Contact"),
          contact: { method: "email", destination: href, label },
        });
        return;
      }
      if (/(^https?:\/\/)?(www\.)?booking\.com/i.test(href)) {
        pushEvent({
          ...baseEnvelope("BookingComRedirect"),
          outbound: { url: href, lodge: anchor.dataset.lodge ?? null },
          ecommerce: { currency: "EUR", value: 50 },
        });
      }
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
