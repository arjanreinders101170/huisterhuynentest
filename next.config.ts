import type { NextConfig } from "next";
import { SEO_REDIRECTS } from "./src/lib/redirects";

const cspHeader = [
  "default-src 'self'",
  // Next.js requires 'unsafe-inline' for its runtime scripts and JSON-LD.
  // Meta Pixel + GTM load external scripts from googletagmanager.com (gtm.js)
  // and connect.facebook.net (fbevents.js).
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
  // Inline styles worden overal gebruikt. De adminlogin laadt daarnaast een
  // stylesheet van fonts.googleapis.com; die host stond niet in style-src,
  // waardoor het lettertype daar stil terugviel.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Google Fonts glyphs
  "font-src 'self' https://fonts.gstatic.com",
  // Images: self, data URIs, blob URLs, Meta Pixel 1x1 tracking pixels, GTM resources,
  // GA4 image-beacon fallback
  "img-src 'self' data: blob: https://www.facebook.com https://www.googletagmanager.com https://*.google-analytics.com",
  // API calls: own origin + Supabase + Meta CAPI/Pixel beacons + GTM telemetry.
  // GA4 verstuurt zijn hits naar *.google-analytics.com (EU: region1.…) en
  // *.analytics.google.com; zonder deze twee blokkeert de CSP elke meting.
  // stats.g.doubleclick.net is bewust NIET toegestaan — pas nodig bij Google Signals/Ads.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://connect.facebook.net https://www.facebook.com https://graph.facebook.com",
  // GTM noscript iframe fallback
  "frame-src https://www.googletagmanager.com",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          // Stond eerder alleen in vercel.json, waardoor HSTS stilzwijgend
          // zou verdwijnen bij een deploy buiten Vercel. Hier hoort hij,
          // naast de rest van de headers.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
  async redirects() {
    // Bron: src/lib/redirects.ts — dezelfde lijst filtert de sitemap en de
    // overzichtspagina's, zodat een 301'd pad nergens meer opduikt.
    // Expliciet 301 in plaats van `permanent: true` (dat levert een 308 op):
    // 301 is de status die in de SEO-analyse staat en die elke crawler kent.
    return SEO_REDIRECTS.map(({ from, to }) => ({
      source: from,
      destination: to,
      statusCode: 301,
    }));
  },
  async rewrites() {
    return [
      {
        source: "/app",
        destination: "/concierge",
      },
      {
        source: "/app/:path*",
        destination: "/concierge/:path*",
      },
    ];
  },
};

export default nextConfig;
