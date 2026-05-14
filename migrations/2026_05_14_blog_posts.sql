-- Blog posts voor de marketing campagne
-- Inhoud-formaat: ## voor H2 koppen, lege regel = alinea-scheiding

create table if not exists blog_posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  titel         text not null,
  intro         text not null,
  inhoud        text not null,
  categorie     text not null default 'Verhaal',
  leestijd      text not null default '4 minuten',
  auteur        text not null default 'Arjan Reinders',
  gepubliceerd  boolean not null default false,
  gepubliceerd_op date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_blog_posts_slug        on blog_posts (slug);
create index if not exists idx_blog_posts_gepubliceerd on blog_posts (gepubliceerd, gepubliceerd_op desc);

-- Seed: eerste artikel
insert into blog_posts (slug, titel, intro, inhoud, categorie, leestijd, auteur, gepubliceerd, gepubliceerd_op)
values (
  'waarom-zeijen',
  'Waarom ik koos voor Zeijen — het verhaal achter mijn twee lodges bij Huis ter Huynen',
  'Ik ben geen hotelier. Ik zit in vastgoed, en ik weet hoe locaties werken. Maar dit project begon ergens anders — bij een gevoel.',
  '## Het begon niet met een businessplan

Ik ben geen hotelier. Ik zit in vastgoed, en ik weet hoe locaties werken. Maar dit project begon ergens anders — bij een gevoel. Het beeld van twee mensen die aankomen, de deur achter zich dichtdoen en eindelijk even helemaal tot rust komen.

Dat beeld wilde ik werkelijkheid maken.

## Een Facebook-advertentie die alles veranderde

Ik was op zoek naar een locatie in het noorden — Friesland, Groningen of Drenthe. Op een avond verscheen er een advertentie van de ontwikkelaar van Huis ter Huynen: een park van zo''n 70 lodges midden in Drenthe. Niet spectaculair gepresenteerd, gewoon een uitnodiging om te komen kijken.

Ik maakte een afspraak. Zonder hoge verwachtingen.

## Toen ik er stond, wist ik het

Zeijen. Een dorp dat de meeste mensen niet kennen en dat zich ook niet opdringt.

Toen ik uitstapte en om me heen keek, wist ik het eigenlijk al. Aan de ene kant de heide — breed en open. Aan de andere kant een lijn van bomen. Daartussenin: stilte. Het soort stilte dat je pas opmerkt als je er middenin staat en beseft dat je al een tijdje niet aan je telefoon hebt gedacht.

Dit was de plek.

## Waarom hier

Ik woon zelf in Friesland, een halfuur rijden van de lodges. Een bewuste keuze — ik wil betrokken zijn, niet op afstand beheren.

Drenthe trekt al jaren toeristen, maar nooit in de aantallen die je bij de Veluwe ziet. De natuur hier is niet toeristisch bewerkt. De heidevelden bloeien gewoon. De Drentsche Aa slingert door het landschap zonder bewegwijzering. En de ligging klopt: Assen is twintig minuten, Groningen drie kwartier. Gasten die rust zoeken vinden die direct. Wie toch iets wil ondernemen, kan dat zonder urenlang te rijden.

## De twijfels waren er. Het lef ook.

Het onbekende terrein was het grootste struikelblok. Vastgoed kent ik — maar gasten ontvangen, zorgen dat mensen zich thuis voelen in een ruimte die jij hebt gecreëerd, dat is kwetsbaarder.

Toch ben ik gegaan. Omdat ik geloof dat aandacht terugkomt. Als je investeert in de details, in de sfeer, in de kleine dingen die het verschil maken — dan voelen gasten dat.

## Twee van de 70

Van de 70 lodges op het park heb ik er twee aangekocht: Lodge De Heide en Lodge De Eik. Elk volledig privé, met een ruim terras, een hottub en directe toegang tot de natuur. Geen receptie. Geen gedeelde ruimtes. Je komt aan, en alles wat je nodig hebt is er al.',
  'Verhaal',
  '4 minuten',
  'Arjan Reinders',
  true,
  '2026-05-14'
)
on conflict (slug) do nothing;
