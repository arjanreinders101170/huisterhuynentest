#!/bin/bash
cd /workspaces/huisterhuynentest

echo "Creating directories..."
mkdir -p src/app/landing
mkdir -p src/app/privacy
mkdir -p src/app/terms
mkdir -p src/components

echo "Writing AvailabilityCalendar.tsx..."
cat > src/components/AvailabilityCalendar.tsx << 'EOF'
"use client";
import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";

type AvailabilityStatus = "available" | "booked" | "blocked";
interface CalendarDay { date: Date; status: AvailabilityStatus; reason?: string; }
const COLORS = { available: "#90EE90", booked: "#D3D3D3", blocked: "#FFA500" };

export default function AvailabilityCalendar({ lodgeId }: { lodgeId: "lodge_1" | "lodge_2" }) {
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date());

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
        const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        const s0 = startDate.toISOString().split("T")[0];
        const s1 = endDate.toISOString().split("T")[0];

        const { data: stays } = await getSupabase().from("stays").select("check_in, check_out").eq("lodge", lodgeId).gte("check_in", s0).lte("check_out", s1);
        const { data: blocked } = await getSupabase().from("blocked_dates").select("start_date, end_date, reason").eq("lodge_id", lodgeId).gte("start_date", s0).lte("end_date", s1);

        const days: CalendarDay[] = [];
        for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
          const cur = new Date(day).getTime();
          const dateStr = new Date(day).toISOString().split("T")[0];
          let status: AvailabilityStatus = "available";
          let reason: string | undefined;
          if (stays?.some(s => cur >= new Date(s.check_in).getTime() && cur < new Date(s.check_out).getTime())) status = "booked";
          const blk = blocked?.find(b => cur >= new Date(b.start_date).getTime() && cur < new Date(b.end_date).getTime());
          if (blk) { status = "blocked"; reason = blk.reason; }
          days.push({ date: new Date(day), status, reason });
        }
        setCalendar(days);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch_();
  }, [month, lodgeId]);

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: "#8A7D6A" }}>Laden...</div>;

  const weeks: CalendarDay[][] = [];
  let cur: CalendarDay[] = [];
  const fd = calendar[0]?.date.getDay() ?? 1;
  const offset = fd === 0 ? 6 : fd - 1;
  for (let i = 0; i < offset; i++) cur.push({ date: new Date(), status: "available" });
  calendar.forEach(day => { cur.push(day); if (cur.length === 7) { weeks.push(cur); cur = []; } });
  if (cur.length) { while (cur.length < 7) cur.push({ date: new Date(), status: "available" }); weeks.push(cur); }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))} style={{ padding: "8px 16px", background: "#2F4F3E", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>← Vorige</button>
        <div style={{ fontSize: 18, fontWeight: 600, color: "#2A2418" }}>{month.toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}</div>
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))} style={{ padding: "8px 16px", background: "#2F4F3E", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Volgende →</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8, textAlign: "center", fontSize: 12, fontWeight: 600, color: "#8A7D6A" }}>
        {["Ma","Di","Wo","Do","Fr","Za","Zo"].map(d => <div key={d}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {weeks.map((week, wi) => week.map((day, di) => {
          const isCur = calendar.includes(day);
          return (
            <div key={`${wi}-${di}`} title={day.reason} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", background: isCur ? COLORS[day.status] : "#f0f0f0", borderRadius: 6, fontSize: 13, fontWeight: 600, color: day.status === "booked" ? "#666" : "#2F4F3E", opacity: isCur ? 1 : 0.2 }}>
              {isCur ? day.date.getDate() : ""}
            </div>
          );
        }))}
      </div>
      <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 20, fontSize: 13, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 16, height: 16, background: "#90EE90", borderRadius: 3 }}></div><span>Beschikbaar</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 16, height: 16, background: "#D3D3D3", borderRadius: 3 }}></div><span>Geboekt</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 16, height: 16, background: "#FFA500", borderRadius: 3 }}></div><span>Geblokkeerd</span></div>
      </div>
    </div>
  );
}
EOF

