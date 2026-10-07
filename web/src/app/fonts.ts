import { Literata, Old_Standard_TT, Onest } from "next/font/google";

/**
 * Titles use ui-serif first (New York on Apple devices, zero bytes); Literata is the
 * Cyrillic serif everywhere else, the face printed on covers, and the default reading face.
 */
export const literata = Literata({
  subsets: ["cyrillic"],
  style: ["normal", "italic"],
  variable: "--font-literata",
  display: "swap",
});

/** «Спокойная» theme: revival of the Russian book face Chekhov and Grin were printed in. */
export const oldStandard = Old_Standard_TT({
  subsets: ["cyrillic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-oldstandard",
  display: "swap",
  preload: false,
});

/** «Фокус» theme and the small publisher line on covers. */
export const onest = Onest({
  subsets: ["cyrillic"],
  variable: "--font-onest",
  display: "swap",
  preload: false,
});

export const fontVars = [literata, oldStandard, onest].map((f) => f.variable).join(" ");
