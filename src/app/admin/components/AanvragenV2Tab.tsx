"use client";
import { useState } from "react";
import { BookingRequest, FeeTemplate } from "../types";
import { Badge } from "./Badge";
import { timeAgo } from "./Badge";
import {
  offerCountdown, offerExpiryDate, formatDateNl, withinGrace, graceEndDate,
  OFFER_VALID_DAYS, OFFER_GRACE_DAYS,
} from "@/lib/offer-expiry";
import { KANAAL_LABEL, type Kanaal } from "@/lib/attributie";
import { EXTERNE_PLATFORMS, externPlatform, externPlatformUitleg } from "@/lib/platform";

const BRON_LABELS: Record<string, { icon: string; label: string }> = {
  homepage:   { icon: "🏠", label: "Homepage" },
  app:        { icon: "📱", label: "App" },
  terugkomer: { icon: "↩️", label: "Terugkomer" },
  handmatig:  { icon: "✏️", label: "Handmatig" },
};

/* De platforms die het keuzemenu aanbiedt. De externe platforms staan bovenaan
 * en komen uit één lijst, zodat het menu en de blokkade op offertes en
 * betaallinks nooit uit elkaar lopen. */
const PLATFORMS = [...EXTERNE_PLATFORMS, "Direct", "Anders"];

/* Waar deze aanvraag vandaan kwam, kort genoeg voor de regel in de lijst.
 * De tooltip toont de campagne en de landingspagina — dat is wat je nodig
 * hebt om te beoordelen of een advertentie zijn geld waard was. */
function herkomst(r: BookingRequest): { label: string; titel: string } | null {
  if (!r.kanaal) return null;
  const label = KANAAL_LABEL[r.kanaal as Kanaal] ?? r.kanaal;
  const regels = [`Laatste klik: ${label}`];
  if (r.eerste_kanaal && r.eerste_kanaal !== r.kanaal) {
    regels.push(`Eerst gevonden via: ${KANAAL_LABEL[r.eerste_kanaal as Kanaal] ?? r.eerste_kanaal}`);
  }
  if (r.utm_campaign) regels.push(`Campagne: ${r.utm_campaign}`);
  if (r.utm_content) regels.push(`Advertentie: ${r.utm_content}`);
  if (r.referrer) regels.push(`Via: ${r.referrer}`);
  if (r.landing_page) regels.push(`Binnengekomen op: ${r.landing_page}`);
  return { label, titel: regels.join("\n") };
}

/* ── Fases ────────────────────────────────────────────────────────────────
 *
 * Tien losse statussen op één hoop zeggen weinig over wat er moet gebeuren.
 * De vraag die je bij dit scherm hebt is steeds dezelfde: ligt de bal bij mij,
 * bij de gast, of is het klaar? Daarom worden de statussen in vier fases
 * gegroepeerd, met blokkeringen van Booking.com apart — dat zijn geen
 * aanvragen maar dichtgezette datums. */
export type Fase = "actie" | "wachten" | "geboekt" | "gesloten" | "blokkering";

const FASE_INFO: Record<Fase, { label: string; uitleg: string; kleur: string; bedragLabel?: string }> = {
  actie:      { label: "Actie nodig",   uitleg: "Wacht op jou — offerte maken of afwijzen", kleur: "#E67E22" },
  wachten:    { label: "Wacht op gast", uitleg: "Offerte verstuurd, bal ligt bij de gast",  kleur: "#1565C0", bedragLabel: "open" },
  geboekt:    { label: "Geboekt",       uitleg: "Bevestigd — en de betaling erna",          kleur: "#2E7D32", bedragLabel: "omzet" },
  gesloten:   { label: "Gesloten",      uitleg: "Afgewezen of definitief verlopen",         kleur: "#9E9E9E", bedragLabel: "misgelopen" },
  blokkering: { label: "Blokkeringen",  uitleg: "Handmatig dichtgezet, bv. Booking.com",    kleur: "#8A7D6A" },
};

const FASE_VOLGORDE: Fase[] = ["actie", "wachten", "geboekt", "gesloten", "blokkering"];

function faseVan(r: BookingRequest): Fase {
  if (r.bron === "handmatig") return "blokkering";
  switch (r.status) {
    case "nieuw":
    case "in_behandeling":
      return "actie";
    case "offerte_verstuurd":
      return "wachten";
    case "verlopen":
      // Binnen de coulanceperiode kan de gast nog bevestigen — dat is wachten,
      // geen gesloten dossier.
      return r.offerte_vervalt_op && withinGrace(r.offerte_vervalt_op) ? "wachten" : "gesloten";
    case "afgewezen":
      return "gesloten";
    default:
      return "geboekt";
  }
}

/** Wat is hier de volgende handeling? Alleen tonen als die bij jou ligt. */
function volgendeStap(r: BookingRequest): string | null {
  /* Bij een reservering van Booking.com of Airbnb ligt er nooit een stap bij
   * ons: dat platform heeft de gast al een prijs gegeven en int het geld ook.
   * "aanbetaling versturen" hoort daar dus niet te staan — zie src/lib/platform.ts. */
  if (externPlatform(r)) return null;
  switch (r.status) {
    case "nieuw":
    case "in_behandeling":
      return "offerte maken";
    case "bevestigd":
      return "aanbetaling versturen";
    case "aanbetaling_betaald":
      return "restbetaling versturen";
    default:
      return null;
  }
}

/* Binnen een fase telt een andere volgorde. Bij 'actie' is de oudste aanvraag
 * het meest urgent, bij 'wachten' de offerte die het eerst verloopt, en bij
 * 'geboekt' de eerstvolgende aankomst. Aflopend sorteren op datum van
 * binnenkomst — de oude standaard — zette juist de urgentste regels onderaan. */
function sorteerSleutel(r: BookingRequest, fase: Fase): number {
  const tijd = (v: string | null | undefined) => (v ? Date.parse(v) : NaN);
  switch (fase) {
    case "actie":
      return tijd(r.created_at);                                   // oudste eerst
    case "wachten": {
      const vervalt = tijd(r.offerte_vervalt_op);                  // eerst verlopend eerst
      return Number.isNaN(vervalt) ? tijd(r.created_at) : vervalt;
    }
    case "geboekt":
    case "blokkering": {
      const aankomst = tijd(r.check_in);
      if (Number.isNaN(aankomst)) return Number.MAX_SAFE_INTEGER;
      // Verleden onderaan, toekomst op volgorde van aankomst.
      return aankomst < Date.now() ? Number.MAX_SAFE_INTEGER - 1 : aankomst;
    }
    default:
      return -tijd(r.created_at);                                  // recentste eerst
  }
}

