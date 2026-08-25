"use client";
import { useEffect } from "react";
import { readConsent } from "@/lib/tracking/consent";
import { initGa4 } from "@/lib/tracking/ga4";
import type { ConsentState } from "@/lib/tracking/types";

/* Laadt de GA4-tag op het moment dat de bezoeker toestemming geeft.
 *
 * Zonder deze luisteraar kwam GA4 alleen op gang via pushEvent(): een nieuwe
 * bezoeker landt met analytics_storage op deny, de PageView wordt genegeerd,
 * en accepteert hij daarna de cookiebanner dan gebeurt er niets meer tot de
 * volgende gebeurtenis. Wie accepteerde en vervolgens wegklikte zonder te
 * navigeren, leverde dus geen sessie en geen page_view op — precies de
 * bounces vielen weg. Terugkerende bezoekers hadden er geen last van.
 *
 * Zelfde patroon als <MetaPixel />, andere consent-categorie. */
export function GA4() {
  useEffect(() => {
    const { state } = readConsent();
    if (state.statistics) initGa4();

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ConsentState>).detail;
      if (detail?.statistics) initGa4();
    };
    window.addEventListener("hth:consent-change", handler);
    return () => window.removeEventListener("hth:consent-change", handler);
  }, []);

  return null;
}
