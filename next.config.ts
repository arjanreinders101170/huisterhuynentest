import type { NextConfig } from "next";
import { SEO_REDIRECTS } from "./src/lib/redirects";

const cspHeader = [
  "default-src 'self'",
  // Next.js requires 'unsafe-inline' for its runtime scripts and JSON-LD.
  // Meta Pixel + GTM load external scripts from googletagmanager.com (gtm.js,
  // gtag.js) en connect.facebook.net (fbevents.js). De Google Ads-basistag
  // laadt vanuit gtag.js nog een remarketing-script na van googleadservices.com
  // en googleads.g.doubleclick.net; zonder die twee blijft de tag steken op de
  // basispageview en meet remarketing niets.
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://connect.facebook.net",
  // Inline styles worden overal gebruikt. De adminlogin laadt daarnaast een
  // stylesheet van fonts.googleapis.com; die host stond niet in style-src,
  // waardoor het lettertype daar stil terugviel.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Google Fonts glyphs
  "font-src 'self' https://fonts.gstatic.com",
  // Images: self, data URIs, blob URLs, Meta Pixel 1x1 tracking pixels, GTM resources,
  // GA4 image-beacon fallback. Google Ads vuurt zijn conversie- en
  // remarketingpixels af op doubleclick.net en op het Google-domein van het land
  // van de bezoeker — .nl en .de zijn de twee markten van deze site, .com is de
  // terugval.
  "img-src 'self' data: blob: https://www.facebook.com https://www.googletagmanager.com https://*.google-analytics.com https://*.doubleclick.net https://www.google.com https://www.google.nl https://www.google.de",
  // API calls: own origin + Supabase + Meta CAPI/Pixel beacons + GTM telemetry.
  // GA4 verstuurt zijn hits naar *.google-analytics.com (EU: region1.…) en
  // *.analytics.google.com; zonder deze twee blokkeert de CSP elke meting.
  // doubleclick.net staat er sinds de Google Ads-tag wél bij: daar landen de
  // conversie- en remarketingverzoeken (stats.g. / googleads.g. / td.).
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.doubleclick.net https://www.googleadservices.com https://www.google.com https://www.google.nl https://www.google.de https://connect.facebook.net https://www.facebook.com https://graph.facebook.com",
  // GTM noscript iframe fallback + de cookie-sync-iframe van Google Ads
  "frame-src https://www.googletagmanager.com https://*.doubleclick.net",
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
