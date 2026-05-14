"use client";
import { useState } from "react";

const T = {
  gold: "#B49A5E",
  green: "#2F4F3E",
  sans: "var(--font-dm-sans), system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
};

export function NewsletterForm() {
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [pot, setPot] = useState(""); // honeypot — bots vullen dit in, mensen niet
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naam, email, _pot: pot }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Er ging iets mis. Probeer het opnieuw.");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Geen verbinding. Probeer het later opnieuw.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div style={{
        textAlign: "center",
        padding: "20px 0",
      }}>
        <div style={{
          fontFamily: T.serif, fontSize: 20, fontWeight: 700,
          color: "white", marginBottom: 8,
        }}>
          Gelukt — je staat op de lijst.
        </div>
        <p style={{
          fontFamily: T.sans, fontSize: 14, color: "rgba(255,255,255,.65)",
          fontWeight: 300, margin: 0,
        }}>
          Je ontvangt als eerste bericht bij de opening en eventuele vroegboekvoordelen.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      {/* Honeypot: verborgen voor mensen, bots vullen het automatisch in */}
      <input
        type="text"
        name="website"
        value={pot}
        onChange={e => setPot(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}
      />
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center",
      }}>
        <input
          type="text"
          placeholder="Voornaam"
          value={naam}
          onChange={e => setNaam(e.target.value)}
          required
          style={{
            flex: "1 1 200px", minWidth: 0,
            padding: "13px 16px",
            background: "rgba(255,255,255,.1)",
            border: "1px solid rgba(255,255,255,.2)",
            borderRadius: 10, color: "white",
            fontFamily: T.sans, fontSize: 14, fontWeight: 300,
            outline: "none",
          }}
        />
        <input
          type="email"
          placeholder="E-mailadres"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            flex: "1 1 200px", minWidth: 0,
            padding: "13px 16px",
            background: "rgba(255,255,255,.1)",
            border: "1px solid rgba(255,255,255,.2)",
            borderRadius: 10, color: "white",
            fontFamily: T.sans, fontSize: 14, fontWeight: 300,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            flex: "1 1 auto",
            padding: "13px 32px",
            background: T.gold,
            color: T.green,
            border: "none", borderRadius: 10,
            fontFamily: T.sans, fontSize: 14, fontWeight: 700,
            cursor: status === "loading" ? "not-allowed" : "pointer",
            opacity: status === "loading" ? 0.7 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {status === "loading" ? "Bezig…" : "Schrijf me in"}
        </button>
      </div>
      {status === "error" && (
        <p style={{
          fontFamily: T.sans, fontSize: 13, color: "#FFAAAA",
          textAlign: "center", marginTop: 12, fontWeight: 300,
        }}>
          {errorMsg}
        </p>
      )}
      <p style={{
        fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,.35)",
        textAlign: "center", marginTop: 14, fontWeight: 300,
      }}>
        Geen spam. Alleen de opening en seizoensnieuws. Afmelden kan altijd.
      </p>
    </form>
  );
}
