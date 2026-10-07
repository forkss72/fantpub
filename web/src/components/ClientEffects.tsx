"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { applyPrefs, getShelf } from "@/lib/shelf";

type BIPEvent = Event & { prompt: () => Promise<void> };
declare global {
  interface Window {
    __fpInstall?: BIPEvent | null;
  }
}

/**
 * App-wide side effects, mounted once in the root layout:
 * service worker (prod only), the install prompt, in-app navigation depth for «Назад»,
 * following the system appearance while «Авто» is selected, and skipping our transition when iOS animates back.
 */
export function ClientEffects() {
  const pathname = usePathname();

  // count in-app navigations so the reader's back button knows whether history is ours
  useEffect(() => {
    try {
      const n = Number(sessionStorage.getItem("fantpub:depth") ?? "0") + 1;
      sessionStorage.setItem("fantpub:depth", String(n));
    } catch {}
  }, [pathname]);

  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault();
      window.__fpInstall = e as BIPEvent;
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      const p = getShelf().prefs;
      if (p.appearance === "auto") applyPrefs(p);
    };
    mq.addEventListener("change", onScheme);

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      const register = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
      if (document.readyState === "complete") register();
      else window.addEventListener("load", register, { once: true });
    }
    // iOS edge-swipe back already animates: don't stack our view transition on top
    const onPop = (e: PopStateEvent) => {
      if (!(e as PopStateEvent & { hasUAVisualTransition?: boolean }).hasUAVisualTransition) return;
      document.documentElement.dataset.uaNav = "";
      setTimeout(() => delete document.documentElement.dataset.uaNav, 700);
    };
    addEventListener("popstate", onPop, { capture: true });

    return () => {
      removeEventListener("popstate", onPop, { capture: true });
      window.removeEventListener("beforeinstallprompt", onBIP);
      mq.removeEventListener("change", onScheme);
    };
  }, []);

  return null;
}
