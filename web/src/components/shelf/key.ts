import { SITE_URL } from "@/lib/site";

/** The transfer link that /polka imports on open. */
export const transferLink = (key: string) => `${SITE_URL}/polka#key=${key}`;

/** Accepts a whole transfer link or the bare key; null when it is neither. */
export function parseKey(input: string): string | null {
  const s = input.trim();
  const m = s.match(/key=([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{16,}$/.test(s) ? s : null;
}
