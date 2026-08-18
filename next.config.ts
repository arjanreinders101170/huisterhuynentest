import type { NextConfig } from "next";

const cspHeader = [
  "default-src 'self'",
  // Next.js requires 'unsafe-inline' for its runtime scripts and JSON-LD.
  // Meta Pixel + GTM load external scripts from googletagmanager.com (gtm.js)
  // and connect.facebook.net (fbevents.js).
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
  // Inline styles are used extensively; Google Fonts stylesheet is loaded via next/font (no external CSS request)
  "style-src 'self' 'unsafe-inline'",
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
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/landing",
        destination: "/",
        permanent: true,
      },
      {
        source: "/wellness-vakantie-drenthe-ontspannen-in-een-luxe-vakantiehuis-met-hottub",
        destination: "/wellness-vakantie-drenthe",
        permanent: true,
      },
      // De oude fietsslug was een volledige alinea (250+ tekens): wordt in de SERP
      // afgekapt en oogt als spam. Het artikel zelf staat nu op /blog/fietsen-in-drenthe
      // (zie migrations/2026_08_18_fietsslug_inkorten.sql).
      {
        source:
          "/blog/fietsen-in-drenthe-is-misschien-wel-de-mooiste-manier-om-de-provincie-echt-te-beleven-uitgestrekte-heidevelden-eeuwenoude-bossen-kronkelende-beekdalen-karakteristieke-brinkdorpen-en-kilometers-autoluwe-fietspaden-maken-drenthe-tot-een-waar-paradijs-voor-fietsers",
        destination: "/blog/fietsen-in-drenthe",
        permanent: true,
      },
    ];
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
