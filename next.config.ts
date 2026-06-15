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
  // Images: self, data URIs, blob URLs, Meta Pixel 1x1 tracking pixels, GTM resources
  "img-src 'self' data: blob: https://www.facebook.com https://www.googletagmanager.com",
  // API calls: own origin + Supabase + Meta CAPI/Pixel beacons + GTM telemetry
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com https://graph.facebook.com",
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
