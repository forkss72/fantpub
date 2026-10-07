"use client";

import Link from "next/link";
import type { Route } from "next";
import { useShelf } from "@/lib/shelf";

/** The white capsule. Server markup says «Читать»; the shelf turns it into «Продолжить · 34%» or «Читать снова». */
export function ReadButton({ slug, className }: { slug: string; className?: string }) {
  const shelf = useShelf();
  const pct = shelf.percent[slug] ?? 0;
  const resume = !shelf.read[slug] && pct > 0 && pct < 100;
  const label = shelf.read[slug] ? "Читать снова" : resume ? `Продолжить · ${pct}%` : "Читать";
  return (
    <Link href={`/rasskaz/${slug}` as Route} transitionTypes={["open-book"]} className={className} data-long={resume ? "" : undefined}>
      <span className="num">{label}</span>
    </Link>
  );
}
