"use client";

import { useState, useRef, useEffect } from "react";
import type { Route, ChatMsg, DoorStatus, GuestProfile, Weather } from "@/data/tokens";
import { T } from "@/data/tokens";
import { DATA, CATEGORY_KEYS, UPSELLS } from "@/data/categories";
import { PROFILES } from "@/data/profiles";
import { Header } from "@/components/Header";
import { Onboarding } from "@/components/Onboarding";
import { Home } from "@/components/Home";
import { Verblijf } from "@/components/Verblijf";
import { Chat } from "@/components/Chat";
import { Reserveren } from "@/components/Reserveren";
import { Info } from "@/components/Info";
import { Terugkomen } from "@/components/Terugkomen";
import { DetailPage } from "@/components/DetailPage";
import { Nav } from "@/components/Nav";
import { LodgeControl } from "@/components/LodgeControl";

export default function Page() {
  /* ═══ ROUTE ═══ */
  const [route, setRoute] = useState<Route>("home");

  /* ═══ PROFILE — persisted in localStorage ═══ */
  const [profile, setProfile] = useState<GuestProfile>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hth-profile");
      if (saved === "skipped") {
        setOnboarded(true);
      } else if (saved && ["stel", "gezin", "actief", "rust"].includes(saved)) {
        setProfile(saved as GuestProfile);
        setOnboarded(true);
      }
    } catch {
      // localStorage not available — skip onboarding entirely
      setOnboarded(true);
    }
    setReady(true);
  }, []);

  const selectProfile = (p: GuestProfile) => {
    setProfile(p);
    setOnboarded(true);
    try {
      localStorage.setItem("hth-profile", p || "skipped");
    } catch {
      // localStorage not available
    }
  };

  /* ═══ FEATURE STATE ═══ */
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: "assistant", text: "Welkom! Ik ben de Huynen Host 🌿 Wat kan ik voor je doen?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [door, setDoor] = useState<DoorStatus>("locked");
  const [wifiCopied, setWifiCopied] = useState(false);
  const [booked, setBooked] = useState<string | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stayToken, setStayToken] = useState<string | null>(null);
  const [stayExpired, setStayExpired] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString("nl-NL", {
    weekday: "long", day: "numeric", month: "long",
  });

  /* ═══ WEATHER — fetch on mount ═══ */
  useEffect(() => {
    fetch("/api/weather")
      .then(r => r.json())
      .then(d => setWeather(d))
      .catch(() => {/* silent — header shows fallback */});
  }, []);

  /* ═══ STAY TOKEN — read from ?token=… URL param ═══
     Token is a credential and lives in component state only —
     never localStorage. We re-validate it via /api/stay so the
     server can detect expiry. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) return;
    setStayToken(t);
    fetch(`/api/stay?token=${encodeURIComponent(t)}`)
      .then(async r => {
        if (r.status === 410) {
          setStayExpired(true);
          setStayToken(null);
        }
        // ignore other non-OK statuses — token may simply be unknown
      })
      .catch(() => {/* silent */});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, chatBusy]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  /* ═══ CHAT — with profile context + timeout ═══ */
  const sendChat = async () => {
    if (!chatInput.trim() || chatBusy) return;
    const q = chatInput.trim();
    setChatInput("");
    setMsgs(p => [...p, { role: "user", text: q }]);
    setChatBusy(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    // Build context for the AI
    const profileContext = profile && profile in PROFILES
      ? PROFILES[profile as Exclude<GuestProfile, null>].chatContext
      : null;
    const weatherContext = weather
      ? `Het is nu ${weather.temp}°C en ${weather.description} in Zeijen.`
      : null;
    const fullContext = [profileContext, weatherContext].filter(Boolean).join(" ") || null;

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...msgs.map(m => ({ role: m.role, content: m.text })),
            { role: "user", content: q }],
          context: fullContext,
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

  /* ═══ NUKI ═══ */
  const unlockDoor = async () => {
    setDoor("opening");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const r = await fetch("/api/nuki/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: stayToken ?? "" }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (r.status === 401) {
        setStayExpired(true);
        setDoor("error");
        setTimeout(() => setDoor("locked"), 5000);
        return;
      }
      const d = await r.json();
      if (d.success) {
        setDoor("open");
      } else {
        setDoor("error");
        setTimeout(() => setDoor("locked"), 5000);
      }
    } catch {
      clearTimeout(timeout);
      setDoor("error");
      setTimeout(() => setDoor("locked"), 5000);
    }
  };

  /* ═══ BOOKING ═══ */
  const handleBook = async (product: string) => {
    if (booked === product) return;
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
  const basePage = route.startsWith("detail:") ? "home" : route === "terugkomen" ? "info" : route;
  const detailKey = route.startsWith("detail:") ? route.split(":")[1] : null;
  const detailData = detailKey ? DATA[detailKey] : null;

  // Don't render until we've checked localStorage (prevents flash)
  if (!ready) return null;

  // Show onboarding only on first visit
  const showOnboarding = !onboarded && route === "home" && !detailData;

  /* ═══ RENDER ═══ */
  return (
    <>
      {showOnboarding && <Onboarding onSelect={selectProfile} />}

      <Header today={today} weather={weather} onMenuOpen={() => setDrawerOpen(true)} />
      <LodgeControl open={drawerOpen} onClose={() => setDrawerOpen(false)} />

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
              profile={profile}
              weather={weather}
            />
          )}
          {route === "verblijf" && (
            <Verblijf
              door={door}
              onUnlock={unlockDoor}
              wifiCopied={wifiCopied}
              onCopyWifi={copyWifi}
              onNavigate={(r: Route) => setRoute(r)}
              stayExpired={stayExpired}
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
              profile={profile}
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
          {route === "terugkomen" && (
            <Terugkomen onNavigate={(r: Route) => setRoute(r)} />
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
