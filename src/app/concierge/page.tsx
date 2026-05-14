"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Route, ChatMsg, DoorStatus, GuestProfile, Weather } from "@/data/tokens";
import { T } from "@/data/tokens";
import { DATA, CATEGORY_KEYS, UPSELLS } from "@/data/categories";
import { DATA_DE, UPSELLS_DE } from "@/i18n/categories-de";
import { PROFILES } from "@/data/profiles";
import { PROFILES_DE } from "@/i18n/profiles-de";
import { LanguageProvider, useLanguage } from "@/i18n";
import { Header } from "@/components/Header";
import { Onboarding } from "@/components/Onboarding";
import { Begroeting } from "@/components/Begroeting";
import { Home } from "@/components/Home";
import { Verblijf } from "@/components/Verblijf";
import { Chat } from "@/components/Chat";
import { Reserveren } from "@/components/Reserveren";
import { Info } from "@/components/Info";
import { Terugkomen } from "@/components/Terugkomen";
import { DetailPage } from "@/components/DetailPage";
import { Nav } from "@/components/Nav";
import { LodgeControl } from "@/components/LodgeControl";
import { InstallBanner } from "@/components/InstallBanner";

type StaySession = {
  id: string;
  token: string; // kept for follow-up calls (chat) after URL strip
  lodge: string;
  lodgeNaam: string;
  check_in: string;
  check_out: string;
  door_code: string;
  naam: string;
  greeted: boolean; // user tapped "Ja, dat klopt"
};

const STAY_STORAGE_KEY = "hth-stay";

export default function Page() {
  return (
    <LanguageProvider>
      <Suspense fallback={null}>
        <AppInner />
      </Suspense>
    </LanguageProvider>
  );
}

