import { CLOTHS } from "./cloth";
import { motifSvg } from "./motifs";
import type { ClothKey } from "./types";

/**
 * Standalone SVG of a clothbound cover (no text) — for OG images and share cards,
 * rendered by resvg inside ImageResponse. Mirrors <Cover/>.
 */
export function coverSvg({ motif, cloth, width = 400, height = 600 }: { motif: string; cloth: ClothKey; width?: number; height?: number }): string {
  const c = CLOTHS[cloth] ?? CLOTHS.forest;
  const m = motifSvg(motif);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 400 600">
  <defs>
    <linearGradient id="foil" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c.foil}"/><stop offset=".42" stop-color="${c.foilHi}"/><stop offset=".58" stop-color="${c.foil}"/><stop offset="1" stop-color="${c.foil}"/>
    </linearGradient>
    <linearGradient id="hinge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity=".38"/><stop offset=".035" stop-color="#000" stop-opacity=".08"/><stop offset=".05" stop-color="#fff" stop-opacity=".08"/><stop offset=".075" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="light" cx=".22" cy=".12" r="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <pattern id="weave" width="3" height="3" patternUnits="userSpaceOnUse">
      <rect width="3" height="1" fill="#000" fill-opacity=".07"/><rect width="1" height="3" fill="#fff" fill-opacity=".04"/>
    </pattern>
    <pattern id="pat" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="translate(-6 -10)">
      <g transform="translate(6 6) scale(.92)" fill="none" stroke="#fff" color="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${m}</g>
      <g transform="translate(56 56) scale(.92)" fill="none" stroke="#fff" color="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${m}</g>
      <circle cx="78" cy="22" r="1.6" fill="#fff"/><circle cx="28" cy="74" r="1.6" fill="#fff"/>
    </pattern>
    <mask id="mask"><rect width="400" height="600" fill="url(#pat)"/></mask>
  </defs>
  <rect width="400" height="600" rx="6" fill="${c.bg}"/>
  <rect width="400" height="600" fill="url(#weave)"/>
  <rect width="400" height="600" fill="url(#foil)" mask="url(#mask)" opacity=".92"/>
  <rect width="400" height="600" fill="url(#light)"/>
  <rect width="400" height="600" fill="url(#hinge)"/>
</svg>`;
}

export function svgDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
