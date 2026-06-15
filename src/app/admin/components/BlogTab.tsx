"use client";
import { useState } from "react";
import { BlogPost } from "../types";
import { PUBLIC_IMAGES } from "@/lib/site";

const C = {
  bg: "#F7F8FA", card: "#fff", border: "#E5E7EB",
  text: "#111827", muted: "#6B7280", light: "#9CA3AF",
  green: "#2F4F3E", gold: "#B49A5E",
};

const EMPTY_POST = { id: "", slug: "", titel: "", intro: "", inhoud: "", categorie: "Verhaal", leestijd: "4 minuten", auteur: "Arjan Reinders", og_image: "", geplande_publicatie: "" };

export function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[àáâãä]/g, "a").replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u").replace(/[ç]/g, "c")
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

// ISO timestamp uit DB → <input type="datetime-local"> string in lokale tijd.
export function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// "GEPLAND op vrijdag 23 mei 14:30"-tekst voor een geplande post.
export function fmtPlanned(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("nl-NL", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

export function BlogTab({ posts, setPosts }: { posts: BlogPost[]; setPosts: (p: BlogPost[]) => void }) {
  const [view, setView] = useState<"list" | "edit">("list");
  const [form, setForm] = useState(EMPTY_POST);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState(false);

  const creating = !form.id;

  const reload = async () => {
    const res = await fetch("/api/admin/data?table=blog_posts");
    const data = await res.json();
    setPosts(data.data || []);
  };

  const importSeed = async () => {
    setImporting(true);
    setMsg("");
    const res = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "import_blog_seed" }),
    });
    const data = await res.json();
    await reload();
    setImporting(false);
    setMsg(data.error ? data.error : `${data.imported ?? 0} conceptartikel(en) geïmporteerd.`);
  };

  const startNew = () => { setForm(EMPTY_POST); setMsg(""); setPreview(false); setView("edit"); };
  const startEdit = (p: BlogPost) => {
    setForm({
      id: p.id, slug: p.slug, titel: p.titel, intro: p.intro, inhoud: p.inhoud,
      categorie: p.categorie, leestijd: p.leestijd, auteur: p.auteur,
      og_image: p.og_image || "",
      geplande_publicatie: isoToLocalInput(p.geplande_publicatie),
    });
    setMsg(""); setPreview(false); setView("edit");
  };
  const backToList = () => { setView("list"); setForm(EMPTY_POST); setMsg(""); };

  const save = async (publishAfter = false) => {
    if (!form.titel || !form.inhoud) { setMsg("Titel en inhoud zijn verplicht"); return; }
    if (!form.slug) form.slug = slugify(form.titel);
    if (publishAfter && form.geplande_publicatie && new Date(form.geplande_publicatie).getTime() > Date.now()) {
      if (!confirm(`Er staat een geplande publicatie op ${fmtPlanned(form.geplande_publicatie)}. Direct publiceren wist deze planning. Doorgaan?`)) return;
    }
    setSaving(true); setMsg("");
    const action = creating ? "create_blog_post" : "update_blog_post";
    const res = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...form }),
    });
    const data = await res.json();
    if (data.error) { setMsg(data.error); setSaving(false); return; }

    if (publishAfter) {
      const postId = creating ? data.data?.id : form.id;
      if (postId) {
        await fetch("/api/admin/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "publish_blog_post", id: postId, gepubliceerd: true }),
        });
      }
    }
    await reload();
    backToList();
    setSaving(false);
  };

  const togglePublish = async (p: BlogPost) => {
    await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish_blog_post", id: p.id, gepubliceerd: !p.gepubliceerd }),
    });
    await reload();
  };

  const del = async (p: BlogPost) => {
    if (!confirm(`Artikel "${p.titel}" verwijderen?`)) return;
    await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_blog_post", id: p.id }),
    });
    await reload();
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: `1px solid ${C.border}`, fontFamily: "inherit",
    fontSize: 13, color: C.text, background: "#fff", boxSizing: "border-box",
  };

  // ── Preview renderer ──
  function renderPreview(inhoud: string) {
    return inhoud.split(/\n\n+/).map((block, i) => {
      const t = block.trim();
      if (!t) return null;
      if (t.startsWith("## ")) return <h2 key={i} style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: "24px 0 8px" }}>{t.slice(3)}</h2>;
      return <p key={i} style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: "0 0 12px", fontWeight: 300 }}>{t}</p>;
    });
  }

  // ── Lijst ──
  if (view === "list") return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>Blog beheer</h2>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
            Gepubliceerde artikelen verschijnen op{" "}
            <a href="/blog" target="_blank" rel="noopener" style={{ color: C.green }}>huisterhuynen.nl/blog</a>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={importSeed} disabled={importing} style={{
            padding: "10px 18px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: "#fff", color: C.green, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            {importing ? "Importeren..." : "Importeer conceptartikelen"}
          </button>
          <button onClick={startNew} style={{
            padding: "10px 20px", borderRadius: 8, border: "none",
            background: C.green, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0,
          }}>
            + Nieuw artikel
          </button>
        </div>
      </div>

      {msg && <p style={{ fontSize: 12, color: C.green, margin: "0 0 16px" }}>{msg}</p>}

      {posts.length === 0 ? (
        <p style={{ fontSize: 13, color: C.muted }}>Nog geen artikelen. Klik op &quot;Nieuw artikel&quot; om te beginnen.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {posts.map(p => {
            const planned = !p.gepubliceerd && p.geplande_publicatie && new Date(p.geplande_publicatie).getTime() > Date.now();
            const statusLabel = p.gepubliceerd ? "GEPUBLICEERD" : planned ? "GEPLAND" : "CONCEPT";
            const statusBg = p.gepubliceerd ? "#E8F5E9" : planned ? "#E3F2FD" : "#F5F5F5";
            const statusColor = p.gepubliceerd ? "#2E7D32" : planned ? "#1565C0" : C.muted;
            return (
            <div key={p.id} style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
              opacity: p.gepubliceerd ? 1 : 0.75,
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                    background: statusBg, color: statusColor,
                  }}>
                    {statusLabel}
                  </span>
                  <span style={{ fontSize: 11, color: C.muted }}>{p.categorie} · {p.leestijd}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.titel}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  /blog/{p.slug}
                  {p.gepubliceerd && p.gepubliceerd_op && ` · gepubliceerd ${new Date(p.gepubliceerd_op).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}`}
                  {planned && ` · live op ${fmtPlanned(p.geplande_publicatie)}`}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {p.gepubliceerd && (
                  <a href={`/blog/${p.slug}`} target="_blank" rel="noopener" style={{
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
            );
          })}
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
          {creating ? "Nieuw artikel" : "Artikel bewerken"}
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: preview ? "1fr 1fr" : "1fr", gap: 24 }}>
        {/* Formulier */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Titel *</label>
              <input value={form.titel} onChange={e => {
                const titel = e.target.value;
                setForm(f => ({ ...f, titel, slug: f.slug || slugify(titel) }));
              }} placeholder="Bijv. De 10 mooiste fietspaden in Drenthe" style={inp} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>URL slug *</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                placeholder="bijv. fietspaden-drenthe" style={inp} />
              <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>/blog/{form.slug || "..."}</div>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Intro (1–2 zinnen, zichtbaar op overzichtspagina)</label>
            <textarea value={form.intro} onChange={e => setForm(f => ({ ...f, intro: e.target.value }))}
              placeholder="Korte intro die nieuwsgierig maakt..." rows={2}
              style={{ ...inp, resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Categorie</label>
              <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))} style={inp}>
                {["Verhaal", "Reistips", "Drenthe", "Seizoen", "Nieuws"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Leestijd</label>
              <select value={form.leestijd} onChange={e => setForm(f => ({ ...f, leestijd: e.target.value }))} style={inp}>
                {["2 minuten", "3 minuten", "4 minuten", "5 minuten", "8 minuten", "10 minuten"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Auteur</label>
              <input value={form.auteur} onChange={e => setForm(f => ({ ...f, auteur: e.target.value }))} style={inp} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>
              Social/OG-afbeelding <span style={{ color: C.light, fontWeight: 300 }}>— gebruikt bij delen op social media; standaard lodge-heide.jpg</span>
            </label>
            <select value={form.og_image} onChange={e => setForm(f => ({ ...f, og_image: e.target.value }))} style={inp}>
              <option value="">Standaard (lodge-heide.jpg)</option>
              {PUBLIC_IMAGES.map(img => <option key={img} value={img}>{img}</option>)}
            </select>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <label style={{ fontSize: 11, color: C.muted }}>
                Inhoud * <span style={{ color: C.light, fontWeight: 300 }}>— gebruik ## voor een tussenkop, lege regel voor nieuwe alinea</span>
              </label>
              <button onClick={() => setPreview(v => !v)} style={{
                background: "none", border: `1px solid ${C.border}`, padding: "3px 10px",
                borderRadius: 6, fontSize: 11, color: C.muted, cursor: "pointer",
              }}>
                {preview ? "Verberg preview" : "Toon preview"}
              </button>
            </div>
            <textarea
              value={form.inhoud}
              onChange={e => setForm(f => ({ ...f, inhoud: e.target.value }))}
              placeholder={"## Eerste kopje\n\nJe eerste alinea tekst hier.\n\n## Tweede kopje\n\nNog een alinea."}
              rows={18}
              style={{ ...inp, resize: "vertical", fontFamily: "monospace", fontSize: 12, lineHeight: 1.6 }}
            />
          </div>

          {(() => {
            const futurePlan = !!form.geplande_publicatie && new Date(form.geplande_publicatie).getTime() > Date.now();
            return (
              <div style={{
                background: futurePlan ? "#F0F7FF" : "#FAFAFA",
                border: `1px solid ${futurePlan ? "#BBDEFB" : C.border}`,
                borderRadius: 10, padding: "14px 16px",
              }}>
                <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 600 }}>
                  Plan publicatie (optioneel)
                </label>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="datetime-local"
                    value={form.geplande_publicatie}
                    onChange={e => setForm(f => ({ ...f, geplande_publicatie: e.target.value }))}
                    style={{ ...inp, width: "auto", minWidth: 220 }}
                  />
                  {form.geplande_publicatie && (
                    <button onClick={() => setForm(f => ({ ...f, geplande_publicatie: "" }))} style={{
                      background: "none", border: `1px solid ${C.border}`, padding: "6px 12px",
                      borderRadius: 6, fontSize: 11, color: C.muted, cursor: "pointer",
                    }}>Wis planning</button>
                  )}
                </div>
                <p style={{ fontSize: 11, color: C.muted, margin: "8px 0 0", lineHeight: 1.5 }}>
                  {futurePlan
                    ? `Wordt automatisch gepubliceerd op ${fmtPlanned(form.geplande_publicatie)} (binnen het uur na dit moment).`
                    : "Laat leeg om handmatig te publiceren. De cron draait elk uur."}
                </p>
              </div>
            );
          })()}

          {msg && <p style={{ fontSize: 12, color: "#C62828", margin: 0 }}>{msg}</p>}

          {(() => {
            const futurePlan = !!form.geplande_publicatie && new Date(form.geplande_publicatie).getTime() > Date.now();
            const saveLabel = saving ? "Opslaan..." : futurePlan ? "Opslaan & inplannen" : "Opslaan als concept";
            const publishLabel = saving ? "Bezig..." : creating ? "Opslaan & direct publiceren →" : "Direct publiceren →";
            return (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => save(false)} disabled={saving} style={{
                  padding: "10px 20px", borderRadius: 8,
                  border: futurePlan ? "none" : `1px solid ${C.border}`,
                  background: futurePlan ? "#1565C0" : "#fff",
                  fontSize: 13, color: futurePlan ? "#fff" : C.text, fontWeight: 600, cursor: "pointer",
                }}>
                  {saveLabel}
                </button>
                <button onClick={() => save(true)} disabled={saving} style={{
                  padding: "10px 24px", borderRadius: 8, border: "none",
                  background: futurePlan ? "#fff" : C.green,
                  color: futurePlan ? C.text : "#fff",
                  borderStyle: futurePlan ? "solid" : "none",
                  borderWidth: futurePlan ? 1 : 0,
                  borderColor: futurePlan ? C.border : "transparent",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>
                  {publishLabel}
                </button>
              </div>
            );
          })()}
        </div>

        {/* Live preview */}
        {preview && (
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: "24px", maxHeight: 700, overflowY: "auto",
          }}>
            <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
              Preview — zo ziet het artikel eruit
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "0 0 8px", lineHeight: 1.3 }}>
              {form.titel || "Titel..."}
            </h1>
            <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px" }}>
              {form.categorie} · {form.leestijd} · {form.auteur}
            </p>
            {renderPreview(form.inhoud)}
          </div>
        )}
      </div>
    </div>
  );
}
