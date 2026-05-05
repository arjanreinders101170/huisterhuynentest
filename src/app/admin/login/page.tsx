"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError("");

    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const d = await r.json();

      if (d.success) {
        window.location.href = "/admin";
      } else {
        setError(d.error || "Onjuist wachtwoord");
      }
    } catch {
      setError("Kon niet verbinden");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F3EE",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#2A2418", letterSpacing: 1.5 }}>
            HUIS TER HUYNEN
          </div>
          <div style={{ fontSize: 11, color: "#B49A5E", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>
            Backoffice
          </div>
        </div>

        <div style={{
          background: "#fff", borderRadius: 16,
          border: "1px solid #E8E4DC", padding: "36px 32px",
          boxShadow: "0 2px 12px rgba(42,36,24,.04)",
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: "#2A2418", margin: "0 0 8px" }}>Inloggen</h1>
          <p style={{ fontSize: 13, color: "#8A7D6A", margin: "0 0 28px" }}>Voer je wachtwoord in om verder te gaan</p>

          <form onSubmit={submit}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Wachtwoord"
              autoFocus
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 10,
                border: `1px solid ${error ? "#E24B4A" : "#E8E4DC"}`, background: "#FDFCFA",
                fontSize: 15, color: "#2A2418", outline: "none",
                boxSizing: "border-box",
              }}
            />

            {error && (
              <div style={{ fontSize: 13, color: "#E24B4A", marginTop: 10, textAlign: "left" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={!password || loading} style={{
              width: "100%", padding: 14, borderRadius: 10, border: "none",
              background: password && !loading ? "#2F4F3E" : "#D4D0C8",
              color: "#fff", fontSize: 15, fontWeight: 500, marginTop: 16,
              cursor: password && !loading ? "pointer" : "not-allowed",
            }}>
              {loading ? "Bezig..." : "Inloggen"}
            </button>
          </form>
        </div>

        <p style={{ fontSize: 11, color: "#B4AFA5", marginTop: 24 }}>
          Huis ter Huynen · Zuiderstraat 6 · Zeijen, Drenthe
        </p>
      </div>
    </div>
  );
}
