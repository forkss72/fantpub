import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
  },
  // Story markdown is read at build/ISR time from the filesystem.
  outputFileTracingIncludes: {
    "/*": ["./content/**/*", "./assets/**/*"],
  },
  // early slugs named the author (blind reading leak); old links keep working
  async redirects() {
    const renamed = { "kuprin-tost": "tost", "odoevsky-bal": "bal" };
    return Object.entries(renamed).flatMap(([from, to]) => [
      { source: `/rasskaz/${from}/:rest*`, destination: `/rasskaz/${to}/:rest*`, permanent: true },
      { source: `/rasskaz/${from}`, destination: `/rasskaz/${to}`, permanent: true },
      { source: `/kniga/${from}`, destination: `/kniga/${to}`, permanent: true },
    ]);
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/covers/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
