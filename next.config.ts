import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const nextConfig: NextConfig = {
  // The browser calls its own host. Nest still sees the booking slug in the URL, not a client tenant header.
  async rewrites() {
    if (!apiBaseUrl) return [];
    return [{ source: "/api/v1/:path*", destination: `${apiBaseUrl.replace(/\/$/, "")}/:path*` }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
        condition: { not: { path: "**/*.module.css" } },
      },
    },
  },
};

export default nextConfig;
