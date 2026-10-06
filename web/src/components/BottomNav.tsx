"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import styles from "./BottomNav.module.css";

const ITEMS: { href: Route; label: string; icon: React.ReactNode; match: (p: string) => boolean }[] = [
  {
    href: "/",
    label: "Сегодня",
    match: (p) => p === "/",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.5 5.5c2.6-.9 5.2-.7 7.5.8 2.3-1.5 4.9-1.7 7.5-.8v13c-2.6-.9-5.2-.7-7.5.8-2.3-1.5-4.9-1.7-7.5-.8z" />
        <path d="M12 6.3v13" />
        <circle cx="16.5" cy="15" r="2.2" className={styles.fill} />
      </svg>
    ),
  },
  {
    href: "/arhiv",
    label: "Архив",
    match: (p) => p.startsWith("/arhiv") || p.startsWith("/avtor"),
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4.5" width="16" height="15" rx="2" />
        <path d="M4 9h16M9.3 9v10.5M14.7 9v10.5M8 3v3M16 3v3" />
      </svg>
    ),
  },
  {
    href: "/polka",
    label: "Полка",
    match: (p) => p.startsWith("/polka"),
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 20h17" />
        <rect x="5" y="6" width="3.2" height="14" rx=".6" />
        <rect x="9.2" y="4" width="3.2" height="16" rx=".6" />
        <path d="M14 8.4l3-.8 3.3 12-3 .8z" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/rasskaz/")) return null;
  return (
    <nav className={styles.nav} aria-label="Разделы" style={{ viewTransitionName: "site-nav" }}>
      <ul className={styles.list}>
        {ITEMS.map((it) => {
          const active = it.match(pathname);
          return (
            <li key={it.href}>
              <Link href={it.href} className={styles.item} aria-current={active ? "page" : undefined}>
                {it.icon}
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
