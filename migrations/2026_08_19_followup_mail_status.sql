-- Follow-up-mails stonden als betaling in het dashboard
--
-- De follow-up-mailer schrijft na het versturen een rij in `bookings` om te
-- onthouden dat een gast al een mail heeft gehad. Die rij kreeg status
-- 'betaald', bedoeld als "afgehandeld". Gevolg: het admin-dashboard toonde bij
-- elke verstuurde mail een groene badge "betaald", en de financiële tab telde
-- ze mee als betalingen — terwijl er geen Mollie-betaling aan te pas kwam.
--
-- De ontdubbeling gebeurt op product = 'follow-up-email', niet op status, dus
-- de status is puur informatief en kan veilig gecorrigeerd worden.

update bookings
   set status = 'verstuurd'
 where product = 'follow-up-email'
   and status = 'betaald';