echo "Writing landing page..."
cat > src/app/landing/page.tsx << 'EOF'
"use client";
import { useState } from "react";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
const T = { bg: "#EAE3D2", card: "#FDFBF6", green: "#2F4F3E", text: "#2A2418", muted: "#8A7D6A", gold: "#B49A5E", border: "#E0D8C8" };
export default function LandingPage() {
  const [selectedLodge, setSelectedLodge] = useState<"lodge_1"|"lodge_2">("lodge_1");
  return (
    <div style={{ background: T.bg, fontFamily: "'DM Sans', system-ui, sans-serif", color: T.text }}>
      {/* HERO */}
      <section style={{ height: 600, background: "linear-gradient(135deg,#8B6B3D 0%,#A67B4B 50%,#6B5B3A 100%)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "white", position: "relative" }}>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 600, padding: 40 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: "bold", letterSpacing: 3, marginBottom: 8 }}>HUIS TER HUYNEN</div>
            <div><span style={{ display: "inline-block", width: 24, height: 1, background: T.gold, verticalAlign: "middle" }}></span><span style={{ fontSize: 8, color: T.gold, letterSpacing: "2.5px", textTransform: "uppercase" as const, padding: "0 8px", verticalAlign: "middle" }}>Boutique Lodge</span><span style={{ display: "inline-block", width: 24, height: 1, background: T.gold, verticalAlign: "middle" }}></span></div>
          </div>
          <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.6, marginBottom: 30 }}>Twee unieke boutique lodges in het hart van Drenthe. Natuur, privacy, en luxe in perfecte harmonie.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ padding: "14px 40px", background: T.gold, color: T.green, border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Bekijk beschikbaarheid</button>
            <button style={{ padding: "14px 40px", background: "transparent", color: "white", border: "2px solid white", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Lees meer</button>
          </div>
        </div>
      </section>

      {/* USPs */}
      <section style={{ background: T.card, padding: "60px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 36, margin: "0 0 12px" }}>Waarom Huis ter Huynen?</h2>
            <div style={{ height: 2, width: 40, background: T.gold, margin: "12px auto" }}></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 30, textAlign: "center" }}>
            {[{l:"Privé Hottub",d:"Genieten onder de sterren"},{l:"Natuur Pur",d:"Heide, bos en hunebed"},{l:"EV Laadpaal",d:"Duurzaam verblijven"},{l:"Volledige Privacy",d:"Alleen jij en je gezelschap"},{l:"Uniek Design",d:"Boomhut & Schaapskooi"},{l:"Persoonlijk",d:"Direct contact met eigenaar"}].map((u,i) => (
              <div key={i}><div style={{ fontSize: 12, fontWeight: 600, color: T.gold, letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" as const }}>━━━</div><h3 style={{ fontSize: 16, color: T.green, marginBottom: 8, fontWeight: 600 }}>{u.l}</h3><p style={{ fontSize: 13, color: T.muted, margin: 0 }}>{u.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* LODGES */}
      <section style={{ background: "white", padding: "60px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 36, margin: "0 0 12px" }}>Onze Lodges</h2>
            <div style={{ height: 2, width: 40, background: T.gold, margin: "12px auto" }}></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 30 }}>
            {[{id:"lodge_1",name:"De Boomhut",desc:"Luxe boomhut voor twee personen. Uitzicht over het bos met privé hottub en sauna.",features:"✓ 2 personen  ✓ Hottub  ✓ Sauna"},{id:"lodge_2",name:"De Schaapskooi",desc:"Voormalige schapenschuur omgetoverd tot luxe verblijf. Warmte, comfort en authenticiteit.",features:"✓ 4 personen  ✓ Hottub  ✓ Keuken"}].map(lodge => (
              <div key={lodge.id} style={{ borderRadius: 12, overflow: "hidden", background: T.card, border: `1px solid ${T.border}` }}>
                <div style={{ height: 200, background: "linear-gradient(135deg,#8B7355,#A89070)", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>[FOTO {lodge.name}]</div>
                <div style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: "Georgia,serif", fontSize: 20, color: T.green, margin: "0 0 8px" }}>{lodge.name}</h3>
                  <p style={{ fontSize: 13, color: T.muted, margin: "0 0 16px" }}>{lodge.desc}</p>
                  <div style={{ fontSize: 12, color: T.gold, marginBottom: 12 }}>{lodge.features}</div>
                  <button style={{ width: "100%", padding: 12, background: T.green, color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Bekijk {lodge.name}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ background: T.bg, padding: "60px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 36, margin: "0 0 12px" }}>Wat gasten zeggen</h2>
            <div style={{ height: 2, width: 40, background: T.gold, margin: "12px auto" }}></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            {[{t:'"Een onvergetelijk weekend in de Boomhut. De hottub onder de sterren, het geluid van de vogels, pure magic."',a:"Sarah & Mark, Amsterdam"},{t:'"De Schaapskooi is het mooiste wat ik het afgelopen jaar heb gezien. Warm, authentiek, en hartelijk ontvangen."',a:"Petra, Groningen"},{t:'"Perfect voor een EV roadtrip! Laadpaal ter plekke en het uitzicht over de heide is fenomenaal."',a:"Jan, Duitsland"}].map((r,i) => (
              <div key={i} style={{ background: "white", padding: 24, borderRadius: 12, borderLeft: `4px solid ${T.gold}` }}>
                <div style={{ fontSize: 13, color: T.gold, marginBottom: 12 }}>★★★★★</div>
                <p style={{ fontSize: 14, color: T.text, fontStyle: "italic", margin: "0 0 12px", lineHeight: 1.6 }}>{r.t}</p>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.green }}>— {r.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVAILABILITY */}
      <section style={{ background: "white", padding: "60px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 36, margin: "0 0 12px" }}>Beschikbaarheid</h2>
            <div style={{ height: 2, width: 40, background: T.gold, margin: "12px auto" }}></div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 30 }}>
            {[{id:"lodge_1" as const,name:"De Boomhut"},{id:"lodge_2" as const,name:"De Schaapskooi"}].map(l => (
              <button key={l.id} onClick={() => setSelectedLodge(l.id)} style={{ padding: "12px 24px", background: selectedLodge === l.id ? T.green : T.border, color: selectedLodge === l.id ? "white" : T.text, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{l.name}</button>
            ))}
          </div>
          <AvailabilityCalendar lodgeId={selectedLodge} />
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: T.green, color: "white", padding: "60px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: 36, margin: "0 0 16px" }}>Klaar voor je volgende avontuur?</h2>
          <p style={{ fontSize: 15, fontWeight: 300, margin: "0 0 30px" }}>Stuur ons je voorkeursdatums en wij stellen een persoonlijk voorstel samen.</p>
          <button style={{ padding: "16px 50px", background: T.gold, color: T.green, border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Vraag beschikbaarheid aan</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#1A1A1A", color: T.muted, padding: 40, textAlign: "center", fontSize: 13 }}>
        <p style={{ margin: "0 0 8px" }}>Zuiderstraat 6 · 9491 EC Zeijen, Drenthe · <a href="tel:+31642568603" style={{ color: T.gold, textDecoration: "none" }}>+31 6 42568603</a></p>
        <p style={{ margin: "8px 0 0" }}>© 2026 Huis ter Huynen · <a href="/privacy" style={{ color: T.gold, textDecoration: "none", margin: "0 8px" }}>Privacy</a> · <a href="/terms" style={{ color: T.gold, textDecoration: "none", margin: "0 8px" }}>Voorwaarden</a> · <a href="mailto:lodge@huisterhuynen.nl" style={{ color: T.gold, textDecoration: "none" }}>Contact</a></p>
      </footer>
    </div>
  );
}
EOF

echo "Writing privacy page..."
cat > src/app/privacy/page.tsx << 'EOF'
"use client";
const C = { bg: "#EAE3D2", text: "#2A2418", muted: "#8A7D6A", gold: "#B49A5E" };
export default function PrivacyPage() {
  return (
    <div style={{ background: C.bg, fontFamily: "'DM Sans',system-ui,sans-serif", color: C.text, minHeight: "100vh" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: 36, marginBottom: 12 }}>Privacybeleid</h1>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 40 }}>Laatst bijgewerkt: Mei 2026</p>
        <div style={{ lineHeight: 1.8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>1. Over ons</h2>
          <p>Huis ter Huynen is een boutique lodge bedrijf gevestigd te Zeijen, Drenthe. Wij verwerken persoonsgegevens conform de AVG.</p>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>2. Gegevens die wij verzamelen</h2>
          <p>Naam, e-mailadres, verblijfsdata, betaalgegevens (via Mollie), IP-adres.</p>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>3. Uw rechten</h2>
          <p>U heeft recht op inzage, correctie, verwijdering en portabiliteit van uw gegevens. Contact: <a href="mailto:lodge@huisterhuynen.nl" style={{ color: C.gold }}>lodge@huisterhuynen.nl</a></p>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>4. Contact</h2>
          <p>Huis ter Huynen · Zuiderstraat 6 · 9491 EC Zeijen · <a href="tel:+31642568603" style={{ color: C.gold }}>+31 6 42568603</a></p>
        </div>
        <div style={{ marginTop: 60, textAlign: "center", fontSize: 13 }}>
          <a href="/landing" style={{ color: C.gold, textDecoration: "none" }}>← Terug naar home</a>
        </div>
      </div>
    </div>
  );
}
EOF

echo "Writing terms page..."
cat > src/app/terms/page.tsx << 'EOF'
"use client";
const C = { bg: "#EAE3D2", text: "#2A2418", muted: "#8A7D6A", gold: "#B49A5E" };
export default function TermsPage() {
  return (
    <div style={{ background: C.bg, fontFamily: "'DM Sans',system-ui,sans-serif", color: C.text, minHeight: "100vh" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: 36, marginBottom: 12 }}>Algemene Voorwaarden</h1>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 40 }}>Laatst bijgewerkt: Mei 2026</p>
        <div style={{ lineHeight: 1.8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>1. Toepasselijkheid</h2>
          <p>Deze voorwaarden zijn van toepassing op alle boekingen bij Huis ter Huynen.</p>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>2. Annulering</h2>
          <p><strong>Gratis annulering:</strong> Tot 14 dagen voor aankomst.</p>
          <p><strong>50% refund:</strong> Tot 7 dagen voor aankomst.</p>
          <p><strong>Geen refund:</strong> Minder dan 7 dagen voor aankomst.</p>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>3. Check-in / Check-out</h2>
          <p>Check-in: 15:00 · Check-out: 11:00</p>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>4. Huisregels</h2>
          <p>Niet roken · Geen huisdieren zonder overleg · Geen feesten · Stilte 22:00–08:00</p>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>5. Contact</h2>
          <p>Huis ter Huynen · Zuiderstraat 6 · 9491 EC Zeijen · <a href="mailto:lodge@huisterhuynen.nl" style={{ color: C.gold }}>lodge@huisterhuynen.nl</a></p>
        </div>
        <div style={{ marginTop: 60, textAlign: "center", fontSize: 13 }}>
          <a href="/landing" style={{ color: C.gold, textDecoration: "none" }}>← Terug naar home</a>
        </div>
      </div>
    </div>
  );
}
EOF

echo ""
echo "✅ All files created!"
echo ""
echo "Now run:"
echo "  npx next build"
echo "  git add -A && git commit -m 'Landing page live' && git push"
