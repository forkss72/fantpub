import type { Metadata } from "next";
import { Masthead } from "@/components/Masthead";
import { ShelfView } from "@/components/ShelfView";
import { SiteFooter } from "@/components/SiteFooter";
import { getPublishedStories } from "@/lib/content";
import { toCard } from "@/lib/cards";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Ваша полка",
  description: "Прочитанные рассказы, реакции и настройки чтения. Всё хранится в вашем браузере — без регистрации.",
  robots: { index: false, follow: true },
};

export default function ShelfPage() {
  const cards = getPublishedStories().map(toCard);
  return (
    <main className="page page--wide" style={{ display: "grid", gap: 28 }}>
      <Masthead />
      <ShelfView cards={cards} />
      <SiteFooter />
    </main>
  );
}
