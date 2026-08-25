"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DirectBookingUSP } from "@/components/DirectBookingUSP";

/* Sticky mobile booking bar. Hidden on desktop (see globals.css media query).
 * Renders a spacer so page content isn't hidden behind the fixed bar on mobile.
 *
 * De CTA belooft niet meer dan wat er achter de klik zit: de bezoeker komt op
 * het aanvraagformulier, niet op een afrekenpagina. "Bekijk beschikbaarheid"
 * is dezelfde belofte als op de landingspagina's (LandingTemplate → ctaAvail)
 * en in i18n/nl.ts → checkAvailability.
 *
 * De balk hangt in de root-layout en dekt dus ook /de/*; de taal komt daarom
 * uit het pad in plaats van uit een prop die niemand meegeeft. */

const COPY = {
  nl: { cta: "Bekijk beschikbaarheid →", href: "/#reserveren" },
  de: { cta: "Verfügbarkeit prüfen →", href: "/de#verfugbarkeit" },
} as const;

export function StickyMobileCTA({ bookingHref, locale }: { bookingHref?: string; locale?: "nl" | "de" }) {
  const pathname = usePathname();
  const taal = locale ?? (pathname === "/de" || pathname?.startsWith("/de/") ? "de" : "nl");
  const copy = COPY[taal];

  return (
    <>
      <div className="hth-sticky-cta-spacer" aria-hidden />
      <div
        className="hth-sticky-cta"
        style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60,
          flexDirection: "column",
          gap: 7, padding: "9px 12px calc(9px + env(safe-area-inset-bottom))",
          background: "rgba(20,18,16,.97)", borderTop: "1px solid rgba(180,154,94,.4)",
          alignItems: "stretch",
        }}
      >
        <DirectBookingUSP locale={taal} tone="onDark" size={10.5} style={{ gap: "4px 12px" }} />
        <Link
          href={bookingHref ?? copy.href}
          style={{
            textAlign: "center", padding: "13px 0", borderRadius: 10,
            background: "#B49A5E", color: "#1A2E24", fontWeight: 700, fontSize: 15,
            textDecoration: "none", fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
          }}
        >
          {copy.cta}
        </Link>
      </div>
    </>
  );
}
