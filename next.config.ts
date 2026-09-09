import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},
  async redirects() {
    return [
      {
        source: "/trauort/chateau-d-aigle",
        destination: "/trauort/aigle-chateau-d-aigle",
        permanent: true
      },
      {
        source: "/trauort/trauung-in-ebikon-amtliches-trauungslokal-ebikon-8a4cface",
        destination: "/trauort/trauung-in-ebikon-amtliches-trauungslokal-ebikon",
        permanent: true
      }
    ];
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
      ]
    }];
  }
};

export default nextConfig;
