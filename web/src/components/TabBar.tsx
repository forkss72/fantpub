"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Books, MagnifyingGlass, SquaresFour, type IconType } from "./ui/icons";
import { GlassLens } from "./GlassLens";
import styles from "./TabBar.module.css";

const TABS: { href: Route; label: string; icon: IconType; match: (p: string) => boolean }[] = [
  { href: "/", label: "Сегодня", icon: BookOpen, match: (p) => p === "/" },
  { href: "/arhiv", label: "Архив", icon: SquaresFour, match: (p) => p.startsWith("/arhiv") || p.startsWith("/avtor") },
  { href: "/polka", label: "Полка", icon: Books, match: (p) => p.startsWith("/polka") || p.startsWith("/profil") },
];

/** Hidden where the content must be alone: the reader. */
const HIDDEN = (p: string) => p.startsWith("/rasskaz/");

/**
 * Floating Liquid Glass tab bar (iOS 26/27 numbers: 62px capsule, 21px insets, concentric
 * selected pill) with search as its own circle. Shrinks to the current tab while scrolling down.
 */
export function TabBar() {
  const pathname = usePathname();
  const [min, setMin] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    last.current = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const d = y - last.current;
        if (Math.abs(d) < 10) return;
        setMin(d > 0 && y > 140);
        last.current = y;
      });
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (HIDDEN(pathname)) return null;
  const searchActive = pathname.startsWith("/poisk");
  const minimized = min && !searchActive;

  return (
    <nav className={styles.bar} aria-label="Разделы" data-min={minimized ? "" : undefined} style={{ viewTransitionName: "tabbar" }}>
      <div className={`${styles.tabs} glass`} id="tabbar-pill" data-refract={minimized ? undefined : ""}>
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={styles.tab}
              aria-current={active ? "page" : undefined}
              data-active={active ? "" : undefined}
              onClick={() => setMin(false)}
            >
              <Icon size={25} weight={active ? "fill" : "regular"} aria-hidden="true" />
              <span className={styles.label}>{label}</span>
            </Link>
          );
        })}
      </div>
      <Link
        href="/poisk"
        className={`${styles.search} glass press`}
        aria-label="Поиск"
        aria-current={searchActive ? "page" : undefined}
        data-active={searchActive ? "" : undefined}
      >
        <MagnifyingGlass size={24} weight={searchActive ? "bold" : "regular"} aria-hidden="true" />
      </Link>
      <GlassLens targetId="tabbar-pill" />
    </nav>
  );
}
