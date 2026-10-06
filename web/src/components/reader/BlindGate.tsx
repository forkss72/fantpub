"use client";

import { useLayoutEffect } from "react";
import { getShelf } from "@/lib/shelf";

/**
 * Puts author & year under the seal for client-side navigations from today's ritual
 * (the inline head script covers full page loads). Runs before paint — no flash.
 */
export function BlindGate({ slug, title }: { slug: string; title: string }) {
  useLayoutEffect(() => {
    const html = document.documentElement;
    let blind = false;
    try {
      const riddle = new URLSearchParams(location.search).get("z") === "1";
      const fromRitual = sessionStorage.getItem("fantpub:blind") === slug;
      const s = getShelf();
      blind = riddle || (fromRitual && s.prefs.blind && !s.read[slug]);
    } catch {}
    if (blind) {
      html.dataset.blind = "1";
      // the tab title and history entry must not give the author away either
      html.dataset.realTitle = document.title;
      document.title = `«${title}» — рассказ дня · FantPub`;
    } else if (html.dataset.blind === "1") delete html.dataset.blind;
    return () => {
      delete html.dataset.blind;
      delete html.dataset.realTitle;
    };
  }, [slug, title]);
  return null;
}
