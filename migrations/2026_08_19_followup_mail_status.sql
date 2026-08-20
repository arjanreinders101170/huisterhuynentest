-- Verstuurde mails stonden als betaling in het dashboard
--
-- De follow-up- en late-checkout-mailers schrijven na het versturen een rij in
-- `bookings` om te onthouden dat een gast die mail al gehad heeft. Die rij
-- kreeg status 'betaald', bedoeld als "afgehandeld". Gevolg: het admin-
-- dashboard toonde bij elke verstuurde mail een groene badge "betaald", en de
-- financiele tab telde ze mee onder "X betalingen" — terwijl er geen Mollie-
-- betaling aan te pas kwam.
--
-- De ontdubbeling gebeurt op de productnaam, niet op status, dus de status is
-- puur informatief en kan veilig gecorrigeerd worden naar 'verstuurd'.

-- 1. Statusconstraint verruimen met 'verstuurd'.
--
-- De constraint op bookings.status staat niet in deze map — hij is ooit direct
-- in Supabase aangemaakt. In plaats van de toegestane waarden hier te gokken
-- lezen we ze uit de database en voegen we er alleen 'verstuurd' aan toe, zodat
-- er geen bestaande waarde verloren gaat.
--
-- Postgres schrijft zo'n lijst in twee vormen, afhankelijk van hoe de
-- constraint ooit is aangemaakt:
--   A. status = ANY (ARRAY['nieuw'::text, 'betaald'::text])
--   B. status = ANY ('{nieuw,betaald}'::text[])
-- Beide worden hieronder herkend; vorm B is wat deze migratie zelf achterlaat,
-- zodat een tweede run de eigen output correct leest en niets doet.
do $$
declare
  con_naam text;
  con_count int;
  def_txt text;
  arr_lit text;
  waarden text[];
begin
  select count(*) into con_count
    from pg_constraint c
   where c.conrelid = 'bookings'::regclass
     and c.contype = 'c'
     and pg_get_constraintdef(c.oid) like '%status%';

  if con_count <> 1 then
    raise exception
      'Verwachtte precies een check-constraint op bookings.status, gevonden: %. Controleer handmatig.',
      con_count;
  end if;

  select c.conname, pg_get_constraintdef(c.oid)
    into con_naam, def_txt
    from pg_constraint c
   where c.conrelid = 'bookings'::regclass
     and c.contype = 'c'
     and pg_get_constraintdef(c.oid) like '%status%';

  -- Vorm B: een enkele array-literal tussen quotes.
  arr_lit := (regexp_match(def_txt, $re$'(\{[^}]*\})'::text\[\]$re$))[1];

  if arr_lit is not null then
    waarden := arr_lit::text[];
  else
    -- Vorm A: losse gequote waarden.
    select array_agg(distinct m[1])
      into waarden
      from regexp_matches(def_txt, $re$'([^']*)'$re$, 'g') as m;
  end if;

  if waarden is null or array_length(waarden, 1) is null then
    raise exception
      'Kon geen toegestane statuswaarden lezen uit constraint %: %. Controleer handmatig.',
      con_naam, def_txt;
  end if;

  if 'verstuurd' = any (waarden) then
    raise notice 'Status verstuurd is al toegestaan, constraint blijft ongewijzigd.';
    return;
  end if;

  waarden := waarden || 'verstuurd'::text;

  execute format('alter table bookings drop constraint %I', con_naam);
  execute format(
    'alter table bookings add constraint %I check (status = any (%L::text[]))',
    con_naam, waarden
  );

  raise notice 'Constraint % herbouwd met waarden: %', con_naam, waarden;
end $$;

-- 2. Bestaande logregels corrigeren.
update bookings
   set status = 'verstuurd'
 where product in ('follow-up-email', 'late-checkout-email')
   and status = 'betaald';
