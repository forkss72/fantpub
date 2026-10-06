import { IBM_Plex_Mono, Literata, Lora, Old_Standard_TT, Onest } from "next/font/google";

/** Display: wordmark, titles, big numbers. */
export const lora = Lora({
  subsets: ["cyrillic", "latin"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

/** Default reading face (made by Google for Play Books). */
export const literata = Literata({
  subsets: ["cyrillic", "latin"],
  style: ["normal", "italic"],
  variable: "--font-literata",
  display: "swap",
  // only the reader needs it; don't make every page pay ~150 KB upfront
  preload: false,
});

/** «Классика»: revival of the Russian book face Chekhov and Grin were printed in. Loaded on demand. */
export const oldStandard = Old_Standard_TT({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-oldstandard",
  display: "swap",
  preload: false,
});

/** Interface + third reading option (sans). */
export const onest = Onest({
  subsets: ["cyrillic", "latin"],
  variable: "--font-onest",
  display: "swap",
});

/** Dates, issue numbers, service labels. */
export const plexMono = IBM_Plex_Mono({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const fontVars = [lora, literata, oldStandard, onest, plexMono].map((f) => f.variable).join(" ");
