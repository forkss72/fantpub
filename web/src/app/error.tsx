"use client";

import Link from "next/link";
import { Pabchik } from "@/components/Pabchik";

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="page" style={{ display: "grid", justifyItems: "center", gap: 14, textAlign: "center", paddingTop: 60 }}>
      <Pabchik pose="sad" size={150} priority />
      <h1 className="display" style={{ margin: 0, fontSize: 30 }}>
        Что-то застряло в типографии
      </h1>
      <p style={{ margin: 0, maxWidth: "34ch", color: "var(--fp-ink-2)", lineHeight: 1.5 }}>
        Это наша вина, не ваша. Попробуйте ещё раз — обычно помогает. Полка и прогресс никуда не делись.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" className="pill" onClick={() => retry()}>
          Попробовать снова
        </button>
        <Link href="/" className="pill pill--ghost">
          На главную
        </Link>
      </div>
    </main>
  );
}
