import type { CSSProperties } from "react";
import type { CoverColors } from "./types";

/** CSS variables that paint a surface with a story's cover colours (field, glass tint, accents). */
export function coverVars(c: CoverColors): CSSProperties {
  return {
    "--cover-base": c.base,
    "--cover-bg": c.bg,
    "--cover-dark": c.dark,
    "--cover-light": c.light,
    "--cover-tint": c.tint,
  } as CSSProperties;
}
