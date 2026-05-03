"use client";

import { useState, useRef, useEffect } from "react";
import type { Route, ChatMsg, DoorStatus } from "@/data/tokens";
import { T } from "@/data/tokens";
import { DATA, CATEGORY_KEYS, UPSELLS } from "@/data/categories";
import { Header } from "@/components/Header";
import { Home } from "@/components/Home";
import { Verblijf } from "@/components/Verblijf";
import { Chat } from "@/components/Chat";
import { Reserveren } from "@/components/Reserveren";
import { Info } from "@/components/Info";
import { DetailPage } from "@/components/DetailPage";
import { Nav } from "@/components/Nav";

export default function Page() {
  /* ═══ SINGLE ROUTE STATE — no duplicates ═══ */
  const [route, setRoute] = useState<Route>("home");

  /* ═══ FEATURE STATE ═══ */
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: "assistant", text: "Welkom! Ik ben de Huynen Host 🌿 Wat kan ik voor je doen?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [door, setDoor] = useState<DoorStatus>("locked");
  const [wifiCopied, setWifiCopied] = useState(false);
  const [booked, setBooked] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString("nl-NL", {
    weekday: "long", day: "numeric", month: "long",
  });

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, chatBusy]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  /* ═══ CHAT — with timeout ═══ */
  const sendChat = async () => {
    if (!chatInput.trim() || chatBusy) return;
    const q = chatInput.trim();
    setChatInput("");
    setMsgs(p => [...p, { role: "user", text: q }]);
    setChatBusy(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...msgs.map(m => ({ role: m.role, content: m.text })),
            { role: "user", content: q }],
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const d = await r.json();
      setMsgs(p => [...p, { role: "assistant", text: d.reply || "Even geen antwoord." }]);
    } catch {
      clearTimeout(timeout);
      setMsgs(p => [...p, {
        role: "assistant",
        text: "Even geen verbinding. Probeer het straks opnieuw, of bekijk de tips op de homepage.",
      }]);
    }
    setChatBusy(false);
  };

  /* ═══ NUKI — with 10s timeout + auto-fallback ═══ */
  const unlockDoor = async () => {
    setDoor("opening");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const r = await fetch("/api/nuki/unlock", {
        method: "POST",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const d = await r.json();
      setDoor(d.success ? "open" : "error");
    } catch {
      clearTimeout(timeout);
      setDoor("error");
    }

    // Auto-reset error after 5s
    if (door === "error") {
      setTimeout(() => setDoor("locked"), 5000);
    }
  };

  /* ═══ BOOKING ═══ */
  const handleBook = async (product: string) => {
    if (booked === product) return; // prevent double-click
    setBooked(product);
    try {
      await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          naam: "Gast",
          datum: new Date().toISOString().split("T")[0],
        }),
      });
    } catch {
      // Booking registered client-side regardless
    }
  };

  /* ═══ WIFI ═══ */
  const copyWifi = () => {
    navigator.clipboard?.writeText("HuynenGast2024");
    setWifiCopied(true);
    setTimeout(() => setWifiCopied(false), 2000);
  };

  /* ═══ HELPERS ═══ */
  const basePage = route.startsWith("detail:") ? "home" : route;
  const detailKey = route.startsWith("detail:") ? route.split(":")[1] : null;
  const detailData = detailKey ? DATA[detailKey] : null;

  /* ═══ RENDER ═══ */
  return (
    <>
      <Header today={today} />

      {detailData ? (
        <DetailPage
          data={detailData}
          onBack={() => setRoute("home")}
          onNavigate={(r: Route) => setRoute(r)}
        />
      ) : (
        <>
          {route === "home" && (
            <Home
              onNavigate={(r: Route) => setRoute(r)}
              categoryKeys={CATEGORY_KEYS}
            />
          )}
          {route === "verblijf" && (
            <Verblijf
              door={door}
              onUnlock={unlockDoor}
              wifiCopied={wifiCopied}
              onCopyWifi={copyWifi}
              onNavigate={(r: Route) => setRoute(r)}
            />
          )}
          {route === "chat" && (
            <Chat
              msgs={msgs}
              input={chatInput}
              onInputChange={setChatInput}
              onSend={sendChat}
              busy={chatBusy}
              endRef={chatEndRef}
            />
          )}
          {route === "reserveren" && (
            <Reserveren
              booked={booked}
              onBook={handleBook}
              upsells={UPSELLS}
            />
          )}
          {route === "info" && (
            <Info onNavigate={(r: Route) => setRoute(r)} />
          )}
        </>
      )}

      <Nav
        currentPage={basePage}
        onNavigate={(r: Route) => setRoute(r)}
      />
    </>
  );
}
