import Link from "next/link";
import { DirectBookingUSP } from "@/components/DirectBookingUSP";

/* Sticky mobile booking bar. Hidden on desktop (see globals.css media query).
 * Renders a spacer so page content isn't hidden behind the fixed bar on mobile. */
export function StickyMobileCTA({ bookingHref = "/#reserveren", locale = "nl" }: { bookingHref?: string; locale?: "nl" | "de" }) {
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
        <DirectBookingUSP locale={locale} tone="onDark" size={10.5} style={{ gap: "4px 12px" }} />
        <Link
          href={bookingHref}
          style={{
            textAlign: "center", padding: "13px 0", borderRadius: 10,
            background: "#B49A5E", color: "#1A2E24", fontWeight: 700, fontSize: 15,
            textDecoration: "none", fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
          }}
        >
          Claim uw datum →
        </Link>
      </div>
    </>
  );
}
