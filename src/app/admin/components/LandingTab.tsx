"use client";
import { useState } from "react";
import { LandingPageRow, LandingSection } from "../types";
import { slugify } from "./BlogTab";
import { PUBLIC_IMAGES } from "@/lib/site";

type LandingSectionForm = { eyebrow: string; heading: string; bodyText: string; bulletsText: string };
type LandingForm = {
  id: string; slug: string; breadcrumb: string; eyebrow: string; h1: string;
  hero_sub: string; hero_image: string; hero_image_alt: string; price_from: string;
  intro: string; sections: LandingSectionForm[]; faq: string; related: string;
  cta_title: string; cta_body: string; meta_title: string; meta_description: string;
  og_image: string; sort_order: number;
};

const EMPTY_LANDING: LandingForm = {
  id: "", slug: "", breadcrumb: "", eyebrow: "", h1: "",
  hero_sub: "", hero_image: "/lodge-heide.jpg", hero_image_alt: "", price_from: "Vanaf €165 per nacht",
  intro: "", sections: [{ eyebrow: "", heading: "", bodyText: "", bulletsText: "" }],
  faq: "", related: "", cta_title: "", cta_body: "", meta_title: "", meta_description: "",
  og_image: "", sort_order: 0,
};

function landingToForm(p: LandingPageRow): LandingForm {
  return {
    id: p.id, slug: p.slug, breadcrumb: p.breadcrumb, eyebrow: p.eyebrow, h1: p.h1,
    hero_sub: p.hero_sub, hero_image: p.hero_image || "/lodge-heide.jpg", hero_image_alt: p.hero_image_alt,
    price_from: p.price_from, intro: p.intro,
    sections: (Array.isArray(p.sections) ? p.sections : []).map((s: LandingSection) => ({
      eyebrow: s.eyebrow || "", heading: s.heading || "",
      bodyText: (s.body || []).join("\n\n"),
      bulletsText: (s.bullets || []).join("\n"),
    })),
    faq: p.faq || "", related: p.related || "",
    cta_title: p.cta_title, cta_body: p.cta_body,
    meta_title: p.meta_title, meta_description: p.meta_description,
    og_image: p.og_image || "", sort_order: p.sort_order || 0,
  };
}

function landingFormToPayload(f: LandingForm) {
  const sections = f.sections
    .filter(s => s.heading.trim() || s.bodyText.trim() || s.bulletsText.trim())
    .map(s => ({
      ...(s.eyebrow.trim() ? { eyebrow: s.eyebrow.trim() } : {}),
      heading: s.heading.trim(),
      body: s.bodyText.split(/\n\n+/).map(x => x.trim()).filter(Boolean),
      ...(s.bulletsText.trim() ? { bullets: s.bulletsText.split("\n").map(x => x.trim()).filter(Boolean) } : {}),
    }));
  return {
    slug: f.slug, breadcrumb: f.breadcrumb, eyebrow: f.eyebrow, h1: f.h1,
    hero_sub: f.hero_sub, hero_image: f.hero_image, hero_image_alt: f.hero_image_alt,
    price_from: f.price_from, intro: f.intro, sections, faq: f.faq, related: f.related,
    cta_title: f.cta_title, cta_body: f.cta_body, meta_title: f.meta_title,
    meta_description: f.meta_description, og_image: f.og_image, sort_order: f.sort_order,
  };
}

