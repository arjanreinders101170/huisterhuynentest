"use client";
const C = { bg: "#EAE3D2", text: "#2A2418", muted: "#8A7D6A", gold: "#B49A5E", border: "#D5C9B0" };

const S = {
  h1: { fontFamily: "Georgia,serif", fontSize: 36, marginBottom: 12 } as React.CSSProperties,
  h2: { fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12, color: C.text, borderBottom: `2px solid ${C.gold}`, paddingBottom: 6 } as React.CSSProperties,
  h3: { fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8, color: C.text } as React.CSSProperties,
  p: { marginBottom: 10, lineHeight: 1.8 } as React.CSSProperties,
  ul: { marginLeft: 20, marginBottom: 12, lineHeight: 1.8 } as React.CSSProperties,
  li: { marginBottom: 4 } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, marginBottom: 16 },
  td: { border: `1px solid ${C.border}`, padding: "8px 12px", lineHeight: 1.6 } as React.CSSProperties,
  th: { border: `1px solid ${C.border}`, padding: "8px 12px", background: C.gold, color: "#fff", textAlign: "left" as const, fontWeight: 600 } as React.CSSProperties,
  callout: { background: "#fff8ec", border: `1px solid ${C.gold}`, borderRadius: 6, padding: "12px 16px", marginBottom: 16 } as React.CSSProperties,
};

