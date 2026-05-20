"use client";
import { useEffect } from "react";
import { readConsent } from "@/lib/tracking/consent";
import { initMetaPixel } from "@/lib/tracking/dataLayer";
import type { ConsentState } from "@/lib/tracking/types";

export function MetaPixel() {
  useEffect(() => {
    const { state } = readConsent();
    if (state.marketing) initMetaPixel();

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ConsentState>).detail;
      if (detail?.marketing) initMetaPixel();
    };
    window.addEventListener("hth:consent-change", handler);
    return () => window.removeEventListener("hth:consent-change", handler);
  }, []);

  return null;
}
