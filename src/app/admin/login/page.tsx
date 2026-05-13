"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const params = useSearchParams();
  const errorParam = params.get("error");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(
    errorParam === "expired"
      ? "Die link is verlopen of al gebruikt. Vraag een nieuwe aan."
      : errorParam === "invalid"
      ? "Ongeldige inloglink. Vraag een nieuwe aan."
      : ""
  );
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/admin/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (r.ok) {
        setSent(true);
      } else {
        const d = await r.json().catch(() => ({}));
        setError(d.error || "Er ging iets mis. Probeer het opnieuw.");
      }
    } catch {
      setError("Kon niet verbinden");
    }
    setLoading(false);
  };

  const canSubmit = email.includes("@") && !loading;

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
          textAlign: "left",
        }}>
          {sent ? (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 500, color: "#2A2418", margin: "0 0 12px", textAlign: "center" }}>
                Check je e-mail
              </h1>
              <p style={{ fontSize: 14, color: "#5A5142", lineHeight: 1.6, textAlign: "center", margin: "0 0 8px" }}>
                Als <strong>{email}</strong> toegang heeft, hebben we een inloglink gestuurd. De link is 15 minuten geldig en eenmalig bruikbaar.
              </p>
              <p style={{ fontSize: 12, color: "#8A7D6A", textAlign: "center", margin: "20px 0 0" }}>
                Niet ontvangen? Check spam, of <button onClick={() => setSent(false)} style={{ background: "none", border: "none", padding: 0, color: "#2F4F3E", cursor: "pointer", textDecoration: "underline", font: "inherit" }}>probeer opnieuw</button>.
              </p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 500, color: "#2A2418", margin: "0 0 6px", textAlign: "center" }}>
                Welkom terug
              </h1>
              <p style={{ fontSize: 13, color: "#8A7D6A", margin: "0 0 28px", textAlign: "center" }}>
                Vul je e-mailadres in voor een inloglink
              </p>

              <form onSubmit={submit}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, color: "#8A7D6A", marginBottom: 6 }}>
                    E-mailadres
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="naam@voorbeeld.nl"
                    autoFocus
                    autoComplete="email"
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 10,
                      border: `1px solid ${error ? "#E24B4A" : "#E8E4DC"}`, background: "#FDFCFA",
                      fontSize: 15, color: "#2A2418", outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {error && (
                  <div style={{ fontSize: 13, color: "#E24B4A", marginTop: 10, marginBottom: 4 }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={!canSubmit} style={{
                  width: "100%", padding: 14, borderRadius: 10, border: "none",
                  background: canSubmit ? "#2F4F3E" : "#D4D0C8",
                  color: "#fff", fontSize: 15, fontWeight: 500, marginTop: 16,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  transition: "background .2s",
                }}>
                  {loading ? "Even geduld..." : "Stuur inloglink"}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ fontSize: 11, color: "#B4AFA5", marginTop: 24 }}>
          Huis ter Huynen · Zuiderstraat 6 · Zeijen, Drenthe
        </p>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