export default function TermsPage() {
  return (
    <div style={{ background: C.bg, fontFamily: "'DM Sans',system-ui,sans-serif", color: C.text, minHeight: "100vh" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px" }}>

        <h1 style={S.h1}>Algemene Voorwaarden</h1>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Huis ter Huynen · Versie 2.0 · Laatste update: mei 2026</p>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 40 }}>
          Van toepassing op alle directe boekingen en verblijven bij Huis ter Huynen, geëxploiteerd door VVR Vastgoed BV (KvK: 96382600), Bommegearde 176, 9244 AM Beetsterzwaag.
        </p>

        {/* INHOUDSOPGAVE */}
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 24px", marginBottom: 40 }}>
          <p style={{ fontWeight: 700, marginBottom: 10 }}>Inhoudsopgave</p>
          {[
            "1. Definities en toepasselijkheid",
            "2. Totstandkoming van de boeking",
            "3. Betaling",
            "4. Annulering door de gast",
            "5. Annulering door Huis ter Huynen",
            "6. Check-in en check-out",
            "7. Verblijf en huisregels",
            "8. Borgsom en schade",
            "9. Aansprakelijkheid",
            "10. Privacy en persoonsgegevens",
            "11. Klachten en geschillen",
            "12. Overmacht",
            "13. Wijzigingen",
            "14. Toepasselijk recht",
            "15. Contact",
          ].map((item) => (
            <p key={item} style={{ fontSize: 14, lineHeight: 1.7, margin: 0, color: C.gold }}>
              <a href={`#artikel-${item.split(".")[0]}`} style={{ color: C.gold, textDecoration: "none" }}>{item}</a>
            </p>
          ))}
        </div>

        <div style={{ lineHeight: 1.8 }}>

          {/* ARTIKEL 1 */}
          <h2 id="artikel-1" style={S.h2}>1. Definities en toepasselijkheid</h2>
          <h3 style={S.h3}>1.1 Definities</h3>
          <ul style={S.ul}>
            <li style={S.li}><strong>Huis ter Huynen</strong>: de accommodatie geëxploiteerd door VVR Vastgoed BV (KvK: 96382600), gevestigd aan Bommegearde 176, 9244 AM Beetsterzwaag.</li>
            <li style={S.li}><strong>Gast</strong>: de natuurlijke persoon of rechtspersoon die een boeking plaatst en/of gebruikmaakt van de accommodatie.</li>
            <li style={S.li}><strong>Boeking</strong>: de overeenkomst tot tijdelijk gebruik van de accommodatie voor een overeengekomen periode tegen een overeengekomen prijs.</li>
            <li style={S.li}><strong>Accommodatie</strong>: het verblijfsobject inclusief bijbehorende faciliteiten zoals tuin, berging en parkeerplaats.</li>
            <li style={S.li}><strong>Aankomstdatum</strong>: de eerste dag van het overeengekomen verblijf.</li>
            <li style={S.li}><strong>Vertrekdatum</strong>: de laatste dag van het overeengekomen verblijf.</li>
            <li style={S.li}><strong>Totaalprijs</strong>: alle kosten inclusief verblijfskosten, schoonmaakkosten, toeristenbelasting en eventuele andere toeslagen.</li>
          </ul>
          <h3 style={S.h3}>1.2 Toepasselijkheid</h3>
          <p style={S.p}>Deze algemene voorwaarden zijn van toepassing op alle offertes, boekingen en overeenkomsten tussen Huis ter Huynen en de gast, ongeacht het kanaal waarlangs de boeking is geplaatst. Door een boeking te bevestigen, verklaart de gast kennis te hebben genomen van en akkoord te gaan met deze voorwaarden.</p>
          <p style={S.p}>Afwijkingen van deze voorwaarden zijn uitsluitend geldig indien schriftelijk overeengekomen.</p>

          {/* ARTIKEL 2 */}
          <h2 id="artikel-2" style={S.h2}>2. Totstandkoming van de boeking</h2>
          <h3 style={S.h3}>2.1 Boekingsproces</h3>
          <p style={S.p}>Een boeking komt tot stand zodra Huis ter Huynen een schriftelijke bevestiging (per e-mail) heeft verstuurd na ontvangst van de boeking en de aanbetaling. De gast ontvangt altijd een boekingsbevestiging met alle relevante gegevens.</p>
          <h3 style={S.h3}>2.2 Juistheid van gegevens</h3>
          <p style={S.p}>De gast is verantwoordelijk voor de juistheid van de door hem/haar verstrekte gegevens. Bij onjuiste gegevens (zoals het werkelijk aantal gasten of huisdieren) behoudt Huis ter Huynen het recht de boeking te annuleren zonder restitutie.</p>
          <h3 style={S.h3}>2.3 Minimumleeftijd</h3>
          <p style={S.p}>De hoofdboeker dient minimaal 18 jaar oud te zijn. Huis ter Huynen behoudt het recht te vragen naar een geldig identiteitsbewijs.</p>
          <h3 style={S.h3}>2.4 Groepsgrootte</h3>
          <p style={S.p}>Het maximale aantal gasten wordt per boeking vastgelegd. Het is niet toegestaan meer personen in de accommodatie te laten verblijven dan overeengekomen. Bij constatering hiervan kan toegang worden geweigerd of kan het verblijf per direct worden beëindigd zonder restitutie.</p>

          {/* ARTIKEL 3 */}
          <h2 id="artikel-3" style={S.h2}>3. Betaling</h2>
          <h3 style={S.h3}>3.1 Betaaltermijnen</h3>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Wanneer</th>
                <th style={S.th}>Te betalen bedrag</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={S.td}>Bij boeking</td>
                <td style={S.td}>30% aanbetaling van de totaalprijs</td>
              </tr>
              <tr>
                <td style={S.td}>Uiterlijk 30 dagen vóór aankomst</td>
                <td style={S.td}>Resterende 70% van de totaalprijs</td>
              </tr>
              <tr>
                <td style={S.td}>Bij boekingen binnen 30 dagen voor aankomst</td>
                <td style={S.td}>100% totaalprijs direct bij boeking</td>
              </tr>
            </tbody>
          </table>
          <h3 style={S.h3}>3.2 Betaalmethoden</h3>
          <p style={S.p}>Huis ter Huynen accepteert betaling via iDEAL, bankoverschrijving en creditcard (Visa/Mastercard). Alle bedragen zijn inclusief BTW tenzij anders vermeld.</p>
          <h3 style={S.h3}>3.3 Niet-tijdige betaling</h3>
          <p style={S.p}>Bij niet-tijdige betaling is Huis ter Huynen gerechtigd de boeking te annuleren na het verstrijken van een betalingstermijn van 5 werkdagen. In dat geval zijn de annuleringskosten conform artikel 4 van toepassing.</p>
          <h3 style={S.h3}>3.4 Toeristenbelasting</h3>
          <p style={S.p}>Toeristenbelasting wordt in rekening gebracht conform de tarieven van de gemeente Tynaarlo en staat afzonderlijk vermeld op de factuur.</p>

          {/* ARTIKEL 4 */}
          <h2 id="artikel-4" style={S.h2}>4. Annulering door de gast</h2>
          <h3 style={S.h3}>4.1 Annuleringsbeleid</h3>
          <p style={S.p}>Annulering dient altijd schriftelijk (per e-mail) te worden gedaan. De datum van ontvangst van de annuleringsmail geldt als annuleringsdatum.</p>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Annulering</th>
                <th style={S.th}>Restitutie</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={S.td}>Meer dan 60 dagen vóór aankomst</td>
                <td style={S.td}>100% restitutie (minus administratiekosten €25)</td>
              </tr>
              <tr>
                <td style={S.td}>30–60 dagen vóór aankomst</td>
                <td style={S.td}>70% restitutie</td>
              </tr>
              <tr>
                <td style={S.td}>14–30 dagen vóór aankomst</td>
                <td style={S.td}>50% restitutie</td>
              </tr>
              <tr>
                <td style={S.td}>7–14 dagen vóór aankomst</td>
                <td style={S.td}>25% restitutie</td>
              </tr>
              <tr>
                <td style={S.td}>Minder dan 7 dagen vóór aankomst</td>
                <td style={S.td}>Geen restitutie</td>
              </tr>
              <tr>
                <td style={S.td}>No-show</td>
                <td style={S.td}>Geen restitutie</td>
              </tr>
            </tbody>
          </table>
          <div style={S.callout}>
            <strong>Aanbeveling:</strong> Huis ter Huynen adviseert gasten een annuleringsverzekering af te sluiten. Bij overmacht (bijv. ziekte) wordt in overleg naar een passende oplossing gezocht.
          </div>
          <h3 style={S.h3}>4.2 Vroeg vertrek</h3>
          <p style={S.p}>Bij voortijdig vertrek vindt geen restitutie van reeds betaalde verblijfskosten plaats.</p>
          <h3 style={S.h3}>4.3 Wijzigingen</h3>
          <p style={S.p}>Wijzigingen van de boekingsdatum zijn mogelijk tot 30 dagen voor aankomst, uitsluitend na schriftelijke goedkeuring van Huis ter Huynen en afhankelijk van beschikbaarheid. Huis ter Huynen behoudt het recht een wijzigingsvergoeding van €25 in rekening te brengen.</p>

          {/* ARTIKEL 5 */}
          <h2 id="artikel-5" style={S.h2}>5. Annulering door Huis ter Huynen</h2>
          <h3 style={S.h3}>5.1 Recht op annulering</h3>
          <p style={S.p}>Huis ter Huynen behoudt het recht de boeking te annuleren in geval van:</p>
          <ul style={S.ul}>
            <li style={S.li}>Overmacht (zie artikel 12);</li>
            <li style={S.li}>Onjuiste of frauduleuze boekinginformatie;</li>
            <li style={S.li}>Niet-tijdige betaling na herinnering;</li>
            <li style={S.li}>Schending van eerdere verblijfsafspraken door de gast.</li>
          </ul>
          <h3 style={S.h3}>5.2 Restitutie bij annulering door verhuurder</h3>
          <p style={S.p}>In geval van annulering door Huis ter Huynen (niet zijnde overmacht) ontvangt de gast 100% restitutie van alle betaalde bedragen. Huis ter Huynen is niet aansprakelijk voor verdere schade (zoals reiskosten of gemiste inkomsten).</p>

          {/* ARTIKEL 6 */}
          <h2 id="artikel-6" style={S.h2}>6. Check-in en check-out</h2>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Moment</th>
                <th style={S.th}>Tijd</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={S.td}>Check-in (standaard)</td>
                <td style={S.td}>15:00 – 21:00 uur</td>
              </tr>
              <tr>
                <td style={S.td}>Check-out</td>
                <td style={S.td}>Uiterlijk 11:00 uur</td>
              </tr>
            </tbody>
          </table>
          <h3 style={S.h3}>6.1 Late check-in</h3>
          <p style={S.p}>Late check-in is mogelijk zonder extra kosten. De accommodatie is voorzien van digitale sloten die toegankelijk zijn tot middernacht (00:00 uur).</p>
          <h3 style={S.h3}>6.2 Late check-out</h3>
          <p style={S.p}>Een late check-out (na 11:00 uur) is uitsluitend mogelijk op aanvraag en afhankelijk van beschikbaarheid. Kosten: €25, met een maximum tot 13:00 uur.</p>
          <h3 style={S.h3}>6.3 Identificatie</h3>
          <p style={S.p}>Bij aankomst kan worden gevraagd naar een geldig legitimatiebewijs (paspoort, rijbewijs of ID-kaart) van de hoofdboeker en meerderjarige medeverblijvers. Dit is mede vereist in het kader van de gemeentelijke toeristenbelasting.</p>

          {/* ARTIKEL 7 */}
          <h2 id="artikel-7" style={S.h2}>7. Verblijf en huisregels</h2>
          <p style={S.p}>De gast verplicht zich de accommodatie zorgvuldig, overeenkomstig de bestemming en conform de onderstaande huisregels te gebruiken.</p>
          <h3 style={S.h3}>7.1 Roken</h3>
          <p style={S.p}>Roken is niet toegestaan binnen de accommodatie. Buiten mag worden gerookt op de daartoe bestemde plek. Bij overtreding wordt een reinigingsvergoeding van minimaal €150 in rekening gebracht.</p>
          <h3 style={S.h3}>7.2 Huisdieren</h3>
          <p style={S.p}>Huisdieren zijn toegestaan. Er worden vaste extra schoonmaakkosten van €25 in rekening gebracht. De gast is aansprakelijk voor eventuele schade veroorzaakt door huisdieren.</p>
          <h3 style={S.h3}>7.3 Feesten en evenementen</h3>
          <p style={S.p}>Het is niet toegestaan feesten, evenementen of bijeenkomsten te organiseren waarbij meer bezoekers aanwezig zijn dan het maximale aantal gasten zoals bepaald bij de boeking, tenzij schriftelijk anders overeengekomen.</p>
          <h3 style={S.h3}>7.4 Geluidsoverlast</h3>
          <p style={S.p}>Tussen 22:00 en 08:00 uur geldt de wettelijke nachtrust. Geluidsoverlast is te allen tijde verboden. Bij herhaalde overlastmeldingen kan het verblijf per direct worden beëindigd zonder restitutie.</p>
          <h3 style={S.h3}>7.5 Bezetting</h3>
          <p style={S.p}>Het is niet toegestaan meer personen in de accommodatie te laten verblijven dan het bij de boeking overeengekomen aantal. Dagbezoekers (niet-overnachtende gasten) dienen vooraf te worden gemeld.</p>
          <h3 style={S.h3}>7.6 Gebruik van faciliteiten</h3>
          <ul style={S.ul}>
            <li style={S.li}>De gast dient de accommodatie achter te laten in een nette staat (afwas gedaan, afval gesorteerd, spullen opgeruimd).</li>
            <li style={S.li}>Ramen en deuren dienen bij vertrek gesloten te zijn.</li>
            <li style={S.li}>Sleutels/toegangsmiddelen dienen op de afgesproken wijze te worden ingeleverd.</li>
            <li style={S.li}>Het is niet toegestaan meubels te verplaatsen zonder vooraf te vragen.</li>
          </ul>
          <h3 style={S.h3}>7.7 Aanvullende regelgeving</h3>
          <p style={S.p}>De gast dient zich te houden aan alle geldende wet- en regelgeving. Illegale activiteiten in of rondom de accommodatie leiden tot onmiddellijke beëindiging van het verblijf en aangifte bij de politie.</p>

          {/* ARTIKEL 8 */}
          <h2 id="artikel-8" style={S.h2}>8. Borgsom en schade</h2>
          <h3 style={S.h3}>8.1 Borgsom</h3>
          <p style={S.p}>Huis ter Huynen hanteert geen borgsom.</p>
          <h3 style={S.h3}>8.2 Schade</h3>
          <p style={S.p}>Schade aan de accommodatie, inventaris of eigendommen van Huis ter Huynen dient direct te worden gemeld. De gast is aansprakelijk voor alle schade die tijdens het verblijf is ontstaan, ongeacht of deze door de gast of door meegebrachte bezoekers of huisdieren is veroorzaakt.</p>
          <h3 style={S.h3}>8.3 Inventarisatie</h3>
          <p style={S.p}>Bij aankomst en vertrek wordt de staat van de accommodatie gecontroleerd. De gast wordt in de gelegenheid gesteld eventuele gebreken bij aankomst onmiddellijk te melden, bij gebreke waarvan de gast wordt geacht de accommodatie in goede staat te hebben aangetroffen.</p>
          <h3 style={S.h3}>8.4 Extra schoonmaak</h3>
          <p style={S.p}>Indien de accommodatie bij vertrek buitensporig vervuild is, worden extra schoonmaakkosten (minimaal €75) in rekening gebracht.</p>

          {/* ARTIKEL 9 */}
          <h2 id="artikel-9" style={S.h2}>9. Aansprakelijkheid</h2>
          <h3 style={S.h3}>9.1 Aansprakelijkheid Huis ter Huynen</h3>
          <p style={S.p}>Huis ter Huynen is aansprakelijk voor directe schade als gevolg van een tekortkoming in de nakoming van de overeenkomst, tenzij de tekortkoming niet aan Huis ter Huynen kan worden toegerekend. De aansprakelijkheid is beperkt tot het bedrag van de verblijfskosten.</p>
          <h3 style={S.h3}>9.2 Uitsluiting aansprakelijkheid</h3>
          <p style={S.p}>Huis ter Huynen is niet aansprakelijk voor:</p>
          <ul style={S.ul}>
            <li style={S.li}>Persoonlijk letsel of overlijden, tenzij dit het gevolg is van opzet of grove schuld van Huis ter Huynen;</li>
            <li style={S.li}>Diefstal, verlies of beschadiging van persoonlijke eigendommen van de gast;</li>
            <li style={S.li}>Schade als gevolg van extreme weersomstandigheden of andere externe factoren;</li>
            <li style={S.li}>Indirecte schade of gevolgschade, zoals gederfde inkomsten of gemiste activiteiten.</li>
          </ul>
          <h3 style={S.h3}>9.3 Aansprakelijkheid gast</h3>
          <p style={S.p}>De gast is hoofdelijk aansprakelijk voor alle schade aan de accommodatie en/of inventaris, ontstaan gedurende het verblijf, alsmede voor overlast veroorzaakt aan derden.</p>

          {/* ARTIKEL 10 */}
          <h2 id="artikel-10" style={S.h2}>10. Privacy en persoonsgegevens</h2>
          <h3 style={S.h3}>10.1 Verwerking persoonsgegevens</h3>
          <p style={S.p}>Huis ter Huynen verwerkt persoonsgegevens conform de Algemene Verordening Gegevensbescherming (AVG). De gegevens worden uitsluitend gebruikt voor de uitvoering van de overeenkomst, administratie en wettelijke verplichtingen (waaronder toeristenbelasting).</p>
          <h3 style={S.h3}>10.2 Gegevens die worden verwerkt</h3>
          <ul style={S.ul}>
            <li style={S.li}>Naam, adres, e-mailadres en telefoonnummer van de hoofdboeker;</li>
            <li style={S.li}>Betalingsgegevens;</li>
            <li style={S.li}>Informatie over het verblijf (data, aantal personen).</li>
          </ul>
          <h3 style={S.h3}>10.3 Bewaartermijn</h3>
          <p style={S.p}>Persoonsgegevens worden bewaard zolang dit noodzakelijk is voor de uitvoering van de overeenkomst en daarna gedurende de wettelijke bewaartermijn (7 jaar voor financiële administratie).</p>
          <h3 style={S.h3}>10.4 Rechten van de gast</h3>
          <p style={S.p}>De gast heeft het recht op inzage, correctie, verwijdering en overdracht van zijn/haar persoonsgegevens. Verzoeken kunnen worden gericht aan <a href="mailto:lodge@huisterhuynen.nl" style={{ color: C.gold }}>lodge@huisterhuynen.nl</a>.</p>

          {/* ARTIKEL 11 */}
          <h2 id="artikel-11" style={S.h2}>11. Klachten en geschillen</h2>
          <h3 style={S.h3}>11.1 Meldingsplicht</h3>
          <p style={S.p}>Klachten over de accommodatie dienen direct bij aankomst of uiterlijk binnen 24 uur na constatering te worden gemeld, zodat Huis ter Huynen de mogelijkheid heeft de klacht te verhelpen. Klachten die pas na vertrek worden gemeld, worden niet in behandeling genomen.</p>
          <h3 style={S.h3}>11.2 Klachtenprocedure</h3>
          <p style={S.p}>Klachten kunnen worden ingediend via <a href="mailto:lodge@huisterhuynen.nl" style={{ color: C.gold }}>lodge@huisterhuynen.nl</a>. Huis ter Huynen streeft ernaar klachten binnen 5 werkdagen te beantwoorden.</p>
          <h3 style={S.h3}>11.3 Geschillenbeslechting</h3>
          <p style={S.p}>Indien een klacht niet naar tevredenheid wordt opgelost, kunnen partijen gebruikmaken van mediation of het geschil voorleggen aan de bevoegde rechter. In eerste instantie wordt altijd geprobeerd het geschil in goed overleg te beslechten.</p>

          {/* ARTIKEL 12 */}
          <h2 id="artikel-12" style={S.h2}>12. Overmacht</h2>
          <p style={S.p}>Onder overmacht wordt verstaan: omstandigheden die de uitvoering van de overeenkomst belemmeren en die niet aan Huis ter Huynen of de gast kunnen worden toegerekend, waaronder maar niet beperkt tot: brand, overstroming, extreme weersomstandigheden, epidemieën, pandemieën, overheidsmaatregelen of andere calamiteiten.</p>
          <p style={S.p}>In geval van overmacht zal Huis ter Huynen in overleg met de gast naar een passende oplossing zoeken, zoals verzetten van de boeking of gedeeltelijke restitutie.</p>

          {/* ARTIKEL 13 */}
          <h2 id="artikel-13" style={S.h2}>13. Wijzigingen</h2>
          <p style={S.p}>Huis ter Huynen behoudt het recht deze algemene voorwaarden te wijzigen. De meest actuele versie is altijd beschikbaar op de website. Bij een lopende boeking zijn de voorwaarden van toepassing zoals die golden op het moment van boeking.</p>

          {/* ARTIKEL 14 */}
          <h2 id="artikel-14" style={S.h2}>14. Toepasselijk recht</h2>
          <p style={S.p}>Op alle overeenkomsten met Huis ter Huynen is Nederlands recht van toepassing. Geschillen worden bij uitsluiting voorgelegd aan de bevoegde rechter in het arrondissement Noord-Nederland.</p>

          {/* ARTIKEL 15 */}
          <h2 id="artikel-15" style={S.h2}>15. Contact</h2>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 24px" }}>
            <p style={{ margin: 0, lineHeight: 2 }}>
              <strong>VVR Vastgoed BV</strong><br />
              Bommegearde 176<br />
              9244 AM Beetsterzwaag<br />
              KvK: 96382600<br />
              E-mail: <a href="mailto:lodge@huisterhuynen.nl" style={{ color: C.gold }}>lodge@huisterhuynen.nl</a><br />
            </p>
          </div>

        </div>

        <div style={{ marginTop: 60, textAlign: "center", fontSize: 13, color: C.muted }}>
          <p>© 2026 Huis ter Huynen. Alle rechten voorbehouden.</p>
          <a href="/" style={{ color: C.gold, textDecoration: "none" }}>← Terug naar home</a>
        </div>
      </div>
    </div>
  );
}
