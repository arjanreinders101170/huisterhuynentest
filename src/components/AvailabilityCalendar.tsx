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
