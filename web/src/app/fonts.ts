import { IBM_Plex_Mono, Literata, Lora, Onest, PT_Serif } from "next/font/google";

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
  axes: ["opsz"],
  variable: "--font-literata",
  display: "swap",
});

/** Second reading option: classic Russian serif. Not preloaded — only used on demand. */
export const ptSerif = PT_Serif({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-ptserif",
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

export const fontVars = [lora, literata, ptSerif, onest, plexMono].map((f) => f.variable).join(" ");
