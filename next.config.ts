import type { NextConfig } from "next";

const cspHeader = [
  "default-src 'self'",
  // Next.js requires 'unsafe-inline' for its runtime scripts and JSON-LD
  "script-src 'self' 'unsafe-inline'",
  // Inline styles are used extensively; Google Fonts stylesheet is loaded via next/font (no external CSS request)
  "style-src 'self' 'unsafe-inline'",
  // Google Fonts glyphs
  "font-src 'self' https://fonts.gstatic.com",
  // Images: self, data URIs, blob URLs
  "img-src 'self' data: blob:",
  // API calls: own origin + Supabase
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  // No plugins, objects, or frames from external sources
  "object-src 'none'",
  "frame-src 'none'",
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
