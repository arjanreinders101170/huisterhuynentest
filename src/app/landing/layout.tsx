import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Huis ter Huynen — Boutique Lodge Drenthe",
  description: "Twee unieke boutique lodges in het hart van Drenthe. Natuur, privacy, en luxe in perfecte harmonie.",
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      maxWidth: "100%",
      margin: 0,
      padding: 0,
      width: "100%",
    }}>
      {children}
    </div>
  );
}
