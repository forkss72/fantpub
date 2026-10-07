"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useHydrated, useShelf } from "@/lib/shelf";

const clean = (s: string) => s.replace(/[^a-z0-9-]/g, "");

/** CSS that lifts the seal for stories this reader has finished (see .seal-* in globals.css). */
export function unsealCss(slugs: string[]): string {
  if (!slugs.length) return "";
  const at = (sel: string) => slugs.map((k) => `:root[data-blind="1"] [data-seal="${clean(k)}"] ${sel}`).join(",");
  return `${at(".seal-real")}{display:inline}${at(".seal-mask")}{display:none}${at(".blind-only")}{display:none!important}${at(".reveal-only")}{display:revert!important}`;
}

/** The riddle link (?z=1) keeps a story sealed even for someone who has read it. */
function forcedSlug(pathname: string): string {
  if (typeof location === "undefined" || new URLSearchParams(location.search).get("z") !== "1") return "";
  return clean(pathname.split("/")[2] ?? "");
}

/**
 * Blind reading, kept in sync after hydration (the inline head script does the first paint):
 * authors of unread stories stay sealed everywhere, and a sealed story's tab title hides the author.
 */
export function BlindStyle() {
  const shelf = useShelf();
  const hydrated = useHydrated();
  const pathname = usePathname();
  // bumps when the URL changes without a navigation (the reveal drops ?z=1 via replaceState)
  const [urlTick, setUrlTick] = useState(0);
  useEffect(() => {
    const bump = () => setUrlTick((t) => t + 1);
    addEventListener("fp:url", bump);
    return () => removeEventListener("fp:url", bump);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const html = document.documentElement;
    const force = forcedSlug(pathname);
    const blind = shelf.prefs.blind || !!force;
    if (blind) html.dataset.blind = "1";
    else delete html.dataset.blind;
    let st = document.getElementById("fp-read") as HTMLStyleElement | null;
    if (!st) {
      st = document.createElement("style");
      st.id = "fp-read";
      document.head.appendChild(st);
    }
    st.textContent = blind ? unsealCss(Object.keys(shelf.read).filter((k) => k !== force)) : "";

    // a sealed story must not leak its author through the tab title
    const slug = pathname.startsWith("/rasskaz/") || pathname.startsWith("/kniga/") ? clean(pathname.split("/")[2] ?? "") : "";
    const sealed = !!slug && blind && (slug === force || !shelf.read[slug]);
    if (!sealed) {
      // unsealed on this page (the reveal): give the tab its real title back
      if (html.dataset.realTitle && document.title.endsWith("— рассказ дня · FantPub")) document.title = html.dataset.realTitle;
      delete html.dataset.realTitle;
      return;
    }
    const apply = () => {
      const h = document.querySelector("[data-seal-title]")?.textContent?.trim();
      if (!h) return;
      const masked = `«${h}» — рассказ дня · FantPub`;
      if (document.title === masked) return;
      html.dataset.realTitle = document.title;
      document.title = masked;
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => mo.disconnect();
  }, [hydrated, pathname, shelf.prefs.blind, shelf.read, urlTick]);

  return null;
}
