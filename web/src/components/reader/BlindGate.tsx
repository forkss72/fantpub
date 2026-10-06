"use client";

import { useLayoutEffect } from "react";
import { getShelf } from "@/lib/shelf";

/**
 * Puts author & year under the seal for client-side navigations from today's ritual
 * (the inline head script covers full page loads). Runs before paint — no flash.
 * While sealed, the tab title is masked too and kept masked even if Next re-applies metadata.
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
    if (!blind) {
      if (html.dataset.blind === "1") delete html.dataset.blind;
      return;
    }
    html.dataset.blind = "1";
    const masked = `«${title}» — рассказ дня · FantPub`;
    const apply = () => {
      if (html.dataset.blind !== "1" || document.title === masked) return;
      html.dataset.realTitle = document.title;
      document.title = masked;
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => {
      mo.disconnect();
      delete html.dataset.blind;
      delete html.dataset.realTitle;
    };
  }, [slug, title]);
  return null;
}
