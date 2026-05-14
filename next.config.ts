import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    quality: 65,
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
