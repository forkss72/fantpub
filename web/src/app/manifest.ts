import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FantPub — рассказ на каждый день",
    short_name: "FantPub",
    description: "Один короткий рассказ в день. Сломайте печать, прочитайте за 5–10 минут и угадайте автора.",
    lang: "ru",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f2e7",
    theme_color: "#f6f2e7",
    categories: ["books", "entertainment", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
