import { SiteHeader } from "@/components/wadweids/SiteHeader";
import { SiteFooter } from "@/components/wadweids/SiteFooter";
import { HomeContent } from "@/components/wadweids/HomeContent";
import { PropertyDetail } from "@/components/wadweids/PropertyDetail";
import { SearchResults } from "@/components/wadweids/SearchResults";
import { myTourist } from "@/lib/wadweids/mytourist";

/* ── Mobiele weergave ────────────────────────────────────────────────
   Geen aparte mobiele site en geen losse schermafbeeldingen: in de frames
   hieronder draaien exact dezelfde componenten als op de echte pagina's,
   in een container van 390 pixels breed. Dat werkt omdat de responsive
   regels op container queries staan en niet op de vensterbreedte — wat je
   hier ziet is dus letterlijk wat een bezoeker op zijn telefoon krijgt. */
export const metadata = { title: "Mobiele weergave — Wad & Weids" };

function Telefoon({ titel, notitie, children }: { titel: string; notitie: string; children: React.ReactNode }) {
  return (
    <div className="ww-device">
      <div className="ww-device__shell">
        <div className="ww-device__screen">
          <span className="ww-device__notch" />
          <div className="ww ww-device__viewport">{children}</div>
        </div>
      </div>
      <div className="ww-device__caption">
        <strong>{titel}</strong>
        <span>{notitie}</span>
      </div>
    </div>
  );
}

export default async function MobielPage() {
  const properties = await myTourist.listProperties();
  const woning = (await myTourist.getProperty("de-weidsheid")) ?? properties[0];

  return (
    <>
      <SiteHeader />
      <div className="ww-pagehead ww-pagehead--onsand">
        <div className="ww-wrap">
          <span className="ww-eyebrow">Mobiel</span>
          <h1 className="ww-h2 ww-mt-s">Dezelfde site, kleiner scherm</h1>
          <p className="ww-lead ww-mt-s">
            Zoeken, filteren, beschikbaarheid bekijken en boeken moeten op een telefoon net zo vanzelfsprekend zijn
            als op een laptop. De schermen hieronder zijn geen plaatjes: het zijn dezelfde componenten, op 390 pixels.
            Scroll er gerust in.
          </p>
        </div>
      </div>

      <section className="ww-section ww-section--tight">
        <div className="ww-wrap ww-wrap--wide">
          <div className="ww-devices">
            <Telefoon titel="Homepage" notitie="Hero, zoekmodule en de collectie onder elkaar">
              <SiteHeader variant="over" />
              <HomeContent properties={properties} />
            </Telefoon>
            <Telefoon titel="Accommodatiepagina" notitie="Galerij, faciliteiten en de boekingsmodule">
              <SiteHeader />
              <PropertyDetail property={woning} />
            </Telefoon>
            <Telefoon titel="Zoekresultaten" notitie="Filters schuiven omhoog als sheet">
              <SiteHeader />
              <div className="ww-section ww-section--tight">
                <div className="ww-wrap">
                  <SearchResults initial={{}} />
                </div>
              </div>
            </Telefoon>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