export function LandingTab({ pages, setPages }: { pages: LandingPageRow[]; setPages: (p: LandingPageRow[]) => void }) {
  const C = { bg: "#F5F3EE", card: "#fff", border: "#E8E4DC", text: "#2A2418", muted: "#8A7D6A", light: "#B4AFA5", green: "#2F4F3E", gold: "#B49A5E" };
  const [view, setView] = useState<"list" | "edit">("list");
  const [form, setForm] = useState<LandingForm>(EMPTY_LANDING);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState("");
  const creating = !form.id;

  const reload = async () => {
    const res = await fetch("/api/admin/data?table=landing_pages");
    const data = await res.json();
    setPages(data.data || []);
  };

  const startNew = () => { setForm(EMPTY_LANDING); setMsg(""); setView("edit"); };
  const startEdit = (p: LandingPageRow) => { setForm(landingToForm(p)); setMsg(""); setView("edit"); };
  const backToList = () => { setView("list"); setForm(EMPTY_LANDING); setMsg(""); };

  const save = async (publishAfter = false) => {
    if (!form.slug || !form.h1) { setMsg("Slug en H1 zijn verplicht"); return; }

    setSaving(true); setMsg("");
    const action = creating ? "create_landing_page" : "update_landing_page";
    const res = await fetch("/api/admin/data", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id: form.id, ...landingFormToPayload(form) }),
    });
    const data = await res.json();
    if (data.error) { setMsg(data.error); setSaving(false); return; }
    if (publishAfter) {
      const id = creating ? data.data?.id : form.id;
      if (id) await fetch("/api/admin/data", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish_landing_page", id, gepubliceerd: true }),
      });
    }
    await reload(); backToList(); setSaving(false);
  };

  const togglePublish = async (p: LandingPageRow) => {
    await fetch("/api/admin/data", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish_landing_page", id: p.id, gepubliceerd: !p.gepubliceerd }),
    });
    await reload();
  };

  const del = async (p: LandingPageRow) => {
    if (!confirm(`Landingspagina "${p.h1}" verwijderen?`)) return;
    await fetch("/api/admin/data", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_landing_page", id: p.id }),
    });
    await reload();
  };

  const importSeed = async () => {
    if (!confirm("Alle standaard-landingspagina's importeren en herstellen? Bestaande pagina's met dezelfde slug worden bijgewerkt met de standaard-inhoud. Uw handmatige aanpassingen aan seed-pagina's worden overschreven.")) return;
    setImporting(true);
    const res = await fetch("/api/admin/data", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "import_landing_seed" }),
    });
    const data = await res.json();
    await reload();
    setImporting(false);
    setMsg(data.error ? data.error : `${data.imported ?? 0} pagina('s) geïmporteerd.`);
  };

  const addSection = () => setForm(f => ({ ...f, sections: [...f.sections, { eyebrow: "", heading: "", bodyText: "", bulletsText: "" }] }));
  const removeSection = (i: number) => setForm(f => ({ ...f, sections: f.sections.filter((_, j) => j !== i) }));
  const updateSection = (i: number, key: keyof LandingSectionForm, val: string) =>
    setForm(f => ({ ...f, sections: f.sections.map((s, j) => j === i ? { ...s, [key]: val } : s) }));

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: `1px solid ${C.border}`, fontFamily: "inherit",
    fontSize: 13, color: C.text, background: "#fff", boxSizing: "border-box",
  };
  const lab: React.CSSProperties = { display: "block", fontSize: 11, color: C.muted, marginBottom: 4 };

  const imageOptions = PUBLIC_IMAGES.includes(form.hero_image) ? PUBLIC_IMAGES : [form.hero_image, ...PUBLIC_IMAGES];

  // ── Lijst ──
  if (view === "list") return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>Landingspagina&apos;s</h2>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
            SEO-landingspagina&apos;s. Verschijnen op huisterhuynen.nl/&lt;slug&gt; zodra ze gepubliceerd zijn.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={importSeed} disabled={importing} style={{
            padding: "10px 18px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: "#fff", color: C.green, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            {importing ? "Importeren..." : "Importeer standaardpagina's"}
          </button>
          <button onClick={startNew} style={{
            padding: "10px 20px", borderRadius: 8, border: "none",
            background: C.green, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            + Nieuwe pagina
          </button>
        </div>
      </div>

      {msg && <p style={{ fontSize: 12, color: C.green, margin: "0 0 16px" }}>{msg}</p>}

      {pages.length === 0 ? (
        <p style={{ fontSize: 13, color: C.muted }}>
          Nog geen landingspagina&apos;s in de database. Klik op &quot;Importeer standaardpagina&apos;s&quot; om de 7 bestaande pagina&apos;s in te laden en daarna te bewerken, of maak een nieuwe.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pages.map(p => (
            <div key={p.id} style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
              opacity: p.gepubliceerd ? 1 : 0.75,
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                    background: p.gepubliceerd ? "#E8F5E9" : "#F5F5F5",
                    color: p.gepubliceerd ? "#2E7D32" : C.muted,
                  }}>
                    {p.gepubliceerd ? "GEPUBLICEERD" : "CONCEPT"}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.h1}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>/{p.slug}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {p.gepubliceerd && (
                  <a href={`/${p.slug}`} target="_blank" rel="noopener" style={{
                    padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
                    background: "#fff", fontSize: 12, color: C.green, cursor: "pointer", textDecoration: "none",
                  }}>Bekijk</a>
                )}
                <button onClick={() => startEdit(p)} style={{
                  padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
                  background: "#fff", fontSize: 12, color: C.text, cursor: "pointer",
                }}>Bewerk</button>
                <button onClick={() => togglePublish(p)} style={{
                  padding: "5px 12px", borderRadius: 6, border: "none",
                  background: p.gepubliceerd ? "#FFF3E0" : C.green,
                  color: p.gepubliceerd ? "#E67E22" : "#fff",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>
                  {p.gepubliceerd ? "Depubliceer" : "Publiceer"}
                </button>
                <button onClick={() => del(p)} style={{
                  padding: "5px 10px", borderRadius: 6, border: "1px solid #FFCDD2",
                  background: "#fff", fontSize: 12, color: "#C62828", cursor: "pointer",
                }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Editor ──
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={backToList} style={{
          padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
          background: "#fff", fontSize: 12, color: C.muted, cursor: "pointer",
        }}>← Terug</button>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0 }}>
          {creating ? "Nieuwe landingspagina" : "Pagina bewerken"}
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 760 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={lab}>H1 (kop op de pagina) *</label>
            <input value={form.h1} onChange={e => setForm(f => ({ ...f, h1: e.target.value }))}
              placeholder="Bijv. Vakantiehuis met privé-hottub in Drenthe" style={inp} />
          </div>
          <div>
            <label style={lab}>URL slug *</label>
            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
              placeholder="bijv. vakantiehuis-met-hottub-drenthe" style={inp} />
            <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>/{form.slug || "..."}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={lab}>Eyebrow (klein label boven de titel)</label>
            <input value={form.eyebrow} onChange={e => setForm(f => ({ ...f, eyebrow: e.target.value }))}
              placeholder="Bijv. Privé hottub · Zeijen · Drenthe" style={inp} />
          </div>
          <div>
            <label style={lab}>Breadcrumb-label</label>
            <input value={form.breadcrumb} onChange={e => setForm(f => ({ ...f, breadcrumb: e.target.value }))}
              placeholder="Bijv. Vakantiehuis met hottub Drenthe" style={inp} />
          </div>
        </div>

        <div>
          <label style={lab}>Hero-ondertitel</label>
          <textarea value={form.hero_sub} onChange={e => setForm(f => ({ ...f, hero_sub: e.target.value }))}
            rows={2} style={{ ...inp, resize: "vertical" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={lab}>Hero-afbeelding</label>
            <select value={form.hero_image} onChange={e => setForm(f => ({ ...f, hero_image: e.target.value }))} style={inp}>
              {imageOptions.map(img => <option key={img} value={img}>{img}</option>)}
            </select>
          </div>
          <div>
            <label style={lab}>Prijs-label (hero)</label>
            <input value={form.price_from} onChange={e => setForm(f => ({ ...f, price_from: e.target.value }))}
              placeholder="Vanaf €165 per nacht" style={inp} />
          </div>
        </div>

        <div>
          <label style={lab}>Alt-tekst hero-afbeelding (beschrijf wat er op de foto staat)</label>
          <input value={form.hero_image_alt} onChange={e => setForm(f => ({ ...f, hero_image_alt: e.target.value }))} style={inp} />
        </div>

        <div>
          <label style={lab}>Intro (inleidende alinea)</label>
          <textarea value={form.intro} onChange={e => setForm(f => ({ ...f, intro: e.target.value }))}
            rows={3} style={{ ...inp, resize: "vertical" }} />
        </div>

        {/* Secties */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Inhoudssecties</label>
            <button onClick={addSection} style={{
              padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
              background: "#fff", fontSize: 12, color: C.green, fontWeight: 600, cursor: "pointer",
            }}>+ Sectie toevoegen</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {form.sections.map((s, i) => (
              <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>Sectie {i + 1}</span>
                  <button onClick={() => removeSection(i)} style={{
                    padding: "3px 10px", borderRadius: 6, border: "1px solid #FFCDD2",
                    background: "#fff", fontSize: 11, color: "#C62828", cursor: "pointer",
                  }}>Verwijder</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8, marginBottom: 8 }}>
                  <input value={s.eyebrow} onChange={e => updateSection(i, "eyebrow", e.target.value)}
                    placeholder="Eyebrow (optioneel)" style={inp} />
                  <input value={s.heading} onChange={e => updateSection(i, "heading", e.target.value)}
                    placeholder="Kop van de sectie" style={inp} />
                </div>
                <textarea value={s.bodyText} onChange={e => updateSection(i, "bodyText", e.target.value)}
                  placeholder={"Eerste alinea.\n\nTweede alinea (lege regel ertussen = nieuwe alinea op de pagina)."}
                  rows={4} style={{ ...inp, resize: "vertical", marginBottom: 8 }} />
                {s.bodyText.trim() && !s.bodyText.includes("\n\n") && (
                  <div style={{ fontSize: 11, color: "#E67E22", marginBottom: 8 }}>
                    Tip: gebruik een lege regel tussen alinea&apos;s (dubbele Enter). Zonder lege regel wordt alles één alinea.
                  </div>
                )}
                <textarea value={s.bulletsText} onChange={e => updateSection(i, "bulletsText", e.target.value)}
                  placeholder={"Opsomming (optioneel) — één punt per regel"} rows={3}
                  style={{ ...inp, resize: "vertical" }} />
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <label style={{ ...lab, marginBottom: 0 }}>FAQ — één vraag per regel, formaat: <strong>Vraag :: Antwoord</strong></label>
            {(() => {
              const lines = form.faq.split("\n").map(l => l.trim()).filter(Boolean);
              const ok = lines.filter(l => l.includes("::")).length;
              const bad = lines.length - ok;
              if (lines.length === 0) return null;
              return (
                <span style={{ fontSize: 11, color: bad > 0 ? "#C62828" : "#2E7D32", fontWeight: 600 }}>
                  {bad > 0 ? `⚠️ ${bad} regel(s) zonder "::"` : `✓ ${ok} vraag/antwoord-paar${ok !== 1 ? "s" : ""}`}
                </span>
              );
            })()}
          </div>
          <textarea value={form.faq} onChange={e => setForm(f => ({ ...f, faq: e.target.value }))}
            placeholder={"Heeft elke lodge een hottub? :: Ja, beide lodges hebben een eigen privé-hottub.\nKan ik direct boeken? :: Ja, zonder tussenpersoon via de website."}
            rows={5} style={{ ...inp, resize: "vertical", fontFamily: "monospace", fontSize: 12 }} />
        </div>

        {/* Related */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <label style={{ ...lab, marginBottom: 0 }}>Interne links onderaan — één per regel, formaat: <strong>Label :: /pad</strong></label>
            {(() => {
              const lines = form.related.split("\n").map(l => l.trim()).filter(Boolean);
              const ok = lines.filter(l => l.includes("::")).length;
              const bad = lines.length - ok;
              if (lines.length === 0) return null;
              return (
                <span style={{ fontSize: 11, color: bad > 0 ? "#C62828" : "#2E7D32", fontWeight: 600 }}>
                  {bad > 0 ? `⚠️ ${bad} regel(s) zonder "::"` : `✓ ${ok} link${ok !== 1 ? "s" : ""}`}
                </span>
              );
            })()}
          </div>
          <textarea value={form.related} onChange={e => setForm(f => ({ ...f, related: e.target.value }))}
            placeholder={"Luxe lodge in Drenthe :: /luxe-lodge-drenthe\nVakantiehuis bij Assen :: /vakantiehuis-assen"}
            rows={3} style={{ ...inp, resize: "vertical", fontFamily: "monospace", fontSize: 12 }} />
        </div>

        {/* CTA */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
          <div>
            <label style={lab}>CTA-titel (onderaan)</label>
            <input value={form.cta_title} onChange={e => setForm(f => ({ ...f, cta_title: e.target.value }))} style={inp} />
          </div>
          <div>
            <label style={lab}>CTA-tekst</label>
            <input value={form.cta_body} onChange={e => setForm(f => ({ ...f, cta_body: e.target.value }))} style={inp} />
          </div>
        </div>

        {/* SEO */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 10 }}>SEO (Google)</label>
          <div style={{ marginBottom: 10 }}>
            <label style={lab}>Meta-titel (verschijnt in Google)</label>
            <input value={form.meta_title} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))}
              placeholder="Bijv. Vakantiehuis met Hottub in Drenthe | Privé Lodge bij Zeijen" style={inp} />
          </div>
          <div>
            <label style={lab}>Meta-omschrijving</label>
            <textarea value={form.meta_description} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
              rows={2} style={{ ...inp, resize: "vertical" }} />
          </div>
        </div>

        {msg && <p style={{ fontSize: 12, color: "#C62828", margin: 0 }}>{msg}</p>}

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => save(false)} disabled={saving} style={{
            padding: "10px 20px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: "#fff", fontSize: 13, color: C.text, fontWeight: 600, cursor: "pointer",
          }}>
            {saving ? "Opslaan..." : "Opslaan als concept"}
          </button>
          <button onClick={() => save(true)} disabled={saving} style={{
            padding: "10px 24px", borderRadius: 8, border: "none",
            background: C.green, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            {saving ? "Bezig..." : creating ? "Opslaan & publiceren →" : "Opslaan & publiceren →"}
          </button>
        </div>
      </div>
    </div>
  );
}
