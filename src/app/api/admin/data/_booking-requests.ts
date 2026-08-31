import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { esc, buildOfferteHtmlV2, lodgeEmail, lodgePhoto, infoBlock, calloutBlock, checklist, ctaButton, rejectionEmail, termsFooter, type OfferteRegel } from "@/lib/email";
import { APP_URL_FALLBACK, LOGIES_BTW_PCT, lodgeName } from "@/data/lodge";
import { computeStayPrice } from "@/lib/pricing";
import { offerExpiryDate, formatDateNl } from "@/lib/offer-expiry";
import { findConflict, openOffersOverlapping, zelfdeGast } from "@/lib/availability";
import { externPlatform, externPlatformUitleg } from "@/lib/platform";

const DEPOSIT_PCT = 0.30;
const OWNER_EMAIL = process.env.OWNER_EMAIL || "arjan@vvrvastgoedbv.nl";

export async function handleBookingRequestsGet(table: string): Promise<NextResponse | null> {
  if (table !== "booking_requests") return null;
  const { data: raw, error } = await getSupabase()
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ data: [], error: error.message });
  const list = raw || [];
  const guestIds = [...new Set(list.map((r: { guest_id: string | null }) => r.guest_id).filter(Boolean))] as string[];
  let guestLookup: Record<string, { naam: string; email: string }> = {};
  if (guestIds.length > 0) {
    const { data: gd } = await getSupabase().from("guests").select("id, naam, email").in("id", guestIds);
    if (gd) guestLookup = Object.fromEntries(gd.map((g: { id: string; naam: string; email: string }) => [g.id, { naam: g.naam, email: g.email }]));
  }
  const enriched = list.map((r: { guest_id: string | null }) => ({ ...r, guest: r.guest_id ? guestLookup[r.guest_id] || null : null }));
  return NextResponse.json({ data: enriched });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function handleBookingRequestsPost(action: string, body: Record<string, unknown>, _request: NextRequest): Promise<NextResponse | null> {
  switch (action) {
    case "prefill_offerte": {
      const { requestId } = body;
      if (!requestId) return NextResponse.json({ error: "requestId verplicht" }, { status: 400 });

      const sb = getSupabase();
      const { data: req, error: reqErr } = await sb.from("booking_requests").select("*").eq("id", requestId).single();
      if (reqErr || !req) return NextResponse.json({ error: "Aanvraag niet gevonden" }, { status: 404 });

      const personen = req.personen || 2;
      const nachten = req.nachten || (req.check_in && req.check_out
        ? Math.max(0, Math.round((new Date(req.check_out).getTime() - new Date(req.check_in).getTime()) / 86400000))
        : 0);

      let verblijf = Number(req.voorgestelde_prijs) || 0;
      if (req.lodge && req.check_in && req.check_out && nachten > 0) {
        try {
          const calc = await computeStayPrice({
            lodge: req.lodge,
            checkIn: req.check_in,
            checkOut: req.check_out,
            personen,
            huisdier: req.huisdieren || false,
          });
          verblijf = calc.verblijf;
        } catch (e) { console.error("computeStayPrice failed:", e); }
      }

      const { data: feesData } = await sb.from("fee_templates").select("*").eq("actief", true).order("volgorde", { ascending: true });
      const fees = (feesData || []) as Array<{ id: string; label: string; soort: string; bedrag: number | null; basis: string }>;

      const feeAmount = (basis: string, bedrag: number) => {
        switch (basis) {
          case "eenmalig": return bedrag;
          case "per_nacht": return bedrag * nachten;
          case "per_persoon": return bedrag * personen;
          case "per_persoon_per_nacht": return bedrag * personen * nachten;
          default: return 0;
        }
      };

      let schoonmaak = 0;
      let toeristenbelasting = 0;
      const extraRegels: Array<{ label: string; bedrag: number; soort: string; fee_template_id: string }> = [];

      for (const f of fees) {
        const base = f.bedrag ?? 0;
        if (base === 0) continue;
        const amt = Math.round(feeAmount(f.basis, base) * 100) / 100;
        if (amt === 0) continue;
        if (/huisdier/i.test(f.label) && !req.huisdieren) continue;
        if (/schoonmaak/i.test(f.label) && f.soort === "toeslag") {
          schoonmaak = amt;
        } else if (/toeristenbelasting/i.test(f.label) && f.soort === "belasting") {
          toeristenbelasting = amt;
        } else {
          extraRegels.push({ label: f.label, bedrag: amt, soort: f.soort, fee_template_id: f.id });
        }
      }

      /* Waarschuwen vóór het versturen: een offerte blokkeert de agenda niet,
       * dus je kunt ongemerkt een aanbod doen op nachten die al vergeven zijn
       * of waar al een andere gast op zit te wachten. */
      const waarschuwingen: string[] = [];
      if (req.lodge && req.check_in && req.check_out) {
        try {
          const [{ conflict }, andere] = await Promise.all([
            findConflict({ lodge: req.lodge, checkIn: req.check_in, checkOut: req.check_out, excludeRequestId: req.id }),
            openOffersOverlapping({
              checkIn: req.check_in, checkOut: req.check_out, lodge: req.lodge,
              excludeRequestId: req.id, inclusiefCoulance: true,
            }),
          ]);
          if (conflict) {
            waarschuwingen.push(`Deze nachten zijn al bezet — ${conflict.bron || "bestaande reservering"} (${conflict.start} t/m ${conflict.end}). De gast kan niet bevestigen.`);
          }
          for (const o of andere.filter(o => !zelfdeGast(o, req))) {
            waarschuwingen.push(`Er ligt al een aanbod voor deze lodge en periode bij ${o.gast_naam || "een andere gast"}. Versturen wordt geweigerd, tenzij je bewust doorzet.`);
          }
        } catch (e) {
          console.error("Beschikbaarheidscheck bij prefill faalde:", e);
        }
      }

      return NextResponse.json({
        success: true,
        waarschuwingen,
        prefill: {
          verblijf, schoonmaak, toeristenbelasting, extraRegels, nachten, personen,
          gast_naam: req.gast_naam, gast_email: req.gast_email,
          check_in: req.check_in, check_out: req.check_out,
          periode_tekst: req.periode_tekst, lodge: req.lodge,
          huisdieren: req.huisdieren, bron: req.bron, bericht: req.bericht,
        },
      });
    }
    case "send_offerte_v2": {
      const { requestId, prijsVerblijf, schoonmaak, toeristenbelasting, extraRegels, bericht } = body;
      if (!requestId) return NextResponse.json({ error: "requestId verplicht" }, { status: 400 });

      const verblijf = parseFloat(prijsVerblijf as string) || 0;
      const cleaning = parseFloat(schoonmaak as string) || 0;
      const tax = parseFloat(toeristenbelasting as string) || 0;
      const extras = Array.isArray(extraRegels) ? extraRegels : [];

      if (verblijf <= 0) return NextResponse.json({ error: "Verblijfprijs is verplicht" }, { status: 400 });

      const cleanRegels = (extras as Array<{ label?: string; bedrag?: number | string; soort?: string }>)
        .map((r) => ({
          label: String(r.label || "").slice(0, 80),
          bedrag: parseFloat(String(r.bedrag ?? "0")) || 0,
          soort: ["toeslag", "korting", "belasting"].includes(String(r.soort || "")) ? String(r.soort) : "toeslag",
        }))
        .filter((r) => r.label && r.bedrag !== 0);

      const sb = getSupabase();
      const { data: req, error: reqErr } = await sb.from("booking_requests").select("*").eq("id", requestId).single();
      if (reqErr || !req) return NextResponse.json({ error: "Aanvraag niet gevonden" }, { status: 404 });
      /* Reserveringen van Booking.com of Airbnb staan hier alleen om de datums
       * dicht te zetten; die gast heeft daar al een prijs geaccepteerd. Een
       * offerte van ons zou een tweede, afwijkend aanbod zijn. */
      const externOfferte = externPlatform(req);
      if (externOfferte) {
        return NextResponse.json({ error: externPlatformUitleg(externOfferte) }, { status: 409 });
      }
      if (!req.gast_email) return NextResponse.json({ error: "Aanvraag heeft geen e-mailadres" }, { status: 400 });

      /* Niet twee gasten hetzelfde beloven.
       *
       * Een offerte zet de agenda niet dicht, dus technisch kun je dezelfde
       * nachten aan iedereen aanbieden. Zeggen ze allebei ja, dan wint de
       * snelste en moet de ander alsnog worden teleurgesteld — met een aanbod
       * op zak. Daarom weigert het versturen hier zolang er al een aanbod ligt
       * of de nachten bezet zijn. Bewust doorzetten kan: dan stuurt de
       * interface `tochVersturen` mee, bijvoorbeeld om iemand als reserve op
       * de lijst te zetten.
       *
       * Aanbiedingen aan dezelfde gast tellen niet mee: die kan er maar één
       * bevestigen, en het bevestigen trekt het alternatief in. */
      const tochVersturen = body.tochVersturen === true;
      if (!tochVersturen && req.lodge && req.check_in && req.check_out) {
        try {
          const [{ conflict }, andere] = await Promise.all([
            findConflict({ lodge: req.lodge, checkIn: req.check_in, checkOut: req.check_out, excludeRequestId: req.id }),
            openOffersOverlapping({
              checkIn: req.check_in, checkOut: req.check_out, lodge: req.lodge,
              excludeRequestId: req.id, inclusiefCoulance: true,
            }),
          ]);
          const blokkade: string[] = [];
          if (conflict) {
            blokkade.push(
              `Deze nachten zijn al bezet — ${conflict.bron || "bestaande reservering"} ` +
              `(${conflict.start} t/m ${conflict.end}). De gast kan dit aanbod niet bevestigen.`,
            );
          }
          for (const o of andere.filter(o => !zelfdeGast(o, req))) {
            blokkade.push(
              `${o.gast_naam || "Een andere gast"} heeft al een aanbod voor deze lodge en deze nachten ` +
              `(${o.check_in} t/m ${o.check_out}). Zeggen ze allebei ja, dan moet je er één teleurstellen.`,
            );
          }
          if (blokkade.length > 0) {
            return NextResponse.json({
              error: "Offerte niet verstuurd — deze nachten liggen al bij iemand anders.",
              blokkade,
              kanForceren: true,
            }, { status: 409 });
          }
        } catch (e) {
          /* Een storing in de check mag het versturen niet tegenhouden; de
           * dubbelboekingscheck bij het bevestigen blijft hoe dan ook staan. */
          console.error("Dubbel-aanbodcheck bij versturen faalde:", e);
        }
      }

      const extraSum = cleanRegels.reduce((s, r) => s + (r.soort === "korting" ? -Math.abs(r.bedrag) : Math.abs(r.bedrag)), 0);
      const totaal = Math.max(0, Math.round((verblijf + cleaning + tax + extraSum) * 100) / 100);

      const { randomBytes } = await import("crypto");
      const confirmToken = randomBytes(32).toString("hex");

      // Geldig t/m deze dag; daarna vervalt het aanbod via de dagelijkse cron.
      const vervaltOp = offerExpiryDate(req.check_in);

      const { error: updErr } = await sb.from("booking_requests").update({
        status: "offerte_verstuurd",
        prijs_verblijf: verblijf,
        schoonmaak: cleaning,
        toeristenbelasting: tax,
        extra_regels: cleanRegels,
        totaal,
        confirm_token: confirmToken,
        offerte_vervalt_op: vervaltOp,
        // Opnieuw versturen betekent opnieuw een herinnering en een schone lei.
        herinnering_verstuurd_op: null,
        verlopen_op: null,
      }).eq("id", requestId);
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) {
        return NextResponse.json({ success: true, totaal, vervaltOp, emailSent: false, warning: "Resend niet geconfigureerd, offerte is wel opgeslagen" });
      }

      const fmt = (iso: string | null) => iso
        ? new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
        : "";
      const van = req.check_in ? fmt(req.check_in) : (req.periode_tekst?.split("—")[0]?.trim() || "");
      const tot = req.check_out ? fmt(req.check_out) : (req.periode_tekst?.split("—")[1]?.trim() || "");

      const emailRegels: OfferteRegel[] = [{ label: "Verblijf", bedrag: verblijf, soort: "verblijf" }];
      if (cleaning > 0) emailRegels.push({ label: "Eindschoonmaak", bedrag: cleaning, soort: "toeslag" });
      if (tax > 0) emailRegels.push({ label: "Toeristenbelasting", bedrag: tax, soort: "belasting" });
      for (const r of cleanRegels) {
        emailRegels.push({ label: r.label, bedrag: Math.abs(r.bedrag), soort: r.soort as OfferteRegel["soort"] });
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
      const bevestigBase = new URL(appUrl).origin;

      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      try {
        await resend.emails.send({
          from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
          to: [req.gast_email],
          subject: "Persoonlijk aanbod — Huis ter Huynen",
          html: buildOfferteHtmlV2(
            esc(req.gast_naam || ""), esc(van), esc(tot),
            req.personen || 2, emailRegels, totaal, (bericht as string) || "",
            requestId as string, bevestigBase, confirmToken, formatDateNl(vervaltOp),
          ),
          replyTo: "lodge@huisterhuynen.nl",
        });
      } catch (e) {
        console.error("Offerte v2 email failed:", e);
        return NextResponse.json({ success: true, totaal, vervaltOp, emailSent: false, warning: "Offerte opgeslagen, maar e-mail versturen faalde" });
      }

      return NextResponse.json({ success: true, totaal, vervaltOp, emailSent: true });
    }
    case "send_payment_link": {
      const { requestId, fase } = body;
      if (!requestId) return NextResponse.json({ error: "requestId verplicht" }, { status: 400 });
      const phase: "aanbetaling" | "restbetaling" = fase === "restbetaling" ? "restbetaling" : "aanbetaling";

      const sb = getSupabase();
      const { data: req, error: reqErr } = await sb.from("booking_requests").select("*").eq("id", requestId).single();
      if (reqErr || !req) return NextResponse.json({ error: "Aanvraag niet gevonden" }, { status: 404 });
      /* Het platform heeft deze reservering al geïnd. Een betaallink van ons
       * vraagt de gast een tweede keer om geld — dat weigeren we hier, ook als
       * de aanvraag langs een andere weg dan het overzicht binnenkomt. */
      const externBetaling = externPlatform(req);
      if (externBetaling) {
        return NextResponse.json({ error: externPlatformUitleg(externBetaling) }, { status: 409 });
      }
      if (!req.gast_email) return NextResponse.json({ error: "Aanvraag heeft geen e-mailadres" }, { status: 400 });

      const totaal = Number(req.totaal) || 0;
      if (totaal <= 0) return NextResponse.json({ error: "Stuur eerst een offerte — totaalbedrag ontbreekt" }, { status: 400 });

      const deposit = Math.round(totaal * DEPOSIT_PCT * 100) / 100;
      const rest = Math.round((totaal - deposit) * 100) / 100;
      const amount = phase === "aanbetaling" ? deposit : rest;
      const pctLabel = phase === "aanbetaling" ? "30%" : "70%";
      if (amount <= 0) return NextResponse.json({ error: "Bedrag is nul" }, { status: 400 });

      const mollieKey = process.env.MOLLIE_API_KEY;
      if (!mollieKey) return NextResponse.json({ error: "Mollie niet geconfigureerd" }, { status: 500 });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
      const origin = new URL(appUrl).origin;
      const lodgeNaam = lodgeName(req.lodge || "lodge_1");
      const fmtNl = (iso: string | null) => iso
        ? new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
        : "";
      const van = req.check_in ? fmtNl(req.check_in) : (req.periode_tekst?.split("—")[0]?.trim() || "");
      const tot = req.check_out ? fmtNl(req.check_out) : (req.periode_tekst?.split("—")[1]?.trim() || "");
      const periodeLabel = van && tot ? `${van} t/m ${tot}` : (req.periode_tekst || "");
      const faseLabel = phase === "aanbetaling" ? "Aanbetaling" : "Restbetaling";
      const productLabel = `${faseLabel} (${pctLabel}) — Lodge ${lodgeNaam}${periodeLabel ? ` · ${periodeLabel}` : ""}`;

      // Toeristenbelasting valt buiten de BTW en hoort op een eigen factuurregel
      // met eigen grootboek. De betaallink dekt een deel van het totaal, dus de
      // belasting gaat naar rato mee — op dezelfde manier verdeeld als het
      // bedrag zelf, zodat de twee termijnen samen exact het hele bedrag zijn.
      const tbTotaal = Number(req.toeristenbelasting) || 0;
      const tbDeposit = Math.round(tbTotaal * DEPOSIT_PCT * 100) / 100;
      const tbRest = Math.round((tbTotaal - tbDeposit) * 100) / 100;
      const tbDeel = Math.min(Math.max(phase === "aanbetaling" ? tbDeposit : tbRest, 0), amount);

      // Maak een bookings-rij: dit is de bron-van-waarheid voor de Mollie-webhook.
      // Supabase geeft een geweigerde insert terug als wáárde, niet als exception,
      // dus de fout moet expliciet uitgelezen worden. Blijft bookingId leeg, dan
      // krijgt de webhook straks een lege bookingId in de metadata en kan hij de
      // betaling nergens aan koppelen: geen status, geen factuur, geen bedankmail.
      // Anders dan bij /api/checkout staat de gast hier nog niet af te rekenen,
      // dus breken we af vóórdat er een betaling bestaat.
      const { data: booking, error: bookingErr } = await sb.from("bookings").insert({
        guest_id: req.guest_id,
        product: productLabel,
        prijs: amount,
        status: "nieuw",
        metadata: { bookingRequestId: requestId, betaalfase: phase, gastNaam: req.gast_naam, gastEmail: req.gast_email },
      }).select("id").single();
      if (bookingErr || !booking?.id) {
        console.error("[send_payment_link] booking insert geweigerd:", bookingErr?.message, bookingErr?.code);
        return NextResponse.json({
          error: "Kon geen boekingsregel aanmaken — er is geen betaallink verstuurd.",
        }, { status: 500 });
      }
      const bookingId = booking.id;

      // Mollie-betaling aanmaken
      let checkoutUrl: string | null = null;
      /* Of deze betaling in test- of livemodus staat, bepaalt Mollie aan de
       * hand van de gebruikte sleutel. Een testlink ziet er voor de gast uit
       * als een echte, maar er gaat geen geld — die mag dus nooit naar een
       * gast. De webhook weigert een testbetaling al te verwerken; hier
       * voorkomen we dat de gast überhaupt zo'n link in handen krijgt. */
      let testbetaling = false;
      try {
        const mollieRes = await fetch("https://api.mollie.com/v2/payments", {
          method: "POST",
          headers: { Authorization: `Bearer ${mollieKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: { currency: "EUR", value: amount.toFixed(2) },
            description: `Huis ter Huynen — ${productLabel}`,
            // De bedankpagina leest ?product uit voor de titel en de foto; zonder
            // die parameter landt de gast op "je bestelling" met een borrelfoto.
            redirectUrl: `${origin}/betaald?product=${encodeURIComponent(productLabel)}&booking=${bookingId}`,
            webhookUrl: `${origin}/api/mollie/webhook`,
            metadata: {
              bookingId,
              betaalfase: phase,
              bookingRequestId: requestId,
              gastNaam: req.gast_naam,
              gastEmail: req.gast_email,
              // Beide als string, zodat de webhook niet hoeft te gokken hoe
              // Mollie een getal terugserialiseert.
              toeristenbelasting: tbDeel.toFixed(2),
              // Expliciet meesturen: dit is een verblijf, geen rij uit de
              // products-tabel, dus de webhook kan het tarief nergens opzoeken.
              btwPct: String(LOGIES_BTW_PCT),
            },
          }),
        });
        if (!mollieRes.ok) {
          const err = await mollieRes.json().catch(() => ({}));
          console.error("Mollie payment-link error:", err);
          return NextResponse.json({ error: "Mollie-betaling kon niet worden aangemaakt" }, { status: 500 });
        }
        const payment = await mollieRes.json();
        checkoutUrl = payment._links?.checkout?.href || null;
        testbetaling = payment.mode === "test";
        if (payment.id) {
          await sb.from("bookings").update({ mollie_payment_id: payment.id }).eq("id", bookingId);
        }
      } catch (e) {
        console.error("Mollie payment-link request failed:", e);
        return NextResponse.json({ error: "Mollie niet bereikbaar" }, { status: 500 });
      }

      // Betaalmail naar de gast. Gaat dit mis, dan bestaat de Mollie-betaling
      // wel maar weet de gast van niets. De status blijft dan staan waar hij
      // stond en we geven de checkout-URL terug, zodat de host de link zelf
      // kan doorsturen in plaats van te denken dat de mail eruit is.
      const resendKey = process.env.RESEND_API_KEY;
      let mailError: string | null = null;

      /* Testmodus: de link gaat naar de eigenaar in plaats van naar de gast,
       * en de aanvraag blijft op zijn oude status staan. Zo blijft de keten op
       * productie te testen zonder dat een gast een link krijgt waarmee niets
       * wordt afgeschreven. */
      if (testbetaling) {
        console.warn(`[send_payment_link] TESTmodus voor aanvraag ${requestId} — link niet naar de gast gestuurd`);
        if (resendKey && checkoutUrl) {
          try {
            const { Resend } = await import("resend");
            await new Resend(resendKey).emails.send({
              from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
              to: [OWNER_EMAIL],
              subject: `[TEST] Betaallink aangemaakt — ${faseLabel} ${esc(req.gast_naam || "")}`,
              html: lodgeEmail({
                title: "Testlink aangemaakt",
                intro: `Mollie staat in testmodus, dus deze link is niet naar ${esc(req.gast_email)} gestuurd. Er wordt niets afgeschreven als je hem gebruikt.`,
                blocks: [
                  infoBlock("Betaallink", `${esc(faseLabel)} (${pctLabel})`, `&euro; ${amount.toFixed(2)} &middot; Lodge ${esc(lodgeNaam)}`),
                  ctaButton(checkoutUrl, "Open de testbetaling", { prominent: true }),
                  calloutBlock(
                    "De aanvraag is niet bijgewerkt",
                    "De status blijft staan waar hij stond, dus je kunt de echte link straks gewoon versturen. Zet de live Mollie-sleutel in de omgeving om echte betalingen te kunnen doen.",
                  ),
                ],
                footer: `Aanvraag ${esc(String(requestId))} &middot; testmodus`,
              }),
            });
          } catch (e) {
            console.error("[send_payment_link] testmelding naar eigenaar mislukt:", e);
          }
        }
        return NextResponse.json({
          success: true,
          test: true,
          checkoutUrl,
          amount,
          totaal,
          fase: phase,
        });
      }

      if (!resendKey) {
        mailError = "RESEND_API_KEY ontbreekt";
      } else if (!checkoutUrl) {
        mailError = "Mollie gaf geen checkout-URL terug";
      } else {
        const { url: photoUrl } = lodgePhoto(origin, req.lodge);
        const firstName = esc((req.gast_naam || "").split(" ")[0] || "");
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(resendKey);
          const { error } = await resend.emails.send({
            from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
            to: [req.gast_email],
            subject: `${faseLabel} voor je verblijf — Huis ter Huynen`,
            html: lodgeEmail({
              photoUrl, photoAlt: `Lodge ${lodgeNaam}`,
              // De reservering is al bevestigd op het moment dat deze mail
              // uitgaat — de bevestigingsmail zegt dat de data vastliggen.
              // Deze mail mag dus niet suggereren dat de betaling dat alsnog
              // moet doen; het is de eerste betaaltermijn, niet de bevestiging.
              title: phase === "aanbetaling"
                ? `Je reservering staat vast${firstName ? `, ${firstName}` : ""}`
                : `Laatste stap${firstName ? `, ${firstName}` : ""}`,
              intro: phase === "aanbetaling"
                ? `Je reservering voor Lodge ${esc(lodgeNaam)} is bevestigd en de data staan op jouw naam. Rond nu de aanbetaling van 30% af; de resterende 70% volgt uiterlijk 30 dagen voor aankomst.`
                : `Bijna klaar! Voldoe de restbetaling en je verblijf in Lodge ${esc(lodgeNaam)} is volledig geregeld.`,
              blocks: [
                infoBlock("Je verblijf", esc(periodeLabel || "—"), `Lodge ${esc(lodgeNaam)}`),
                calloutBlock(
                  `${faseLabel} (${pctLabel})`,
                  `Te voldoen: <strong>&euro; ${amount.toFixed(2)}</strong> van het totaalbedrag van &euro; ${totaal.toFixed(2)}.`,
                ),
                ctaButton(checkoutUrl, `Betaal &euro; ${amount.toFixed(2)} via iDEAL`, { prominent: true }),
                checklist(
                  phase === "aanbetaling"
                    ? [
                        "Veilig betalen via iDEAL",
                        "Je reservering is al bevestigd &mdash; dit is de eerste betaaltermijn",
                        "De restbetaling (70%) volgt uiterlijk 30 dagen voor aankomst",
                      ]
                    : [
                        "Veilig betalen via iDEAL",
                        "Hierna is je verblijf volledig betaald",
                        "Je gast-app volgt enkele dagen voor aankomst",
                      ],
                ),
              ],
              footer: termsFooter(origin),
            }),
          });
          if (error) mailError = error.message || "Resend weigerde de mail";
        } catch (e) {
          mailError = e instanceof Error ? e.message : "Onbekende fout bij Resend";
        }
      }

      if (mailError) {
        console.error("Payment-link email failed:", mailError);
        return NextResponse.json({
          error: `De betaallink is aangemaakt, maar de mail naar de gast is niet verstuurd (${mailError}). Stuur de link hieronder zelf door.`,
          checkoutUrl,
          amount,
          totaal,
          fase: phase,
        }, { status: 502 });
      }

      await sb.from("booking_requests").update({
        status: phase === "aanbetaling" ? "aanbetaling_verstuurd" : "restbetaling_verstuurd",
      }).eq("id", requestId);

      return NextResponse.json({ success: true, checkoutUrl, amount, totaal, fase: phase });
    }
    case "add_manual_booking": {
      const { naam, platform, lodge, checkIn, checkOut } = body;
      if (!naam || !lodge || !checkIn || !checkOut) {
        return NextResponse.json({ error: "naam, lodge, checkIn en checkOut zijn verplicht" }, { status: 400 });
      }
      const nachten = Math.round((new Date(checkOut as string).getTime() - new Date(checkIn as string).getTime()) / 86400000);
      if (nachten <= 0) return NextResponse.json({ error: "Uitcheckdatum moet na inchechdatum liggen" }, { status: 400 });

      const { data, error } = await getSupabase().from("booking_requests").insert({
        bron: "handmatig",
        gast_naam: naam,
        gast_email: "",
        lodge,
        check_in: checkIn,
        check_out: checkOut,
        nachten,
        bericht: platform || null,
        status: "bevestigd",
        extra_regels: [],
      }).select("id").single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, id: data?.id });
    }
    case "delete_manual_booking": {
      if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      const { error } = await getSupabase()
        .from("booking_requests")
        .delete()
        .eq("id", body.id)
        .eq("bron", "handmatig");
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    case "reject_booking_request": {
      if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });

      const tekst = String(body.bericht ?? "").trim();
      if (tekst.length < 10) {
        return NextResponse.json({ error: "Schrijf een bericht voor de gast (minimaal 10 tekens)" }, { status: 400 });
      }
      if (tekst.length > 4000) {
        return NextResponse.json({ error: "Bericht is te lang (maximaal 4000 tekens)" }, { status: 400 });
      }

      const sb = getSupabase();
      const { data: req, error: reqErr } = await sb.from("booking_requests").select("*").eq("id", body.id).single();
      if (reqErr || !req) return NextResponse.json({ error: "Aanvraag niet gevonden" }, { status: 404 });
      if (req.status === "afgewezen") {
        return NextResponse.json({ error: "Deze aanvraag is al afgewezen" }, { status: 409 });
      }

      const { error: updErr } = await sb.from("booking_requests").update({
        status: "afgewezen",
        afwijs_reden: tekst,
        afgewezen_op: new Date().toISOString(),
      }).eq("id", body.id);
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

      if (!req.gast_email) {
        return NextResponse.json({ success: true, emailSent: false, warning: "Afgewezen — geen e-mailadres bekend, gast is niet geïnformeerd" });
      }

      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) {
        return NextResponse.json({ success: true, emailSent: false, warning: "Afgewezen — Resend niet geconfigureerd, gast is niet geïnformeerd" });
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
      const origin = new URL(appUrl).origin;
      const lodgeNaam = lodgeName(req.lodge || "lodge_1");
      const { url: photoUrl } = lodgePhoto(origin, req.lodge);
      const fmtNl = (iso: string | null) => iso
        ? new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
        : "";
      const van = req.check_in ? fmtNl(req.check_in) : (req.periode_tekst?.split("—")[0]?.trim() || "");
      const tot = req.check_out ? fmtNl(req.check_out) : (req.periode_tekst?.split("—")[1]?.trim() || "");
      const periodeLabel = van && tot ? `${van} t/m ${tot}` : (req.periode_tekst || "");

      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
          to: [req.gast_email],
          subject: "Over je aanvraag — Huis ter Huynen",
          html: rejectionEmail({
            firstName: (req.gast_naam || "").split(" ")[0] || "",
            lodgeNaam,
            photoUrl,
            periodeLabel,
            bericht: tekst,
            siteUrl: origin,
          }),
          replyTo: "lodge@huisterhuynen.nl",
        });
      } catch (e) {
        console.error("Afwijsmail versturen faalde:", e);
        return NextResponse.json({ success: true, emailSent: false, warning: "Afgewezen, maar e-mail versturen faalde — informeer de gast handmatig" });
      }

      return NextResponse.json({ success: true, emailSent: true, email: req.gast_email });
    }
    case "mark_booking_in_behandeling": {
      if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      await getSupabase().from("booking_requests").update({ status: "in_behandeling" }).eq("id", body.id);
      return NextResponse.json({ success: true });
    }
    default:
      return null;
  }
}
