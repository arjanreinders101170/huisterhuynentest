"use client";
import { useEffect, useState } from "react";
import { reserveerContextVoorVan } from "@/lib/site";
import { leesReserveerParams } from "@/lib/reserveer-params";

/* Bevestigt in de boekingssectie waar de bezoeker vandaan komt.
 *
 * Wie op een landingspagina over wellness op "Bekijk beschikbaarheid" klikt,
 * kwam tot nu toe uit bij een generiek formulier op de homepage: geen woord
 * meer over wellness, geen lodge voorgeselecteerd, de hele opbouw van de
 * pagina weg. Deze regel pakt die draad weer op. */
export function ReserveerContextRegel({ tokens }: {
  tokens: { sans: string; green: string; gold: string };
}) {
  const [regel, setRegel] = useState<string | null>(null);

  useEffect(() => {
    const { van } = leesReserveerParams();
    setRegel(reserveerContextVoorVan(van)?.regel ?? null);
  }, []);

  if (!regel) return null;

  return (
    <p style={{
      fontFamily: tokens.sans, fontSize: 14.5, fontWeight: 500,
      color: tokens.green, margin: "18px auto 0", maxWidth: 560,
      lineHeight: 1.6, background: "rgba(47,79,62,.07)",
      borderLeft: `3px solid ${tokens.gold}`,
      padding: "12px 18px", borderRadius: "0 8px 8px 0", textAlign: "left",
    }}>
      {regel}
    </p>
  );
}
