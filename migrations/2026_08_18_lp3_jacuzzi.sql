-- /vakantiehuis-met-hottub-drenthe: "jacuzzi" in title, H1, intro en FAQ.
--
-- Jacuzzi-zoekopdrachten leveren 754 vertoningen op, hottub 249 — terwijl de
-- pagina overal "hottub" zei. De URL blijft bewust ongewijzigd: de 914
-- vertoningen aan history op deze URL zijn meer waard dan het zoekwoord in het
-- pad, en Google behandelt jacuzzi en hottub als vrijwel synoniem. De winst zit
-- in de zichtbare tekst, want daar beslist de zoeker of hij klikt.
--
-- De seed in src/lib/landing-seed.ts is gelijk bijgewerkt; deze migratie doet
-- hetzelfde voor de rij die al in de database staat (de database wint van de
-- seed). Bewust géén "Importeer standaardpagina's" gebruiken: die knop upsert
-- álle landingspagina's en overschrijft ook handmatige aanpassingen elders.
--
-- Idempotent en veilig: de update raakt de rij alleen zolang de oude H1 er nog
-- staat, dus een handmatige aanpassing in de admin blijft ongemoeid.

update landing_pages set
  breadcrumb = 'Vakantiehuis met jacuzzi Drenthe',
  eyebrow    = 'Privé jacuzzi · Zeijen · Drenthe',
  h1         = 'Vakantiehuis met privé-jacuzzi in Drenthe',
  hero_sub   = 'Twee luxe lodges op de Drentse heide bij Zeijen, elk met een eigen jacuzzi op het terras. Wandel vanuit de deur de natuur in en keer terug naar warm, bruisend water onder de sterren.',
  hero_image_alt = 'Vakantiehuis met privé-jacuzzi op het terras van Lodge De Heide, omgeven door de Drentse heide in Zeijen',
  intro      = 'Een vakantiehuis met jacuzzi in Drenthe is meer dan een extraatje — het is het moment waarop een weekend echt tot rust komt. Bij Huis ter Huynen heeft elke lodge een eigen jacuzzi op het terras: volledig afgeschermd, het hele jaar door op 38 °C en van niemand anders. Of u het nu een jacuzzi of een hottub noemt — het is dezelfde privébadkuip in de buitenlucht. Geen gedeelde wellness, geen buren: alleen u, het bruisende water en het uitzicht over heide en bos.',
  faq        = concat_ws(chr(10),
    'Is de jacuzzi privé? :: Ja. Zowel Lodge De Heide als Lodge De Eik heeft een eigen, afgeschermde jacuzzi op het terras. U deelt hem met niemand buiten uw eigen gezelschap — er is geen gedeelde wellnessruimte op het terrein.',
    'Wat is het verschil tussen een jacuzzi en een hottub? :: In de praktijk niets: beide woorden worden gebruikt voor een bad met warm, bruisend water in de buitenlucht. Bij Huis ter Huynen staat bij elke lodge zo''n bad op het eigen terras, met massagestralen en verwarmd water.',
    'Is de jacuzzi het hele jaar warm? :: Ja, de jacuzzi is 24/7 beschikbaar en staat standaard ingesteld op 38 °C — ook in de winter, wanneer een jacuzzi in de besneeuwde natuur op zijn allermooist is.',
    'Zit er ook een sauna bij? :: Lodge De Heide heeft naast de privé-jacuzzi een eigen sauna en panoramisch uitzicht over het bos. Lodge De Eik heeft geen sauna, maar wel een buitenkeuken met BBQ onder de eiken.',
    'Voor hoeveel personen is het vakantiehuis geschikt? :: Elke lodge is geschikt voor maximaal vier personen. Ideaal voor koppels, een klein gezin of twee stellen die samen weg willen.',
    'Hoe ver ligt het vakantiehuis van Assen? :: Huis ter Huynen ligt in Zeijen, op ongeveer 20 minuten rijden van Assen en op een kwartier van het Nationaal Park Drentsche Aa.',
    'Boek ik rechtstreeks bij de eigenaar? :: Ja. Huis ter Huynen wordt particulier verhuurd en u boekt rechtstreeks bij ons — geen tussenpartij, geen boekingskosten. Wij reageren binnen 24 uur persoonlijk op uw aanvraag.'
  ),
  cta_title  = 'Boek uw vakantiehuis met jacuzzi in Drenthe',
  meta_title = 'Vakantiehuis met Jacuzzi Drenthe | Privé Hottub bij Elke Lodge',
  meta_description = 'Twee vrijstaande vakantiehuisjes in Drenthe, elk met een eigen jacuzzi op het terras. Geen gedeelde wellness, 24/7 op 38 °C. Op de heide bij Zeijen. Vanaf €165.',
  updated_at = now()
where slug = 'vakantiehuis-met-hottub-drenthe'
  and h1 = 'Vakantiehuis met privé-hottub in Drenthe';
