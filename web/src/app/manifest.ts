import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FantPub — рассказ на каждый день",
    short_name: "FantPub",
    description: "Один короткий рассказ в день. Классика на 5–10 минут, автора узнаете в конце.",
    lang: "ru",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // system canvas; the dark variant comes from the viewport theme-color media queries in the layout
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["books", "entertainment", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
