"use client";

const KEY = "fp:landing";

/** Called once per hard load (ClientEffects): the page this tab entered the app on. */
export function rememberLanding() {
  try {
    sessionStorage.setItem(KEY, location.pathname);
  } catch {}
}

/**
 * ✕ / ‹: step back only if the previous history entry is inside FantPub — i.e. we are not on the
 * page the visitor arrived on from outside (or reloaded). Otherwise go home instead of leaving the site.
 */
export function backOrHome(router: { back(): void; push(href: string): void }, home = "/") {
  let landing: string | null = null;
  try {
    landing = sessionStorage.getItem(KEY);
  } catch {}
  if (landing && landing !== location.pathname) router.back();
  else router.push(home);
}
