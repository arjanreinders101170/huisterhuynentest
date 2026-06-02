import Link from "next/link";

/* Sticky mobile booking bar. Hidden on desktop (see globals.css media query).
 * Renders a spacer so page content isn't hidden behind the fixed bar on mobile. */
export function StickyMobileCTA({ bookingHref = "/#reserveren" }: { bookingHref?: string }) {
  return (
    <>
      <div className="hth-sticky-cta-spacer" aria-hidden />
      <div
        className="hth-sticky-cta"
        style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60,
          gap: 10, padding: "10px 12px calc(10px + env(safe-area-inset-bottom))",
          background: "rgba(20,18,16,.97)", borderTop: "1px solid rgba(180,154,94,.4)",
          alignItems: "center",
        }}
      >
        <Link
          href={bookingHref}
          style={{
            flex: 1, textAlign: "center", padding: "13px 0", borderRadius: 10,
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
