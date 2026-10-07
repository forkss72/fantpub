import type { Metadata } from "next";
import { preload } from "react-dom";
import { ShelfScreen } from "@/components/shelf/ShelfScreen";
import { getPublishedStories } from "@/lib/content";
import { toCard } from "@/lib/cards";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Полка",
  description: "Прочитанные рассказы, начатые и отложенные, сохранённые цитаты. Всё хранится в вашем браузере, без регистрации.",
  alternates: { canonical: "/polka" },
  robots: { index: false, follow: true },
};

export default function ShelfPage() {
  // the empty shelf's LCP image renders only after hydration: let the browser find it in the head
  preload("/pabchik/sleeping.webp", { as: "image", fetchPriority: "high" });
  return <ShelfScreen cards={getPublishedStories().map(toCard)} />;
}
