/**
 * Foil-stamp motifs for the clothbound covers. 48×48 line art, round caps,
 * drawn with `currentColor` so the same motif can be gilt on cloth or ink on paper.
 */
export const MOTIFS: Record<string, string> = {
  window:
    '<rect x="12" y="8" width="24" height="32" rx="1.5"/><path d="M24 8v32M12 24h24"/><path d="M8 14.5l32 8M8 31.5l32-7.5" stroke-width="3.2"/><circle cx="19" cy="18" r=".9" fill="currentColor"/><circle cx="29" cy="28.5" r=".9" fill="currentColor"/>',
  star: '<path d="M24 5l3.4 13.2L40.5 22l-13.1 3.8L24 39l-3.4-13.2L7.5 22l13.1-3.8z"/><path d="M38 6v6M35 9h6M10 34v5M7.5 36.5h5"/>',
  eye: '<path d="M5 24c5.5-8 11.8-12 19-12s13.5 4 19 12c-5.5 8-11.8 12-19 12S10.5 32 5 24z"/><circle cx="24" cy="24" r="6"/><circle cx="24" cy="24" r="2" fill="currentColor"/>',
  door: '<path d="M14 42V9.5c0-.8.7-1.5 1.5-1.5h17c.8 0 1.5.7 1.5 1.5V42M9 42h30"/><path d="M17.5 12h13v26h-13z"/><circle cx="29" cy="26" r="1.3" fill="currentColor"/>',
  doors: '<path d="M6 40V12h14v28M28 40V12h14v28M3 40h42"/><circle cx="17" cy="27" r="1.2" fill="currentColor"/><circle cx="31" cy="27" r="1.2" fill="currentColor"/><path d="M13 7l-2-3M35 7l2-3"/>',
  key: '<circle cx="14" cy="24" r="7.5"/><circle cx="14" cy="24" r="2.6"/><path d="M21.5 24H43M36 24v6.5M41 24v4.5"/>',
  clock: '<circle cx="24" cy="25" r="15"/><path d="M24 15v10l-6.5 4.5"/><path d="M6 13.5a20 20 0 0 1 6-6.5M6 13.5l5.5.6M6 13.5l.4-5.4"/>',
  moon: '<path d="M30.5 7.5A16.5 16.5 0 1 0 40.5 35 13.5 13.5 0 0 1 30.5 7.5z"/><path d="M38 12v4M36 14h4"/>',
  candle: '<path d="M19 21h10v19H19zM14 40h20"/><path d="M24 21v-4"/><path d="M24 17c-3.6-3-1.6-7.6 0-10.2 1.6 2.6 3.6 7.2 0 10.2z"/>',
  mask: '<path d="M11 11c8.7 3.4 17.3 3.4 26 0v13c0 7.6-5.8 14-13 14s-13-6.4-13-14z"/><path d="M16.5 21.5c2-1.4 4.4-1.4 6 0M25.5 21.5c1.6-1.4 4-1.4 6 0M18.5 30c3.6 2.4 7.4 2.4 11 0"/>',
  ship: '<path d="M7 33h34l-4.5 7h-25z"/><path d="M24 7v26M24 8.5l12 19H24M24 12l-9.5 15.5H24"/><path d="M24 7l5 2-5 2"/>',
  anchor: '<circle cx="24" cy="10" r="3.5"/><path d="M24 13.5V41M16 20h16M9.5 29.5C9.5 36 16 41 24 41s14.5-5 14.5-11.5M9.5 29.5L6 33M38.5 29.5L42 33"/>',
  telescope: '<path d="M8 22.5l24-9 3 7.4-24 9z"/><path d="M32 13.5l4.5-1.6 3 7.4-4.5 1.8M20 27l-5 14M22.5 26l6 15M10.5 21.5l1.4 3.6"/>',
  hourglass: '<path d="M13 7h22M13 41h22M16 7c0 9.5 8 11.5 8 17s-8 7.5-8 17M32 7c0 9.5-8 11.5-8 17s8 7.5 8 17"/><path d="M19.5 37.5L24 33l4.5 4.5z" fill="currentColor"/>',
  rose: '<circle cx="24" cy="15" r="7.5"/><path d="M24 15c2.2-2 4.4 1 2.2 3.2s-5.4 0-4.2-4.2 6.4-4 8.2.2"/><path d="M24 22.5V43M24 33c-4-4.4-9.4-3.4-10.6 0 3.2 2.2 7.4 2.2 10.6 0zM24 30.5c4-3.4 8.6-2.4 9.8 1-3.2 2.2-6.6 2-9.8-1z"/>',
  skull: '<path d="M11.5 22a12.5 12.5 0 1 1 25 0c0 5.2-3 7.6-4.2 8.6V37H15.7v-6.4C14.5 29.6 11.5 27.2 11.5 22z"/><circle cx="18.8" cy="23" r="3.2"/><circle cx="29.2" cy="23" r="3.2"/><path d="M22.3 31.5L24 28.6l1.7 2.9M20 37v-3.4M24 37v-3.4M28 37v-3.4"/>',
  bell: '<path d="M13.5 33.5c2-2.2 3.5-5.4 3.5-10.6 0-5.2 3.2-9.4 7-9.4s7 4.2 7 9.4c0 5.2 1.5 8.4 3.5 10.6z"/><path d="M11 33.5h26M20.8 37.5a3.3 3.3 0 0 0 6.4 0M24 13.5V9.5"/>',
  lantern: '<path d="M17.5 14h13l2 4.2v16.6l-2 4.2h-13l-2-4.2V18.2z"/><path d="M20 10h8M24 10V6.5M15.5 18.5h17M15.5 34.5h17"/><path d="M24 22c-2.4 2.4-2.4 5.6 0 8 2.4-2.4 2.4-5.6 0-8z"/>',
  quill: '<path d="M39 7C24.5 9.5 14 20 12 36.5L8.5 42"/><path d="M39 7c-1.8 10.6-8.2 18.6-20.6 22.6M27 13.5l6.2 1M21 20.5l7.2 1M16.5 27.5l6.5.2"/>',
  comet: '<circle cx="32.5" cy="15.5" r="5.5"/><path d="M28.5 20L7 41.5M30.5 22L14 41M26.5 17.5L7 33.5"/>',
  waves: '<path d="M5 18c4.3-4 8.7-4 13 0s8.7 4 13 0 8.7-4 13 0M5 27c4.3-4 8.7-4 13 0s8.7 4 13 0 8.7-4 13 0M5 36c4.3-4 8.7-4 13 0s8.7 4 13 0 8.7-4 13 0"/>',
  tree: '<path d="M24 43V20M24 30l-6.5-5M24 26l6-5.5M24 36l7-5"/><path d="M13 19.5a11 11 0 0 1 22 0c0 6.4-5 9.5-11 9.5s-11-3.1-11-9.5z"/>',
  cat: '<path d="M14 41c-2.4-6.6-1.2-14.6 4-18.6L16 13l6.4 5.2h3.2L32 13l-2 9.4c5.2 4 6.4 12 4 18.6z"/><path d="M20 29h.1M28 29h.1" stroke-width="2.8"/><path d="M22.5 33.5l1.5 1 1.5-1"/>',
  web: '<path d="M24 5v38M5 24h38M10.6 10.6l26.8 26.8M37.4 10.6L10.6 37.4"/><path d="M24 12l8.5 3.5L36 24l-3.5 8.5L24 36l-8.5-3.5L12 24l3.5-8.5z"/><path d="M24 18.5l3.9 1.6L29.5 24l-1.6 3.9L24 29.5l-3.9-1.6L18.5 24l1.6-3.9z"/>',
  letter: '<rect x="7" y="12.5" width="34" height="23" rx="1.6"/><path d="M7.5 13.5L24 26l16.5-12.5"/><circle cx="24" cy="30" r="3.2" fill="currentColor"/>',
  planet: '<circle cx="24" cy="24" r="9.5"/><path d="M7.4 30.6c-2.2-4.2 6-10.8 16.6-14.8s19.2-4 18.6.4-6.8 10.6-17.4 14.6-15.6 4-17.8-.2z"/><path d="M38 9v4M36 11h4"/>',
  gear: '<circle cx="24" cy="24" r="5.5"/><circle cx="24" cy="24" r="12.5"/><path d="M24 6.5v5M24 36.5v5M6.5 24h5M36.5 24h5M11.6 11.6l3.6 3.6M32.8 32.8l3.6 3.6M11.6 36.4l3.6-3.6M32.8 15.2l3.6-3.6"/>',
  portrait: '<ellipse cx="24" cy="24" rx="12" ry="16"/><ellipse cx="24" cy="24" rx="15.5" ry="19.5"/><path d="M17.5 34c1-5 3.6-7 6.5-7s5.5 2 6.5 7"/><circle cx="24" cy="20" r="4.2"/>',
  hand: '<path d="M17 41V22.5a2.5 2.5 0 0 1 5 0V19a2.5 2.5 0 0 1 5 0v3a2.5 2.5 0 0 1 5 0v6c0 7-3.4 13-9 13z"/><path d="M17 27l-3.2-3.2a2.4 2.4 0 0 0-3.6 3.2L17 36"/>',
  flame: '<path d="M24 42c-7.2 0-12-5-12-11.4 0-8.6 7.6-11.4 7.6-21.6 4.8 3 7.6 7 7.6 12.6 1.6-1.2 2.6-3.4 2.8-5.6C33.6 19.6 36 24 36 30.6 36 37 31.2 42 24 42z"/><path d="M24 42c-3.4 0-5.6-2.4-5.6-5.4 0-4 3.6-5.4 5.6-9.4 2 4 5.6 5.4 5.6 9.4 0 3-2.2 5.4-5.6 5.4z"/>',
  sun: '<circle cx="24" cy="24" r="8"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2"/>',
  bottle: '<path d="M20 6h8M21 6v8c-4 2.4-7 6.6-7 11.6V40c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V25.6c0-5-3-9.2-7-11.6V6"/><path d="M14.5 27h19"/><path d="M19 33h.1M25 36h.1M28 31h.1" stroke-width="2.6"/>',
  book: '<path d="M24 12.5c-4-3-10-3.6-16-2.5v27c6-1.1 12-.5 16 2.5 4-3 10-3.6 16-2.5V10c-6-1.1-12-.5-16 2.5zM24 12.5v27"/>',
  crown: '<path d="M8 36l-2-20 10 8 8-13 8 13 10-8-2 20z"/><path d="M8 41h32"/><circle cx="24" cy="29" r="2" fill="currentColor"/>',
  mirror: '<ellipse cx="24" cy="19" rx="11" ry="13"/><path d="M24 32v9M18 41h12"/><path d="M18 14c1.6-2.4 3.6-3.6 6-3.6"/>',
  footprints: '<path d="M14.5 21c-2.6 0-4-3-4-7s1.6-7.5 4-7.5 4 3.5 4 7.5-1.4 7-4 7zM12 25.5h5.2M33.5 33c-2.6 0-4-3-4-7s1.6-7.5 4-7.5 4 3.5 4 7.5-1.4 7-4 7zM31 37.5h5.2"/>',
  umbrella: '<path d="M6 24a18 18 0 0 1 36 0c-2-2-4.4-2-6 0-2-2-4.4-2-6 0-2-2-4.4-2-6 0-2-2-4.4-2-6 0-2-2-4.4-2-6 0-2-2-4-2-6 0z"/><path d="M24 24v13a3.5 3.5 0 0 1-7 0M24 6V3.5"/>',
  train: '<rect x="12" y="7" width="24" height="27" rx="4"/><path d="M12 22h24M18 7v15M30 7v15"/><circle cx="18" cy="28" r="1.5" fill="currentColor"/><circle cx="30" cy="28" r="1.5" fill="currentColor"/><path d="M16 34l-4 7M32 34l4 7M14 39h20"/>',
  bird: '<path d="M7 27c6.4-.6 10.4-5.8 16.6-5.8 4.6 0 7.6 2.2 9.4 5.2l7.6-2-5.6 5.4c-1.2 6.4-7.4 10.6-14.6 10.6-5.6 0-10.2-2.4-13.4-6.8z"/><path d="M17.5 25.5c2.6-6.4 8-10.8 15.5-11.5-1.6 4.6-4.4 8-8 10"/><circle cx="31.2" cy="27.6" r="1.1" fill="currentColor"/>',
  feather: '<path d="M38 8c-12 0-24 8-24 22v10M14 40l-4 4"/><path d="M38 8c0 14-10 24-24 22M22 22l10-4M18 29l9-2"/>',
  snowflake: '<path d="M24 5v38M7.5 14.5l33 19M7.5 33.5l33-19"/><path d="M19.5 8.5L24 13l4.5-4.5M19.5 39.5L24 35l4.5 4.5M7 20.5l6.2-1.6-1.6-6.2M41 27.5l-6.2 1.6 1.6 6.2M7 27.5l6.2 1.6-1.6 6.2M41 20.5l-6.2-1.6 1.6-6.2"/>',
  cards:
    '<rect x="9" y="10" width="19" height="27" rx="2.5" transform="rotate(-12 18.5 23.5)"/><rect x="19" y="11" width="19" height="27" rx="2.5" transform="rotate(10 28.5 24.5)"/><path d="M28.6 18.5c-2.8 3.2-5.6 5-5.6 7.4a2.8 2.8 0 0 0 4.6 2.1V30.8h2v-2.8a2.8 2.8 0 0 0 4.6-2.1c0-2.4-2.8-4.2-5.6-7.4z" fill="currentColor" stroke="none" transform="rotate(10 28.5 24.5)"/>',
  scales: '<path d="M24 7v34M15 41h18M10 13h28M24 9.5a2 2 0 1 0 0 .1"/><path d="M10 13l-5 12h10zM38 13l-5 12h10zM5 25a5 5 0 0 0 10 0M33 25a5 5 0 0 0 10 0"/>',
};

export const MOTIF_KEYS = Object.keys(MOTIFS);

export function motifSvg(key: string): string {
  return MOTIFS[key] ?? MOTIFS.star;
}
