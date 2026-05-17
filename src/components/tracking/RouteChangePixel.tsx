"use client";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pushEvent, baseEnvelope } from "@/lib/tracking/dataLayer";

function RouteChangeTracker() {
  const path = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    if (!path) return;
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
