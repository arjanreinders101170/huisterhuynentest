"use client";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pushEvent, baseEnvelope } from "@/lib/tracking/dataLayer";
import { captureAttribution } from "@/lib/tracking/attribution";

function RouteChangeTracker() {
  const path = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    if (!path) return;
    // Vóór de PageView: anders mist de eerste pagina van een campagnebezoek
    // zijn eigen herkomst. Dit is eigen data die aan een aanvraag hangt —
    // er gaat niets van naar een derde partij.
    captureAttribution();
    pushEvent({ ...baseEnvelope("PageView") });
  }, [path, search]);
  return null;
}

/* Wrap in Suspense — Next.js 15 requires it for useSearchParams. */
export function RouteChangePixel() {
  return (
    <Suspense fallback={null}>
      <RouteChangeTracker />
    </Suspense>
  );
}
