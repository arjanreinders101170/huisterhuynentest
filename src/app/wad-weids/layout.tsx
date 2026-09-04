import type { Metadata } from "next";
import "./wadweids.css";

/* ── Merkshell ───────────────────────────────────────────────────────
   Alles binnen /wad-weids draait in deze schil. De klasse .ww zet het
   palet, de typografie én de container voor de responsive regels; daardoor
   raakt de mock-up de bestaande site niet en werkt exact dezelfde opmaak
   in het telefoonframe op /wad-weids/mobiel.

   De twee merkfonts worden hier geladen, niet in de root-layout: Wad &
   Weids heeft een eigen typografie en moet die ook los kunnen meenemen
   naar een eigen domein. */
export const metadata: Metadata = {
  title: "Wad & Weids — luxe verblijven in de mooiste natuur van Nederland",
  description:
    "Een kleine collectie bijzondere vakantiehuizen aan het wad, in de duinen en op de heide. Direct boeken bij de eigenaar.",
  robots: { index: false, follow: false }, // mock-up, hoort niet in Google
};

export default function WadWeidsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Jost:wght@300;400;500&display=swap"
      />
      <div className="ww">{children}</div>
    </>
  );
}
