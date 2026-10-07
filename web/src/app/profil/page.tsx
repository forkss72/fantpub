import type { Metadata } from "next";
import { ProfileScreen } from "@/components/profile/ProfileScreen";
import { getPublishedStories } from "@/lib/content";
import { toCard } from "@/lib/cards";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Профиль",
  description: "Цели чтения, достижения, статистика и настройки. Всё хранится в вашем браузере, без регистрации.",
  alternates: { canonical: "/profil" },
  robots: { index: false, follow: true },
};

export default function ProfilePage() {
  return <ProfileScreen cards={getPublishedStories().map(toCard)} />;
}
