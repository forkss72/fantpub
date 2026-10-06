"use client";

import { useLayoutEffect } from "react";
import { getShelf } from "@/lib/shelf";

/**
 * Puts author & year under the seal for client-side navigations from today's ritual
 * (the inline head script covers full page loads). Runs before paint — no flash.
 */
export function BlindGate({ slug }: { slug: string }) {
  useLayoutEffect(() => {
    const html = document.documentElement;
    let blind = false;
    try {
      const riddle = new URLSearchParams(location.search).get("z") === "1";
      const fromRitual = sessionStorage.getItem("fantpub:blind") === slug;
      blind = riddle || (fromRitual && !getShelf().read[slug]);
    } catch {}
    if (blind) html.dataset.blind = "1";
    else if (html.dataset.blind === "1") delete html.dataset.blind;
    return () => {
      delete html.dataset.blind;
    };
  }, [slug]);
  return null;
}