/** Bedrag in Nederlandse notatie: € 1.521,15 in plaats van € 1521.15. */
function euroBedrag(n: number): string {
  return `€ ${n.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Waarde van een regel: de definitieve offerte, anders het voorstel. */
function bedragVan(r: BookingRequest): number {
  return Number(r.totaal ?? r.voorgestelde_prijs ?? 0);
}

/* Kop en regels delen één kolomdefinitie, anders lopen ze uit elkaar zodra
 * er één breedte verandert. Voorstel en status hebben ruimte nodig: een bedrag
 * van vier cijfers en een tekst als "verlopen · kan nog t/m 27 aug" botsten
 * eerder op elkaar. */
const KOLOMMEN = "90px 1fr 1fr 100px 100px 190px 100px";

const LODGE_SHORT_NAMES: Record<string, string> = {
  lodge_1: "De Heide",
  lodge_2: "De Eik",
};

const SOORT_LABEL: Record<string, { label: string; color: string }> = {
  toeslag:   { label: "Toeslag",   color: "#E67E22" },
  korting:   { label: "Korting",   color: "#2E7D32" },
  belasting: { label: "Belasting", color: "#1565C0" },
};

/** Hoe lang staat dit aanbod nog open? Alleen relevant zolang het loopt. */
function expiryNote(req: BookingRequest): { text: string; color: string } | null {
  if (req.status === "verlopen") {
    // Binnen de coulanceperiode kan de gast alsnog bevestigen — dan is het
    // nog geen verloren aanvraag, en heeft nabellen zin.
    if (req.offerte_vervalt_op && withinGrace(req.offerte_vervalt_op)) {
      const tot = new Date(`${graceEndDate(req.offerte_vervalt_op)}T00:00:00`)
        .toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
      return { text: `verlopen · kan nog t/m ${tot}`, color: "#E67E22" };
    }
    return { text: "aanbod verlopen", color: "#9E9E9E" };
  }
  if (req.status !== "offerte_verstuurd" || !req.offerte_vervalt_op) return null;

  /* De herinnering erbij: anders zie je niet of die gast al een duwtje heeft
   * gehad, en dat bepaalt of zelf nabellen zin heeft. */
  const herinnerd = req.herinnering_verstuurd_op ? " · herinnerd" : "";
  const c = offerCountdown(req.offerte_vervalt_op);
  if (c.state === "expired") return { text: `verloopt vannacht${herinnerd}`, color: "#C62828" };
  if (c.state === "today") return { text: `verloopt vandaag${herinnerd}`, color: "#C62828" };
  return {
    text: `verloopt over ${c.days} ${c.days === 1 ? "dag" : "dagen"}${herinnerd}`,
    color: c.days <= 2 ? "#E67E22" : "#8A7D6A",
  };
}

/** Startsuggestie voor de afwijsmail. De host past deze tekst zelf aan. */
function defaultRejectText(req: BookingRequest): string {
  const voornaam = (req.gast_naam || "").trim().split(" ")[0];
  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }) : "";
  const periode = req.check_in && req.check_out
    ? `${fmt(req.check_in)} t/m ${fmt(req.check_out)}`
    : (req.periode_tekst || "de gevraagde periode");

  return `Beste ${voornaam || "gast"},

Hartelijk dank voor je aanvraag voor ${periode}. Helaas kunnen we je voor deze datums geen plek aanbieden.

We hopen je een andere keer te mogen ontvangen — laat het ons gerust weten als je andere datums in gedachten hebt, dan kijken we graag met je mee.

Hartelijke groet,
Huis ter Huynen`;
}

type Soort = "toeslag" | "korting" | "belasting";

/* Een regel in de offerte. `templateId` onthoudt uit welke template in de
 * Toeslagen-tab de regel komt, zodat het keuzemenu bij die regel de juiste
 * keuze toont. Regels die de host zelf typt hebben `templateId: null`. */
type ExtraRegel = {
  label: string;
  bedrag: string;
  soort: Soort;
  templateId: string | null;
};

type OfferteForm = {
  prijsVerblijf: string;
  schoonmaak: string;
  toeristenbelasting: string;
  extraRegels: ExtraRegel[];
  /* Nodig om het bedrag van een template uit te rekenen wanneer de host er
   * later een bijkiest: per persoon en per nacht schalen mee. */
  personen: number;
  nachten: number;
  bericht: string;
};

/** Wat een template kost voor dit verblijf — dezelfde som als de prefill maakt. */
function templateBedrag(t: FeeTemplate, nachten: number, personen: number): number {
  const base = t.bedrag ?? 0;
  switch (t.basis) {
    case "eenmalig":              return base;
    case "per_nacht":             return base * nachten;
    case "per_persoon":           return base * personen;
    case "per_persoon_per_nacht": return base * personen * nachten;
    default:                      return base;
  }
}

export function AanvragenV2Tab({ requests, setRequests, feeTemplates = [] }: {
  requests: BookingRequest[];
  setRequests: (r: BookingRequest[]) => void;
  /* De templates uit de Toeslagen-tab. De offerte-editor stelt ze niet alleen
   * voor, je kunt ze er ook zelf bijkiezen — ook een template dat je net hebt
   * aangemaakt, of een die de prefill oversloeg (huisdier zonder huisdier). */
  feeTemplates?: FeeTemplate[];
}) {
  const C = { bg: "#F5F3EE", card: "#fff", border: "#E8E4DC", text: "#2A2418", muted: "#8A7D6A", light: "#B4AFA5", green: "#2F4F3E", gold: "#B49A5E" };
  const [filterBron, setFilterBron] = useState<"all" | "homepage" | "app" | "terugkomer">("all");
  const [filterFase, setFilterFase] = useState<"all" | Fase>("all");
  const [toonAlleGesloten, setToonAlleGesloten] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingPrefill, setLoadingPrefill] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, OfferteForm>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, { ok: boolean; msg: string; link?: string }>>({});
  const [payLoading, setPayLoading] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState<string | null>(null);
  const [rejectText, setRejectText] = useState("");
  const [warnings, setWarnings] = useState<Record<string, string[]>>({});
  /* Redenen waarom het versturen is geweigerd — de host beslist of hij toch doorzet. */
  const [blokkade, setBlokkade] = useState<Record<string, string[]>>({});

  const [manualOpen, setManualOpen] = useState(false);
  const [manualForm, setManualForm] = useState({ naam: "", platform: "Booking.com", lodge: "lodge_1", checkIn: "", checkOut: "" });
  const [manualSaving, setManualSaving] = useState(false);
  const [manualError, setManualError] = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: `1px solid ${C.border}`, background: C.card,
    fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box",
  };

  /* Zonder templates heeft een keuzemenu niets te kiezen; dan blijft de regel
   * zoals hij was: label, bedrag, soort. */
  const heeftTemplates = feeTemplates.length > 0;
  const regelKolommen = heeftTemplates
    ? "minmax(0,1fr) minmax(0,1fr) 110px 130px 28px"
    : "minmax(0,1fr) 110px 130px 28px";

  const openEditor = async (req: BookingRequest, editable = true) => {
    if (expandedId === req.id) {
      setExpandedId(null);
      /* Een openstaande weigering hoort niet te blijven staan tot de volgende
       * keer: bij heropenen wordt er sowieso opnieuw gecontroleerd. */
      setBlokkade(prev => { const n = { ...prev }; delete n[req.id]; return n; });
      return;
    }
    setExpandedId(req.id);
    if (!editable) return;       // betaalpaneel heeft geen prefill nodig
    if (forms[req.id]) return; // al geladen
    await loadPrefill(req);
  };

  /* Opnieuw ophalen wat de Toeslagen-tab nu voorstelt. Handig wanneer je net
   * een template hebt aangemaakt of aangepast terwijl deze offerte al openstond:
   * dan hoef je de pagina niet te verversen om hem alsnog voorgesteld te krijgen. */
  const loadPrefill = async (req: BookingRequest) => {
    setLoadingPrefill(req.id);
    try {
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "prefill_offerte", requestId: req.id }),
      });
      const d = await r.json();
      if (d.success && Array.isArray(d.waarschuwingen)) {
        setWarnings(prev => ({ ...prev, [req.id]: d.waarschuwingen }));
      }
      if (d.success && d.prefill) {
        setForms(prev => ({
          ...prev,
          [req.id]: {
            prijsVerblijf: d.prefill.verblijf > 0 ? String(d.prefill.verblijf) : "",
            schoonmaak: d.prefill.schoonmaak > 0 ? String(d.prefill.schoonmaak) : "",
            toeristenbelasting: d.prefill.toeristenbelasting > 0 ? String(d.prefill.toeristenbelasting) : "",
            extraRegels: (d.prefill.extraRegels || []).map((x: { label: string; bedrag: number; soort: string; fee_template_id?: string }) => ({
              label: x.label, bedrag: String(x.bedrag), soort: (x.soort as Soort),
              templateId: x.fee_template_id ?? null,
            })),
            personen: Number(d.prefill.personen) || req.personen || 2,
            nachten: Number(d.prefill.nachten) || req.nachten || 0,
            /* Een al getypt persoonlijk bericht blijft staan: opnieuw
             * voorstellen gaat over de bedragen, niet over jouw tekst. */
            bericht: prev[req.id]?.bericht ?? "",
          },
        }));
      }
    } catch (e) {
      console.error("Prefill failed:", e);
    }
    setLoadingPrefill(null);
  };

  const updateForm = (id: string, patch: Partial<OfferteForm>) => {
    setForms(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const addRegel = (id: string, regel: ExtraRegel) => {
    setForms(prev => ({
      ...prev,
      [id]: { ...prev[id], extraRegels: [...(prev[id]?.extraRegels || []), regel] },
    }));
  };

  /* Een regel invullen vanuit een template uit de Toeslagen-tab: label, soort
   * en het bedrag voor dít verblijf in één keer. "eigen" laat de regel leeg,
   * dan typt de host zelf. Het bedrag blijft daarna gewoon aanpasbaar. */
  const kiesTemplate = (id: string, idx: number, templateId: string) => {
    if (templateId === "") {
      updateRegel(id, idx, { templateId: null, label: "", bedrag: "" });
      return;
    }
    const t = feeTemplates.find(x => x.id === templateId);
    if (!t) return;
    const f = forms[id];
    const bedrag = templateBedrag(t, f?.nachten ?? 0, f?.personen ?? 2);
    updateRegel(id, idx, {
      templateId: t.id,
      label: t.label,
      soort: t.soort,
      bedrag: bedrag ? String(Math.round(bedrag * 100) / 100) : "",
    });
  };

  const removeRegel = (id: string, idx: number) => {
    setForms(prev => ({
      ...prev,
      [id]: { ...prev[id], extraRegels: prev[id].extraRegels.filter((_, i) => i !== idx) },
    }));
  };

  const updateRegel = (id: string, idx: number, patch: Partial<ExtraRegel>) => {
    setForms(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        extraRegels: prev[id].extraRegels.map((r, i) => i === idx ? { ...r, ...patch } : r),
      },
    }));
  };

  const computeTotal = (f: OfferteForm): number => {
    const v = parseFloat(f.prijsVerblijf) || 0;
    const s = parseFloat(f.schoonmaak) || 0;
    const t = parseFloat(f.toeristenbelasting) || 0;
    const extras = f.extraRegels.reduce((acc, r) => {
      const b = Math.abs(parseFloat(r.bedrag) || 0);
      return acc + (r.soort === "korting" ? -b : b);
    }, 0);
    return Math.max(0, v + s + t + extras);
  };

  /* `tochVersturen` zet de dubbel-aanbodcheck opzij. Dat gebeurt alleen na een
   * expliciete klik van de host, nooit vanzelf bij een nieuwe poging. */
  const sendOfferte = async (req: BookingRequest, tochVersturen = false) => {
    const f = forms[req.id];
    if (!f || !f.prijsVerblijf) return;
    const extern = externPlatform(req);
    if (extern) {
      setResult(prev => ({ ...prev, [req.id]: { ok: false, msg: externPlatformUitleg(extern) } }));
      return;
    }
    setSaving(req.id);
    setResult(prev => ({ ...prev, [req.id]: { ok: false, msg: "" } }));
    try {
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_offerte_v2",
          requestId: req.id,
          prijsVerblijf: f.prijsVerblijf,
          schoonmaak: f.schoonmaak,
          toeristenbelasting: f.toeristenbelasting,
          extraRegels: f.extraRegels.map(x => ({ label: x.label, bedrag: parseFloat(x.bedrag) || 0, soort: x.soort })),
          bericht: f.bericht,
          tochVersturen,
        }),
      });
      const d = await r.json();
      if (r.status === 409 && Array.isArray(d.blokkade)) {
        setBlokkade(prev => ({ ...prev, [req.id]: d.blokkade }));
        setSaving(null);
        return;
      }
      setBlokkade(prev => { const n = { ...prev }; delete n[req.id]; return n; });
      if (d.success) {
        setRequests(requests.map(x => x.id === req.id
          ? { ...x, status: "offerte_verstuurd", totaal: d.totaal, offerte_vervalt_op: d.vervaltOp ?? null, herinnering_verstuurd_op: null, verlopen_op: null }
          : x));
        setExpandedId(null);
        setResult(prev => ({ ...prev, [req.id]: { ok: true, msg: d.warning || `Offerte € ${Number(d.totaal).toFixed(2)} verstuurd` } }));
      } else {
        setResult(prev => ({ ...prev, [req.id]: { ok: false, msg: d.error || "Kon offerte niet versturen" } }));
      }
    } catch {
      setResult(prev => ({ ...prev, [req.id]: { ok: false, msg: "Verbindingsfout" } }));
    }
    setSaving(null);
  };

  const openReject = (req: BookingRequest) => {
    if (rejectOpen === req.id) {
      setRejectOpen(null);
      return;
    }
    setRejectOpen(req.id);
    setRejectText(defaultRejectText(req));
    setResult(p => ({ ...p, [req.id]: { ok: false, msg: "" } }));
  };

  const rejectRequest = async (req: BookingRequest) => {
    const tekst = rejectText.trim();
    if (tekst.length < 10) {
      setResult(p => ({ ...p, [req.id]: { ok: false, msg: "Schrijf eerst een bericht voor de gast" } }));
      return;
    }
    setSaving(req.id);
    try {
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_booking_request", id: req.id, bericht: tekst }),
      });
      const d = await r.json();
      if (d.success) {
        setRequests(requests.map(x => x.id === req.id ? { ...x, status: "afgewezen" } : x));
        setRejectOpen(null);
        setRejectText("");
        setExpandedId(null);
        setResult(p => ({
          ...p,
          [req.id]: {
            ok: true,
            msg: d.emailSent
              ? `Afwijzing gemaild naar ${d.email || req.gast_email}`
              : (d.warning || "Afgewezen — gast is niet geïnformeerd"),
          },
        }));
      } else {
        setResult(p => ({ ...p, [req.id]: { ok: false, msg: d.error || "Afwijzen mislukt" } }));
      }
    } catch {
      setResult(p => ({ ...p, [req.id]: { ok: false, msg: "Verbindingsfout" } }));
    }
    setSaving(null);
  };

  const markInBehandeling = async (id: string) => {
    await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_booking_in_behandeling", id }),
    });
    setRequests(requests.map(x => x.id === id ? { ...x, status: "in_behandeling" } : x));
  };

  const sendPaymentLink = async (req: BookingRequest, fase: "aanbetaling" | "restbetaling") => {
    /* Laatste hek voor de host: een reservering van een platform krijgt hier
     * geen betaallink, ook niet als deze functie langs een andere weg wordt
     * aangeroepen. De server weigert hetzelfde. */
    const extern = externPlatform(req);
    if (extern) {
      setResult(prev => ({ ...prev, [req.id]: { ok: false, msg: externPlatformUitleg(extern) } }));
      return;
    }
    if (!req.totaal || Number(req.totaal) <= 0) {
      setResult(prev => ({ ...prev, [req.id]: { ok: false, msg: "Stuur eerst een offerte" } }));
      return;
    }
    const faseLabel = fase === "aanbetaling" ? "Aanbetaling" : "Restbetaling";
    if (!confirm(`${faseLabel} (${fase === "aanbetaling" ? "30%" : "70%"}) als iDEAL-betaallink naar ${req.gast_email || "de gast"} sturen?`)) return;
    setPayLoading(`${req.id}:${fase}`);
    setResult(prev => ({ ...prev, [req.id]: { ok: false, msg: "" } }));
    try {
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_payment_link", requestId: req.id, fase }),
      });
      const d = await r.json();
      if (d.success && d.test) {
        // Mollie staat in testmodus: de gast heeft niets gekregen en de status
        // op de server is niet bijgewerkt, dus hier ook niet verspringen.
        setResult(prev => ({
          ...prev,
          [req.id]: {
            ok: false,
            msg: "Mollie staat in testmodus — de link is naar jou gemaild, niet naar de gast. De aanvraag is niet bijgewerkt.",
            link: typeof d.checkoutUrl === "string" ? d.checkoutUrl : undefined,
          },
        }));
      } else if (d.success) {
        const newStatus = fase === "aanbetaling" ? "aanbetaling_verstuurd" : "restbetaling_verstuurd";
        setRequests(requests.map(x => x.id === req.id ? { ...x, status: newStatus } : x));
        setResult(prev => ({ ...prev, [req.id]: { ok: true, msg: `${faseLabel} € ${Number(d.amount).toFixed(2)} verstuurd` } }));
      } else {
        // De server zet de status alleen op 'verstuurd' als de mail er echt
        // uit is. Kwam de betaallink wel tot stand maar de mail niet, dan
        // krijgen we die link terug om zelf door te sturen.
        setResult(prev => ({
          ...prev,
          [req.id]: {
            ok: false,
            msg: d.error || "Kon betaallink niet versturen",
            link: typeof d.checkoutUrl === "string" ? d.checkoutUrl : undefined,
          },
        }));
      }
    } catch {
      setResult(prev => ({ ...prev, [req.id]: { ok: false, msg: "Verbindingsfout" } }));
    }
    setPayLoading(null);
  };

  const saveManualBooking = async () => {
    const { naam, platform, lodge, checkIn, checkOut } = manualForm;
    if (!naam.trim() || !checkIn || !checkOut) {
      setManualError("Vul naam, inchechdatum en uitcheckdatum in.");
      return;
    }
    if (checkOut <= checkIn) {
      setManualError("Uitcheckdatum moet na inchechdatum liggen.");
      return;
    }
    setManualSaving(true);
    setManualError("");
    try {
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_manual_booking", naam: naam.trim(), platform, lodge, checkIn, checkOut }),
      });
      const d = await r.json();
      if (d.success) {
        const nachten = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
        const newReq: BookingRequest = {
          id: d.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
          bron: "handmatig", guest_id: null,
          gast_naam: naam.trim(), gast_email: "",
          lodge, check_in: checkIn, check_out: checkOut,
          nachten, personen: null, huisdieren: false,
          bericht: platform, periode_tekst: null,
          voorgestelde_prijs: null, voorgestelde_prijs_label: null, promo_code: null,
          prijs_verblijf: null, schoonmaak: null, toeristenbelasting: null,
          extra_regels: [], totaal: null, status: "bevestigd", legacy_terugkeer_id: null,
        };
        setRequests([newReq, ...requests]);
        setManualOpen(false);
        setManualForm({ naam: "", platform: "Booking.com", lodge: "lodge_1", checkIn: "", checkOut: "" });
      } else {
        setManualError(d.error || "Opslaan mislukt");
      }
    } catch {
      setManualError("Verbindingsfout");
    }
    setManualSaving(false);
  };

  const deleteManualBooking = async (id: string) => {
    if (!confirm("Handmatige blokkering verwijderen?")) return;
    await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_manual_booking", id }),
    });
    setRequests(requests.filter(r => r.id !== id));
  };

  /* Aanbiedingen die elkaar in de weg zitten.
   *
   * Twee gasten met een aanbod voor dezelfde lodge en dezelfde nachten is één
   * ja te veel: bevestigen ze allebei, dan krijgt de snelste de plek en moet de
   * ander worden teleurgesteld. Nieuwe dubbelingen worden bij het versturen
   * geweigerd; deze markering laat zien welke er nu nog openstaan. */
  const nogTeBevestigen = (r: BookingRequest): boolean => {
    if (!r.lodge || !r.check_in || !r.check_out) return false;
    if (r.status === "offerte_verstuurd") return true;
    // Een verlopen aanbod telt mee zolang de coulancedagen nog lopen.
    return r.status === "verlopen" && !!r.offerte_vervalt_op && withinGrace(r.offerte_vervalt_op);
  };

  const dubbelAanbod: Record<string, string[]> = {};
  {
    const live = requests.filter(nogTeBevestigen);
    for (const a of live) {
      for (const b of live) {
        if (a.id === b.id || a.lodge !== b.lodge) continue;
        // Dezelfde gast met twee aanbiedingen kan er maar één bevestigen.
        const zelfdeGast = (a.guest_id && a.guest_id === b.guest_id) ||
          (!!a.gast_email && a.gast_email.toLowerCase() === (b.gast_email || "").toLowerCase());
        if (zelfdeGast) continue;
        if (!(a.check_in! < b.check_out! && b.check_in! < a.check_out!)) continue;
        (dubbelAanbod[a.id] ||= []).push(b.guest?.naam || b.gast_naam || "een andere gast");
      }
    }
  }

  const zichtbaar = requests.filter(r => filterBron === "all" || r.bron === filterBron);

  /* Per fase gegroepeerd en gesorteerd. Dat is wat het overzicht terugbrengt:
   * bovenaan wat vandaag moet gebeuren, onderaan het archief. */
  const groepen = FASE_VOLGORDE.map(fase => {
    const rijen = zichtbaar
      .filter(r => faseVan(r) === fase)
      .sort((a, b) => sorteerSleutel(a, fase) - sorteerSleutel(b, fase));
    return {
      fase,
      rijen,
      bedrag: rijen.reduce((som, r) => som + bedragVan(r), 0),
    };
  });

  const zichtbareGroepen = groepen.filter(g =>
    g.rijen.length > 0 && (filterFase === "all" || g.fase === filterFase));
  const totaalZichtbaar = zichtbareGroepen.reduce((n, g) => n + g.rijen.length, 0);

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const period = (r: BookingRequest) => {
    if (r.check_in && r.check_out) {
      return `${fmtDate(r.check_in)} → ${fmtDate(r.check_out)}${r.nachten ? ` · ${r.nachten}n` : ""}`;
    }
    return r.periode_tekst || "—";
  };

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: "5px 12px", borderRadius: 14, border: `1px solid ${active ? C.green : C.border}`,
    background: active ? C.green : C.card, color: active ? "#fff" : C.muted,
    fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
  });

  const counts = {
    all: requests.length,
    homepage:   requests.filter(r => r.bron === "homepage").length,
    app:        requests.filter(r => r.bron === "app").length,
    terugkomer: requests.filter(r => r.bron === "terugkomer").length,
  };

  const euro = (n: number) => `€ ${n.toLocaleString("nl-NL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const renderEditor = (req: BookingRequest) => {
    const f = forms[req.id];
    const isLoading = loadingPrefill === req.id;
    if (isLoading || !f) {
      return <div style={{ padding: 24, fontSize: 13, color: C.muted }}>Voorstel berekenen...</div>;
    }
    const total = computeTotal(f);
    const isSaving = saving === req.id;
    const res = result[req.id];

    return (
      <div style={{ padding: "20px 24px", background: "#FAFAF7", borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: .5, marginBottom: 12, fontWeight: 500 }}>
          Offerte opbouwen
        </div>

        {(warnings[req.id] || []).length > 0 && (
          <div style={{ marginBottom: 14, padding: "12px 14px", background: "#FFF8E1", border: "1px solid #FFE0A3", borderRadius: 8 }}>
            {(warnings[req.id] || []).map((w, i) => (
              <div key={i} style={{ fontSize: 12, color: "#8A6D1B", lineHeight: 1.5, marginTop: i === 0 ? 0 : 6 }}>
                ⚠ {w}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Verblijf (€) *</label>
            <input value={f.prijsVerblijf} onChange={e => updateForm(req.id, { prijsVerblijf: e.target.value })} type="number" step="0.01" placeholder="0.00" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Eindschoonmaak (€)</label>
            <input value={f.schoonmaak} onChange={e => updateForm(req.id, { schoonmaak: e.target.value })} type="number" step="0.01" placeholder="0.00" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Toeristenbelasting (€)</label>
            <input value={f.toeristenbelasting} onChange={e => updateForm(req.id, { toeristenbelasting: e.target.value })} type="number" step="0.01" placeholder="0.00" style={inputStyle} />
          </div>
        </div>

        {f.extraRegels.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: regelKolommen, gap: 8, marginBottom: 6 }}>
              {heeftTemplates && <div style={{ fontSize: 11, color: C.muted }}>Uit toeslagen</div>}
              <div style={{ fontSize: 11, color: C.muted }}>Omschrijving</div>
              <div style={{ fontSize: 11, color: C.muted }}>Bedrag (€)</div>
              <div style={{ fontSize: 11, color: C.muted }}>Soort</div>
              <div />
            </div>
            {f.extraRegels.map((r, idx) => {
              const soort = SOORT_LABEL[r.soort];
              /* Een verwijderd template laat een regel achter waar geen keuze
               * meer bij hoort; die valt terug op de vrije omschrijving. */
              const gekozen = r.templateId && feeTemplates.some(t => t.id === r.templateId) ? r.templateId : "";
              return (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: regelKolommen, gap: 8, marginBottom: 6, alignItems: "center" }}>
                  {heeftTemplates && (
                    <select
                      value={gekozen}
                      onChange={e => kiesTemplate(req.id, idx, e.target.value)}
                      title="Kies een toeslag, korting of belasting uit de Toeslagen-tab"
                      style={inputStyle}
                    >
                      <option value="">Eigen regel…</option>
                      {feeTemplates.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.label} — {euroBedrag(templateBedrag(t, f.nachten, f.personen))}
                          {t.actief ? "" : " (uit)"}
                        </option>
                      ))}
                    </select>
                  )}
                  <input value={r.label} onChange={e => updateRegel(req.id, idx, { label: e.target.value, templateId: null })} placeholder="Label" style={inputStyle} />
                  <input value={r.bedrag} onChange={e => updateRegel(req.id, idx, { bedrag: e.target.value })} type="number" step="0.01" placeholder="0.00" style={inputStyle} />
                  <select value={r.soort} onChange={e => updateRegel(req.id, idx, { soort: e.target.value as Soort })} style={{ ...inputStyle, color: soort.color, fontWeight: 500 }}>
                    <option value="toeslag">Toeslag</option>
                    <option value="korting">Korting</option>
                    <option value="belasting">Belasting</option>
                  </select>
                  <button onClick={() => removeRegel(req.id, idx)} title="Verwijder regel" style={{
                    width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`,
                    background: C.card, color: "#E24B4A", cursor: "pointer", fontSize: 14, padding: 0,
                  }}>×</button>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginBottom: 14, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => addRegel(req.id, { label: "", bedrag: "", soort: "toeslag", templateId: null })} style={{
            padding: "8px 14px", borderRadius: 6, border: `1px dashed ${C.green}`,
            background: "transparent", fontSize: 12, fontWeight: 600, color: C.green, cursor: "pointer",
          }}>+ Extra regel</button>
          <button onClick={() => loadPrefill(req)} title="Haal de toeslagen opnieuw op — handig als je er net een hebt aangemaakt of aangepast" style={{
            padding: "8px 14px", borderRadius: 6, border: `1px solid ${C.border}`,
            background: C.card, fontSize: 12, color: C.muted, cursor: "pointer",
          }}>↻ Toeslagen opnieuw voorstellen</button>
          {heeftTemplates && (
            <span style={{ fontSize: 11, color: C.light }}>
              Kies per regel een toeslag uit de Toeslagen-tab, of typ er zelf een.
            </span>
          )}
        </div>

        <div style={{ marginBottom: 14, padding: "10px 14px", background: "#F9F4E8", borderRadius: 8, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
          Bedenktijd: <strong style={{ color: C.text }}>{OFFER_VALID_DAYS} dagen</strong> — geldig t/m{" "}
          <strong style={{ color: C.text }}>{formatDateNl(offerExpiryDate(req.check_in))}</strong>.
          De gast krijgt 2 dagen ervoor een herinnering; daarna vervalt het aanbod automatisch.
          De bevestigingslink blijft daarna nog {OFFER_GRACE_DAYS} dagen werken als laatste kans.
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Persoonlijk bericht (optioneel)</label>
          <textarea value={f.bericht} onChange={e => updateForm(req.id, { bericht: e.target.value })}
            placeholder="Welkom! We verheugen ons op jullie komst..."
            rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
        </div>

        {rejectOpen === req.id && (
          <div style={{ marginBottom: 16, padding: "16px 18px", background: "#FFF6F5", border: "1px solid #F3D5D2", borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: "#C62828", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8, fontWeight: 600 }}>
              Afwijzen — bericht aan de gast
            </div>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
              Deze tekst gaat als e-mail naar {req.gast_email || "de gast"}. Pas hem gerust aan — hij wordt precies zo verstuurd.
            </p>
            <textarea
              value={rejectText}
              onChange={e => setRejectText(e.target.value)}
              rows={9}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
            />
            {!req.gast_email && (
              <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 8 }}>
                Let op: bij deze aanvraag is geen e-mailadres bekend. De aanvraag wordt wel afgewezen, maar de gast krijgt geen bericht.
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button onClick={() => setRejectOpen(null)} disabled={isSaving} style={{
                padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
                background: C.card, fontSize: 12, color: C.muted, cursor: isSaving ? "not-allowed" : "pointer",
              }}>Annuleren</button>
              <button onClick={() => rejectRequest(req)} disabled={isSaving} style={{
                padding: "8px 20px", borderRadius: 8, border: "none",
                background: isSaving ? C.border : "#C62828",
                fontSize: 12, fontWeight: 500, color: "#fff", cursor: isSaving ? "not-allowed" : "pointer",
              }}>{isSaving ? "Versturen..." : "Wijs af en mail gast →"}</button>
            </div>
          </div>
        )}

        {(blokkade[req.id] || []).length > 0 && (
          <div style={{ marginBottom: 16, padding: "16px 18px", background: "#FFF6F5", border: "1px solid #F3D5D2", borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: "#C62828", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8, fontWeight: 600 }}>
              Niet verstuurd — deze nachten liggen al bij iemand anders
            </div>
            {(blokkade[req.id] || []).map((b, i) => (
              <div key={i} style={{ fontSize: 12, color: "#8A3A38", lineHeight: 1.5, marginTop: i === 0 ? 0 : 6 }}>• {b}</div>
            ))}
            <p style={{ margin: "10px 0 0", fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
              Wijs deze aanvraag af, bied de andere lodge of andere datums aan, of wacht tot het
              andere aanbod vervalt. Zet je toch door, dan hebben twee gasten hetzelfde aanbod —
              wie het eerst bevestigt krijgt de plek en de ander moet je zelf teleurstellen.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => setBlokkade(prev => { const n = { ...prev }; delete n[req.id]; return n; })}
                disabled={isSaving}
                style={{
                  padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
                  background: C.card, fontSize: 12, color: C.muted, cursor: isSaving ? "not-allowed" : "pointer",
                }}
              >Annuleren</button>
              <button
                onClick={() => sendOfferte(req, true)}
                disabled={isSaving}
                title="Verstuur het aanbod ondanks de dubbeling"
                style={{
                  padding: "8px 20px", borderRadius: 8, border: "1px solid #C62828",
                  background: C.card, fontSize: 12, fontWeight: 500,
                  color: "#C62828", cursor: isSaving ? "not-allowed" : "pointer",
                }}
              >{isSaving ? "Versturen..." : "Toch versturen →"}</button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: C.green }}>
            Totaal: € {total.toFixed(2)}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {res && !res.ok && res.msg && (
              <span style={{ fontSize: 12, color: "#E24B4A" }}>{res.msg}</span>
            )}
            <button onClick={() => openReject(req)} disabled={isSaving} style={{
              padding: "8px 16px", borderRadius: 8,
              border: `1px solid ${rejectOpen === req.id ? "#C62828" : C.border}`,
              background: C.card, fontSize: 12, color: "#E24B4A", cursor: isSaving ? "not-allowed" : "pointer",
            }}>{rejectOpen === req.id ? "Afwijzen sluiten" : "Wijs af"}</button>
            {req.status === "nieuw" && (
              <button onClick={() => markInBehandeling(req.id)} disabled={isSaving} style={{
                padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
                background: C.card, fontSize: 12, color: C.muted, cursor: isSaving ? "not-allowed" : "pointer",
              }}>In behandeling</button>
            )}
            <button onClick={() => sendOfferte(req)} disabled={!f.prijsVerblijf || isSaving} style={{
              padding: "8px 20px", borderRadius: 8, border: "none",
              background: f.prijsVerblijf && !isSaving ? C.green : C.border,
              fontSize: 12, fontWeight: 500, color: "#fff", cursor: f.prijsVerblijf && !isSaving ? "pointer" : "not-allowed",
            }}>{isSaving ? "Versturen..." : "Verstuur offerte →"}</button>
          </div>
        </div>
      </div>
    );
  };

  const renderPayment = (req: BookingRequest) => {
    const totaal = Number(req.totaal) || 0;
    const deposit = Math.round(totaal * 0.30 * 100) / 100;
    const rest = Math.round((totaal - deposit) * 100) / 100;
    const res = result[req.id];

    const depositSent = ["aanbetaling_verstuurd", "aanbetaling_betaald", "restbetaling_verstuurd", "volledig_betaald"].includes(req.status);
    const depositPaid = ["aanbetaling_betaald", "restbetaling_verstuurd", "volledig_betaald"].includes(req.status);
    const finalSent = ["restbetaling_verstuurd", "volledig_betaald"].includes(req.status);
    const finalPaid = req.status === "volledig_betaald";

    const row = (
      label: string, pct: string, amount: number,
      fase: "aanbetaling" | "restbetaling",
      sent: boolean, paid: boolean, enabled: boolean,
    ) => {
      const busy = payLoading === `${req.id}:${fase}`;
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.card }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{label} <span style={{ color: C.muted, fontWeight: 400 }}>({pct})</span></div>
            <div style={{ fontSize: 16, fontWeight: 500, color: C.green }}>€ {amount.toFixed(2)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {paid
              ? <span style={{ fontSize: 12, color: "#2E7D32", fontWeight: 600 }}>✓ betaald</span>
              : sent
                ? <span style={{ fontSize: 12, color: "#F9A825", fontWeight: 600 }}>● link verstuurd</span>
                : null}
            <button
              onClick={() => sendPaymentLink(req, fase)}
              disabled={!enabled || busy || paid}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "none",
                background: (enabled && !paid) ? C.green : C.border,
                fontSize: 12, fontWeight: 500, color: "#fff",
                cursor: (enabled && !busy && !paid) ? "pointer" : "not-allowed",
              }}
            >
              {busy ? "Versturen..." : sent ? "Opnieuw sturen" : "Stuur betaallink"}
            </button>
          </div>
        </div>
      );
    };

    return (
      <div style={{ padding: "20px 24px", background: "#FAFAF7", borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: .5, marginBottom: 12, fontWeight: 500 }}>
          Betaling in termijnen
        </div>
        {totaal <= 0 ? (
          <div style={{ fontSize: 13, color: "#E24B4A" }}>Geen totaalbedrag bekend — stuur eerst een offerte.</div>
        ) : (
          <>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
              Totaal bevestigd: <strong style={{ color: C.text }}>€ {totaal.toFixed(2)}</strong>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {row("Aanbetaling", "30%", deposit, "aanbetaling", depositSent, depositPaid, true)}
              {row("Restbetaling", "70%", rest, "restbetaling", finalSent, finalPaid, depositPaid || finalSent)}
            </div>
            {!depositPaid && (
              <div style={{ fontSize: 11, color: C.light, marginTop: 10 }}>
                De restbetaling wordt actief zodra de aanbetaling is voldaan.
              </div>
            )}
            {res && !res.ok && res.msg && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, color: "#E24B4A" }}>{res.msg}</div>
                {res.link && (
                  <div style={{ marginTop: 6, padding: "8px 10px", background: "#FFF3F3", border: "1px solid #F5C6C4", borderRadius: 6 }}>
                    <a
                      href={res.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11, color: C.green, wordBreak: "break-all", textDecoration: "none" }}
                    >
                      {res.link}
                    </a>
                    <button
                      onClick={() => navigator.clipboard?.writeText(res.link || "")}
                      style={{
                        marginLeft: 8, padding: "3px 8px", borderRadius: 5,
                        border: `1px solid ${C.border}`, background: "#fff",
                        fontSize: 11, color: C.text, cursor: "pointer",
                      }}
                    >
                      Kopieer
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  /* Eén regel in de lijst. Zat vroeger inline in de map; nu een functie,
   * zodat elke fasegroep dezelfde rij kan tekenen. */
  const renderRij = (r: BookingRequest) => {
        const bron = BRON_LABELS[r.bron] || { icon: "·", label: r.bron };
        const name = r.guest?.naam || r.gast_naam || "—";
        const email = r.guest?.email || r.gast_email || "";
        const lodge = r.lodge ? (LODGE_SHORT_NAMES[r.lodge] || r.lodge) : "—";
        const isExpanded = expandedId === r.id;
        /* Booking.com en Airbnb doen prijs, offerte en betaling zelf. Zo'n regel
         * staat hier alleen om de datums dicht te zetten, dus gaan de offerte-
         * en betaalpanelen er niet open: dan is er ook niets om per ongeluk te
         * versturen naar een gast die allang betaald heeft. */
        const platform = externPlatform(r);
        // Verlopen aanvragen blijven bewerkbaar: een nieuwe offerte start de bedenktijd opnieuw.
        const isEditable = !platform && (r.status === "nieuw" || r.status === "in_behandeling" || r.status === "offerte_verstuurd" || r.status === "verlopen");
    const fase = faseVan(r);
    const toonAankomst = fase === "geboekt" || fase === "blokkering";
    const stap = volgendeStap(r);
        const isPayable = !platform && (r.status === "bevestigd" || r.status === "aanbetaling_verstuurd" || r.status === "aanbetaling_betaald" || r.status === "restbetaling_verstuurd" || r.status === "volledig_betaald");
        const isExpandable = isEditable || isPayable;
        const res = result[r.id];

        return (
          <div key={r.id} style={{ borderTop: `1px solid ${C.border}` }}>
            <div
              onClick={() => isExpandable && openEditor(r, isEditable)}
              style={{
                display: "grid", gridTemplateColumns: KOLOMMEN, columnGap: 14,
                padding: "14px 16px", fontSize: 13, color: C.text, alignItems: "start",
                cursor: isExpandable ? "pointer" : "default",
                background: isExpanded ? "#FAFAF7" : "transparent",
              }}
            >
              <div title={bron.label} style={{ fontSize: 14, lineHeight: "20px" }}>
                {bron.icon} <span style={{ fontSize: 11, color: C.muted }}>{bron.label}</span>
                {herkomst(r) && (
                  <div title={herkomst(r)!.titel} style={{ fontSize: 10, color: C.gold, marginTop: 2, fontWeight: 600 }}>
                    {herkomst(r)!.label}
                  </div>
                )}
              </div>
              <div style={{ lineHeight: "20px" }}>
                <div style={{ fontWeight: 500 }}>{name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{email}</div>
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: "20px" }}>
                {period(r)}
                <div style={{ fontSize: 11 }}>
                  {r.bron === "handmatig" && r.bericht && (
                    <span style={{ color: C.gold, fontWeight: 600 }}>{r.bericht}</span>
                  )}
                  {r.bron !== "handmatig" && (r.personen ?? 0) > 0 && `${r.personen}p`}
                  {r.bron !== "handmatig" && r.huisdieren && <span style={{ marginLeft: 6 }}>🐾</span>}
                  {r.bron !== "handmatig" && r.promo_code && <span style={{ marginLeft: 6, color: C.gold }}>{r.promo_code}</span>}
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: "20px" }}>{lodge}</div>
              <div style={{ textAlign: "right", fontWeight: 500, whiteSpace: "nowrap", lineHeight: "20px", color: r.voorgestelde_prijs || r.totaal ? C.text : C.light }}>
                {r.totaal ? euroBedrag(Number(r.totaal)) : (r.voorgestelde_prijs ? euroBedrag(Number(r.voorgestelde_prijs)) : "—")}
              </div>
              <div style={{ lineHeight: "20px" }}>
                <Badge status={r.status} />
                {(dubbelAanbod[r.id] || []).length > 0 && (
                  <div
                    title={`Dezelfde lodge en nachten liggen ook bij ${dubbelAanbod[r.id].join(", ")}. Bevestigen ze allebei, dan krijgt de snelste de plek.`}
                    style={{ fontSize: 11, color: "#C62828", marginTop: 2, fontWeight: 600 }}
                  >
                    ⚠ ook aangeboden aan {dubbelAanbod[r.id].join(", ")}
                  </div>
                )}
                {platform
                  ? <div title={externPlatformUitleg(platform)} style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                      betaling via {platform}
                    </div>
                  : expiryNote(r)
                    ? <div style={{ fontSize: 11, color: expiryNote(r)!.color, marginTop: 2 }}>{expiryNote(r)!.text}</div>
                    : stap && <div style={{ fontSize: 11, color: C.gold, marginTop: 2 }}>{stap}</div>}
                {res?.ok && <div style={{ fontSize: 11, color: "#2E7D32", marginTop: 2 }}>✓ {res.msg}</div>}
              </div>
              {/* Laatste kolom volgt de fase: bij lopende aanvragen telt hoe
                  lang ze al wachten, bij een boeking wanneer de gast komt. */}
              <div style={{ textAlign: "right", fontSize: 12, color: C.muted, lineHeight: "20px", whiteSpace: "nowrap" }}>
                {toonAankomst ? (
                  <span title={r.check_in ? `Aankomst ${fmtDate(r.check_in)}` : undefined}>
                    {r.check_in ? fmtDate(r.check_in) : "—"}
                  </span>
                ) : (
                  <span title={`Binnengekomen op ${new Date(r.created_at).toLocaleString("nl-NL")}`}>
                    {timeAgo(r.created_at)}
                  </span>
                )}
                {r.bron === "handmatig" && (
                  <button
                    onClick={e => { e.stopPropagation(); deleteManualBooking(r.id); }}
                    title="Verwijder blokkering"
                    style={{ background: "none", border: "none", color: "#C62828", fontSize: 16, cursor: "pointer", padding: "0 0 0 8px" }}
                  >×</button>
                )}
                {isExpandable && <div style={{ fontSize: 10, color: C.gold, marginTop: 2 }}>{isExpanded ? "▲" : "▼"}</div>}
              </div>
            </div>
            {isExpanded && (isEditable ? renderEditor(r) : renderPayment(r))}
          </div>
        );
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: C.text }}>Aanvragen</div>
        <button
          onClick={() => { setManualOpen(o => !o); setManualError(""); }}
          style={{
            padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.green}`,
            background: manualOpen ? C.green : C.card, color: manualOpen ? "#fff" : C.green,
            fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}
        >
          {manualOpen ? "Annuleren" : "+ Handmatige boeking"}
        </button>
      </div>
      <div style={{ fontSize: 13, color: C.light, marginBottom: manualOpen ? 12 : 20 }}>
        Alle aanvragen uit alle bronnen — homepage, concierge-app en terugkomers — in één overzicht. Klik op een aanvraag om een offerte op te bouwen.
      </div>

      {manualOpen && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 14 }}>Datums blokkeren</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Naam gast *</label>
              <input
                value={manualForm.naam}
                onChange={e => setManualForm(f => ({ ...f, naam: e.target.value }))}
                placeholder="bijv. Jan de Vries"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Platform</label>
              <select
                value={manualForm.platform}
                onChange={e => setManualForm(f => ({ ...f, platform: e.target.value }))}
                style={inputStyle}
              >
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Lodge</label>
              <select
                value={manualForm.lodge}
                onChange={e => setManualForm(f => ({ ...f, lodge: e.target.value }))}
                style={inputStyle}
              >
                <option value="lodge_1">De Heide</option>
                <option value="lodge_2">De Eik</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Inchechdatum *</label>
              <input
                type="date"
                value={manualForm.checkIn}
                onChange={e => setManualForm(f => ({ ...f, checkIn: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Uitcheckdatum *</label>
              <input
                type="date"
                value={manualForm.checkOut}
                onChange={e => setManualForm(f => ({ ...f, checkOut: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>
          {EXTERNE_PLATFORMS.includes(manualForm.platform as (typeof EXTERNE_PLATFORMS)[number]) && (
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 12, padding: "10px 12px", background: "#F9F4E8", borderRadius: 8 }}>
              {manualForm.platform} regelt zelf de prijsafspraak en de betaling. Deze reservering zet alleen
              de datums dicht — er gaat geen offerte en geen betaallink naar de gast.
            </div>
          )}
          {manualError && (
            <div style={{ fontSize: 12, color: "#C62828", marginBottom: 12 }}>{manualError}</div>
          )}
          <button
            onClick={saveManualBooking}
            disabled={manualSaving}
            style={{
              padding: "9px 20px", borderRadius: 8, border: "none",
              background: manualSaving ? C.border : C.green,
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: manualSaving ? "not-allowed" : "pointer",
            }}
          >
            {manualSaving ? "Opslaan..." : "Datums blokkeren →"}
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setFilterBron("all")} style={chipStyle(filterBron === "all")}>Alle bronnen ({counts.all})</button>
        <button onClick={() => setFilterBron("homepage")}   style={chipStyle(filterBron === "homepage")}>🏠 Homepage ({counts.homepage})</button>
        <button onClick={() => setFilterBron("app")}        style={chipStyle(filterBron === "app")}>📱 App ({counts.app})</button>
        <button onClick={() => setFilterBron("terugkomer")} style={chipStyle(filterBron === "terugkomer")}>↩️ Terugkomer ({counts.terugkomer})</button>
      </div>

      {/* Samenvatting per fase — meteen ook het filter. Vervangt de rij met
          ruwe statusnamen: die vertelde wel hoe het heet, niet wat het betekent. */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
        {FASE_VOLGORDE.map(f => {
          const g = groepen.find(x => x.fase === f)!;
          const info = FASE_INFO[f];
          const actief = filterFase === f;
          return (
            <button
              key={f}
              onClick={() => setFilterFase(actief ? "all" : f)}
              title={`${info.uitleg}${actief ? " — klik om het filter op te heffen" : ""}`}
              style={{
                textAlign: "left", cursor: "pointer", padding: "12px 14px", borderRadius: 12,
                border: `1px solid ${actief ? info.kleur : C.border}`,
                background: actief ? "#FAFAF7" : C.card,
                boxShadow: actief ? `inset 3px 0 0 ${info.kleur}` : "none",
                opacity: g.rijen.length === 0 ? .55 : 1,
              }}
            >
              <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: .5, fontWeight: 500 }}>
                {info.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color: g.rijen.length ? info.kleur : C.light, lineHeight: 1.3 }}>
                {g.rijen.length}
              </div>
              <div style={{ fontSize: 11, color: C.light }}>
                {info.bedragLabel && g.bedrag > 0 ? `${euro(g.bedrag)} ${info.bedragLabel}` : info.uitleg}
              </div>
            </button>
          );
        })}
      </div>

      {totaalZichtbaar === 0 && (
        <div style={{ fontSize: 13, color: C.light, padding: 40, textAlign: "center", background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
          Geen aanvragen in deze selectie
        </div>
      )}

      {zichtbareGroepen.map(g => {
        const info = FASE_INFO[g.fase];
        /* Het archief hoort niet het scherm te vullen: gesloten dossiers staan
         * ingeklapt tot je ze opvraagt. */
        const inklapbaar = g.fase === "gesloten" && filterFase === "all" && g.rijen.length > 5;
        const rijen = inklapbaar && !toonAlleGesloten ? g.rijen.slice(0, 5) : g.rijen;

        return (
          <div key={g.fase} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${C.border}`, borderLeft: `3px solid ${info.kleur}` }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{info.label}</span>
              <span style={{ fontSize: 12, color: C.muted }}>{g.rijen.length}</span>
              {info.bedragLabel && g.bedrag > 0 && (
                <span style={{ fontSize: 12, color: C.muted }}>· {euro(g.bedrag)} {info.bedragLabel}</span>
              )}
              <span style={{ fontSize: 11, color: C.light, marginLeft: "auto" }}>{info.uitleg}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: KOLOMMEN, columnGap: 14, padding: "10px 16px", background: C.bg, fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: .5, fontWeight: 500 }}>
              <div>Bron</div>
              <div>Gast</div>
              <div>Periode</div>
              <div>Lodge</div>
              <div style={{ textAlign: "right" }}>Voorstel</div>
              <div>Status</div>
              <div style={{ textAlign: "right" }}>{g.fase === "geboekt" || g.fase === "blokkering" ? "Aankomst" : "Ontvangen"}</div>
            </div>

            {rijen.map(renderRij)}

            {inklapbaar && (
              <button
                onClick={() => setToonAlleGesloten(!toonAlleGesloten)}
                style={{
                  width: "100%", padding: "10px 16px", border: "none", borderTop: `1px solid ${C.border}`,
                  background: C.bg, color: C.muted, fontSize: 12, cursor: "pointer",
                }}
              >
                {toonAlleGesloten ? "Toon minder" : `Toon alle ${g.rijen.length} gesloten aanvragen`}
              </button>
            )}
          </div>
        );
      })}

    </>
  );
}
