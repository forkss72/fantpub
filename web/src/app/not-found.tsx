import Link from "next/link";
import { Masthead } from "@/components/Masthead";
import { Pabchik } from "@/components/Pabchik";

export default function NotFound() {
  return (
    <main className="page" style={{ display: "grid", gap: 24 }}>
      <Masthead />
      <div style={{ display: "grid", justifyItems: "center", gap: 14, textAlign: "center", paddingTop: 30 }}>
        <Pabchik pose="sad" size={160} />
        <h1 className="display" style={{ margin: 0, fontSize: 34 }}>
          Такой книги на полке нет
        </h1>
        <p style={{ margin: 0, maxWidth: "34ch", color: "var(--fp-ink-2)", lineHeight: 1.5 }}>
          Возможно, этот выпуск ещё запечатан и откроется позже. Или ссылка потерялась по дороге — Пабчик уже ищет.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/" className="pill">
            К рассказу дня
          </Link>
          <Link href="/arhiv" className="pill pill--ghost">
            Архив
          </Link>
        </div>
      </div>
    </main>
  );
}
