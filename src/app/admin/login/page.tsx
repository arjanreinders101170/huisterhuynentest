"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || loading) return;
    setLoading(true);
    setError("");

    if (username !== "admin") {
      setError("Onbekende gebruiker");
      setLoading(false);
      return;
    }

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

  const canSubmit = username.length > 0 && password.length > 0 && !loading;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "#F5F3EE",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      padding: 24,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#2A2418", letterSpacing: 1.5 }}>
            HUIS TER HUYNEN
          </div>
          <div style={{ fontSize: 11, color: "#B49A5E", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>
            Backoffice
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "#fff", borderRadius: 16,
          border: "1px solid #E8E4DC", padding: "36px 32px",
          boxShadow: "0 2px 12px rgba(42,36,24,.04)",
          textAlign: "left",
        }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "#2A2418", margin: "0 0 6px", textAlign: "center" }}>
            Welkom terug
          </h1>
          <p style={{ fontSize: 13, color: "#8A7D6A", margin: "0 0 28px", textAlign: "center" }}>
            Log in om verder te gaan
          </p>

          <form onSubmit={submit}>
            {/* Username */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, color: "#8A7D6A", marginBottom: 6 }}>
                Gebruikersnaam
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                autoFocus
                autoComplete="username"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 10,
                  border: "1px solid #E8E4DC", background: "#FDFCFA",
                  fontSize: 15, color: "#2A2418", outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 6 }}>
              <label style={{ display: "block", fontSize: 13, color: "#8A7D6A", marginBottom: 6 }}>
                Wachtwoord
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: "100%", padding: "12px 48px 12px 16px", borderRadius: 10,
                    border: `1px solid ${error ? "#E24B4A" : "#E8E4DC"}`, background: "#FDFCFA",
                    fontSize: 15, color: "#2A2418", outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", padding: 4,
                    color: "#8A7D6A", display: "flex", alignItems: "center",
                  }}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ fontSize: 13, color: "#E24B4A", marginTop: 10, marginBottom: 4 }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={!canSubmit} style={{
              width: "100%", padding: 14, borderRadius: 10, border: "none",
              background: canSubmit ? "#2F4F3E" : "#D4D0C8",
              color: "#fff", fontSize: 15, fontWeight: 500, marginTop: 16,
              cursor: canSubmit ? "pointer" : "not-allowed",
              transition: "background .2s",
            }}>
              {loading ? "Even geduld..." : "Inloggen"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ fontSize: 11, color: "#B4AFA5", marginTop: 24 }}>
          Huis ter Huynen · Zuiderstraat 6 · Zeijen, Drenthe
        </p>
      </div>
    </div>
  );
}