function AppInner() {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("s");

  /* ═══ ROUTE ═══ */
  const [route, setRoute] = useState<Route>("home");

  /* ═══ PROFILE — persisted in localStorage ═══ */
  const [profile, setProfile] = useState<GuestProfile>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [ready, setReady] = useState(false);

  /* ═══ STAY — magic-link session (?s=TOKEN) ═══ */
  const [stay, setStay] = useState<StaySession | null>(null);
  const [stayLoading, setStayLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hth-profile");
      if (saved === "skipped") {
        setOnboarded(true);
      } else if (saved && ["stel", "gezin", "actief", "rust"].includes(saved)) {
        setProfile(saved as GuestProfile);
        setOnboarded(true);
      }

      // Restore cached stay session
      const savedStay = localStorage.getItem(STAY_STORAGE_KEY);
      if (savedStay) {
        const parsed: StaySession = JSON.parse(savedStay);
        // Expire client-side too — check_out + 1 day
        const checkOut = new Date(parsed.check_out);
        checkOut.setHours(23, 59, 59);
        if (Date.now() < checkOut.getTime()) {
          setStay(parsed);
          if (parsed.greeted) setOnboarded(true);
        } else {
          localStorage.removeItem(STAY_STORAGE_KEY);
        }
      }
    } catch {
      // localStorage not available — skip onboarding entirely
      setOnboarded(true);
    }
    setReady(true);
  }, []);

  // Fetch stay info when a fresh token arrives in URL
  useEffect(() => {
    if (!tokenParam || stayLoading) return;
    if (stay && stay.id) return; // already loaded
    setStayLoading(true);
    fetch(`/api/stay?token=${encodeURIComponent(tokenParam)}`)
      .then(r => r.json())
      .then(d => {
        if (d.stay) {
          const session: StaySession = {
            id: d.stay.id,
            token: tokenParam,
            lodge: d.stay.lodge,
            lodgeNaam: d.stay.lodgeNaam,
            check_in: d.stay.check_in,
            check_out: d.stay.check_out,
            door_code: d.stay.door_code,
            naam: d.guest?.naam || "",
            greeted: false,
          };
          setStay(session);
          try { localStorage.setItem(STAY_STORAGE_KEY, JSON.stringify(session)); } catch {}
        }
      })
      .catch(() => {/* silent — fall through to default flow */})
      .finally(() => setStayLoading(false));
  }, [tokenParam, stay, stayLoading]);

  const confirmGreeting = () => {
    if (!stay) return;
    const updated = { ...stay, greeted: true };
    setStay(updated);
    setOnboarded(true);
    try {
      localStorage.setItem(STAY_STORAGE_KEY, JSON.stringify(updated));
      // Token-arrivals skip profile selection — they got a personal greeting instead
      if (!localStorage.getItem("hth-profile")) {
        localStorage.setItem("hth-profile", "skipped");
      }
    } catch {}
  };

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
    { role: "assistant", text: t.chat.welcome },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [door, setDoor] = useState<DoorStatus>("locked");
  const [wifiCopied, setWifiCopied] = useState(false);
  const [booked, setBooked] = useState<string | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString(lang === "de" ? "de-DE" : "nl-NL", {
    weekday: "long", day: "numeric", month: "long",
  });

  /* ═══ WEATHER — fetch on mount ═══ */
  useEffect(() => {
    fetch("/api/weather")
      .then(r => r.json())
      .then(d => setWeather(d))
      .catch(() => {/* silent — header shows fallback */});
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
    const activeProfiles = lang === "de" ? PROFILES_DE : PROFILES;
    const profileContext = profile && profile in activeProfiles
      ? activeProfiles[profile as Exclude<GuestProfile, null>].chatContext
      : null;
    const weatherContext = weather
      ? (lang === "de"
          ? `Es ist jetzt ${weather.temp}°C und ${weather.description} in Zeijen.`
          : `Het is nu ${weather.temp}°C en ${weather.description} in Zeijen.`)
      : null;
    const fullContext = [profileContext, weatherContext].filter(Boolean).join(" ") || null;

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...msgs.map(m => ({ role: m.role, content: m.text })),
            { role: "user", content: q }],
          context: weatherContext, // weather only — profile/stay travel separately
          stayToken: stay?.token || tokenParam || undefined,
          lang,
          profile: profile || undefined,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const d = await r.json();
      setMsgs(p => [...p, { role: "assistant", text: d.reply || (lang === "de" ? "Kein Antwoord." : "Even geen antwoord.") }]);
    } catch {
      clearTimeout(timeout);
      setMsgs(p => [...p, {
        role: "assistant",
        text: lang === "de"
          ? "Kurz keine Verbindung. Versuchen Sie es später, oder schauen Sie sich die Tipps auf der Startseite an."
          : "Even geen verbinding. Probeer het straks opnieuw, of bekijk de tips op de homepage.",
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
        body: JSON.stringify({ token: stay?.token || tokenParam }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
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
  const activeData = lang === "de" ? DATA_DE : DATA;
  const activeUpsells = lang === "de" ? UPSELLS_DE : UPSELLS;
  const activeProfiles2 = lang === "de" ? PROFILES_DE : PROFILES;

  const basePage = route.startsWith("detail:") ? "home" : route === "terugkomen" ? "info" : route;
  const detailKey = route.startsWith("detail:") ? route.split(":")[1] : null;
  const detailData = detailKey ? activeData[detailKey] : null;

  // Don't render until we've checked localStorage (prevents flash)
  if (!ready) return null;

  // Greeting (option B) takes priority over onboarding for token-arrivals
  const showBegroeting = stay !== null && !stay.greeted && route === "home" && !detailData;
  const showOnboarding = !showBegroeting && !onboarded && route === "home" && !detailData;
  const tokenArrival = stay !== null;

  /* ═══ RENDER ═══ */
  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", position: "relative" }}>
      {showBegroeting && stay && (
        <Begroeting
          naam={stay.naam}
          lodgeNaam={stay.lodgeNaam}
          checkIn={stay.check_in}
          onConfirm={confirmGreeting}
        />
      )}
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
              doorCode={stay?.door_code}
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
              upsells={activeUpsells}
            />
          )}
          {route === "info" && (
            <Info onNavigate={(r: Route) => setRoute(r)} />
          )}
          {route === "terugkomen" && (
            <Terugkomen
              onNavigate={(r: Route) => setRoute(r)}
              preferredLodge={stay?.lodge === "lodge_1" || stay?.lodge === "lodge_2" ? stay.lodge : null}
            />
          )}
        </>
      )}

      <Nav
        currentPage={basePage}
        onNavigate={(r: Route) => setRoute(r)}
      />

      {/* PWA install nudge — fires faster for token-arrivals (just opened email) */}
      {ready && !showBegroeting && (
        <InstallBanner delayMs={tokenArrival ? 2000 : 5000} />
      )}
    </div>
  );
}
