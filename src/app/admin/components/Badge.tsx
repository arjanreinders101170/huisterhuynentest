"use client";
import { STATUS_COLORS } from "../types";

export function Badge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || { bg: "#F5F5F5", text: "#9E9E9E" };
  const label = status.replace("_", " ");
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 11, padding: "3px 10px", borderRadius: 6, fontWeight: 500, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} uur`;
  const days = Math.floor(hours / 24);
  return `${days} dag${days > 1 ? "en" : ""}`;
}
