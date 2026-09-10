-- De Booking.com-import houdt voortaan ook de agenda bij
--
-- Aanleiding: na een geslaagde import stonden de nieuwe reserveringen wél in
-- het verblijvenoverzicht, maar niet in de lijst 'Blokkeringen' — en dus ook
-- niet in de agenda. Die lijst komt namelijk uit booking_requests: het zijn de
-- handmatige blokkeringen die je met de knop 'Handmatige boeking' maakt, en
-- die werden voor elke Booking.com-boeking met de hand overgetypt. Precies het
-- werk dat de import zou wegnemen.
--
-- Vanaf nu maakt de import die blokkering zelf. Deze kolom is de sleutel: het
-- reserveringsnummer van Booking.com, zodat dezelfde export twee keer inlezen
-- geen tweede blokkering oplevert en een annulering de juiste regel opruimt.
--
-- Blokkeringen die je eerder met de hand maakte hebben dat nummer nog niet.
-- Die worden bij de eerstvolgende import herkend aan lodge en exacte datums en
-- alsnog gekoppeld — het voorstel laat dat per regel zien voordat er iets
-- verandert. Er wordt hier dus niets automatisch ingevuld.

alter table booking_requests add column if not exists extern_id text;

comment on column booking_requests.extern_id is
  'Reserveringsnummer bij Booking.com voor een blokkering die uit de import komt; leeg bij een blokkering die je zelf maakte';

-- Partieel, want eigen aanvragen en blokkeringen hebben geen extern nummer en
-- mogen niet met elkaar botsen.
create unique index if not exists booking_requests_extern_id_uniek
  on booking_requests (extern_id) where extern_id is not null;

-- Controle: hoeveel blokkeringen zijn al aan een reservering gekoppeld?
select coalesce(bericht, '(geen platform)') as platform,
       count(*)                                          as blokkeringen,
       count(*) filter (where extern_id is not null)     as gekoppeld
from booking_requests
where bron = 'handmatig'
group by 1
order by 1;
