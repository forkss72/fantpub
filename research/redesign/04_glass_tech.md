# 04 · Glass & book objects on the web: technical research (Oct 2026)

Scope: how to build convincing, fast Liquid Glass and skeuomorphic book objects for FantPub 2.0 (Next.js 16.3.8, CSS Modules, mobile-first PWA, mostly Android Chrome and iOS Safari).
Method: modern-web-guidance (skill 2026_09_04) guides, MDN browser-compat-data (main branch, today), WebKit/Mozilla bug trackers, Apple HIG JSON, React/Next docs via Context7, pixel measurements of Apple Books iOS 26 screenshots (`research/mobbin/*_ab_*`), plus **working prototypes rendered in Playwright Chromium 153 and WebKit 26.6**. The prototypes are in `research/redesign/04_glass_proto/` and every snippet marked ✅ below was rendered there.

---

## 0. Decisions (TL;DR)

1. **Glass goes on the navigation layer only**: tab pill, floating buttons, reader controls, sheets. Never on covers, story text or cards. This is Apple's own rule (HIG, §2.1).
2. **Use a 4-rung ladder**: solid → frosted (`backdrop-filter`) → specular rim (gradient ring + mask) → refraction (SVG `feDisplacementMap` inside `backdrop-filter`). Refraction is **Blink-only**. Turn it on with a JS check (`navigator.userAgentData`), never with `@supports`, because Safari and Firefox parse the value and then draw no backdrop at all.
3. **iOS gets rungs 0–2 only**, and that is fine: iPhones already supply the "real glass" feel through the system chrome around the page. Android Chrome, Yandex Browser and Samsung Internet get the refraction "wow". On low-end devices refraction stays off.
4. **Budget**: at most 2 glass surfaces on screen while scrolling, blur 12–16 px, never animate blur radius, and no glass at all while the user is reading (bars auto-hide).
5. **Books are 2.5D by default** (flat cover with the measured Apple Books spine profile, plus a CSS page block). That renders identically in both engines. True CSS-3D is only for the "opening" moment.
6. **No page curl in the reader.** Keep the vertical scroll. Use the curl motif once, as a 30-line CSS corner peel on today's cover.
7. **Book → reader "opening" = React `<ViewTransition name>` shared element**, stable in React 19.3 and needing no config in Next 16. The cover morphs into a fixed full-screen "paper" layer, which is what Apple Books' open zoom looks like.
8. **Cover sheen follows scroll, not the gyroscope.** A scroll-driven animation needs no permission. Gyro tilt is opt-in from Settings because iOS shows a system permission prompt.

---

## 1. Platform facts as of 2026-10-07 (verified)

- **iOS 27 shipped on 2026-09-14** with Safari 27.0. It added a system **Liquid Glass opacity slider** (Settings → Appearance → Liquid Glass) plus contrast tweaks, and the slider value **is not exposed to the web** ([MacRumors](https://www.macrumors.com/2026/09/14/apple-releases-ios-27/), [9to5Mac](https://9to5mac.com/2026/09/14/ios-27-now-available-features-compatible-iphones/)). Safari 27 release notes do **not** mention backdrop-filter, SVG filters in backdrop, `prefers-reduced-transparency` or view-transition changes ([WebKit blog](https://webkit.org/blog/18325/webkit-features-for-safari-27-0/)).
- **React 19.3 (2026-09-09) made `<ViewTransition>` and `addTransitionType` stable** ([react.dev blog via Context7](https://github.com/reactjs/react.dev/blob/main/src/content/blog/2026/09/09/react-19-3.md)). npm `react@latest` = 19.3.0 and `next@latest` = 16.4.0. The project pins `react 19.2.8`, but the App Router uses Next's vendored React (`next/dist/compiled/react` = `19.3.0-canary-cbb046ab-20260731`), which already exports `ViewTransition`. `@types/react` 19.3.0 types it, and `next/link` has `transitionTypes`. The **`experimental.viewTransition` flag was removed** (inert; Next PR #96098), so "works with no configuration" ([Next docs](https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/view-transitions.mdx)). Bump `react`/`react-dom` to 19.3.0 for hygiene.

Support matrix (MDN BCD, today):

| Feature | Chrome/Android | Safari/iOS | Firefox |
|---|---|---|---|
| `backdrop-filter` | 76 | 18 unprefixed (9 with `-webkit-`) | 103 |
| SVG `url()` inside `backdrop-filter` | ✅ | ❌ draws nothing ([WebKit 245510](https://bugs.webkit.org/show_bug.cgi?id=245510), still NEW; 2026-09-05 comment says the test case **crashes the GPU process on trunk**) | ❌ ([1961378](https://bugzilla.mozilla.org/show_bug.cgi?id=1961378), NEW) |
| `prefers-reduced-transparency` | 118 | ❌ | flag only |
| `prefers-reduced-motion` | 74 | 10.1 | 63 |
| Scroll-driven animations (`animation-timeline`) | 115 | **26** | ❌ |
| `@container scroll-state(scrolled)` (scroll direction) | 144 | ❌ | ❌ |
| View transitions, same-document | 111 | 18 | 144 |
| VT `types` / `:active-view-transition-type()` | 125 | 18.2 | 147 |
| `view-transition-class` | 125 | 18.2 | 144 |
| Element-scoped `el.startViewTransition()` | 147 | ❌ | ❌ |
| Backdrop blur **during** a view transition | kept | **lost** ([WebKit 302256](https://bugs.webkit.org/show_bug.cgi?id=302256), NEW, last touched 2026-08-05) | lost |
| `corner-shape: squircle` | 139 | preview | preview |
| `@property` | 85 | 16.4 | 128 |
| `DeviceOrientationEvent.requestPermission()` | **152** (resolves "granted" without a prompt for now; blink-dev intent says the default may later become ASK) | iOS 14.5, shows a system prompt, needs user activation + HTTPS | ❌ |
| HTML-in-Canvas (`layoutsubtree`, `drawElementImage`) | origin trial 148–150, **ends 2026-10-20** | ❌ | ❌ |

Dead end: `-apple-visual-effect: -apple-system-glass-material` is real WebKit code, but it **does not work in Safari on the web**. It only works in WKWebView with the private `useSystemAppearance` preference ([alastair.is](https://alastair.is/apple-has-a-private-css-property-to-add-liquid-glass-effects-to-web-content/)). Ignore the blog posts that recommend it.

---

## 2. Liquid Glass on the web

### 2.1 What Apple's glass actually is (anatomy + rules)

Apple HIG "Materials" (fetched from `developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json`):
- "Liquid Glass forms a distinct functional layer for controls and navigation elements… **Don't use Liquid Glass in the content layer.**"
- "**Use Liquid Glass effects sparingly**… Limit these effects to the most important functional elements."
- **Regular** variant: "blurs and adjusts the luminosity of background content". Use it for components with a lot of text. **Clear** variant: only over visually rich media, and "if the underlying content is bright, consider adding a **dark dimming layer of 35% opacity**."
- "Scroll edge effects further enhance legibility by blurring and reducing the opacity of background content."

**Measured from the Apple Books iOS 26 screenshots** (1179×2676 @3x, `research/mobbin/06-…`, `01-…`):
- The tab bar over a yellow cover turns `rgb(212,175,87)` into `rgb(251,235,140)`. That is a luminosity lift with saturation kept, **not a milky white overlay**. The best CSS fits are `saturate(1.2) brightness(1.3)` + 30% white, or `saturate(2.0) brightness(1.2)` + 55% white. **Real Liquid Glass in light mode is fairly opaque**: the "10% white" Dribbble glassmorphism is the AI-slop version.
- The blur is strong: covers under the bar become smooth colour washes (about 12–16 pt). Lensing is concentrated in the outer ~15 pt (bezel), and the centre is undistorted.
- Edges: a bright 1 pt specular rim, strongest top-left with a weaker echo bottom-right, plus a very soft shadow. Buttons over a coloured hero (Book detail) are **tinted with the cover colour** rather than white.
- The selected tab is a darker capsule inside the pill (`rgb(235,235,235)` on `≈253` glass, i.e. about 6% black).

### 2.2 Rendering ladder: what each platform renders

| Rung | What | iOS Safari 26/27 | Android Blink (Chrome, Yandex, Samsung) | Desktop Chrome/Edge | Desktop Safari | Firefox |
|---|---|---|---|---|---|---|
| 0 | Solid ~92% fill (no backdrop support, reduced transparency, forced colors) | fallback | fallback | fallback | fallback | fallback |
| 1 | `backdrop-filter: blur() saturate() brightness()` + tint | ✅ | ✅ | ✅ | ✅ | ✅ |
| 2 | Specular rim (gradient ring via mask) + inner glow + soft shadow | ✅ | ✅ | ✅ | ✅ | ✅ |
| 3 | Edge refraction: `backdrop-filter: url(#lens) blur(3px) …` | ❌ (must not be sent) | ✅ if not low-end | ✅ | ❌ | ❌ |

Feature detection for rung 3: `CSS.supports('backdrop-filter','url(#x)')` returns true in Safari and Firefox, and both then render **no backdrop at all**. Gate on Blink instead: `navigator.userAgentData?.brands.some(b => b.brand === 'Chromium')`. WebKit and Gecko don't ship `userAgentData`, and Chrome on iOS is WebKit and doesn't expose it either. Verified: `true` in Chromium 153, `undefined` in WebKit 26.6.

### 2.3 Production recipe (✅ rendered: `04_glass_proto/glass_books.html`)

Tokens (light and dark):

```css
:root {
  --glass-blur: 14px;               /* 12–16; Apple's tab bar ≈ 12–16pt */
  --glass-fill: rgb(255 255 255 / 0.5);
  --glass-fill-text: rgb(255 255 255 / 0.72);  /* "regular" for text-heavy sheets */
  --glass-solid: rgb(250 250 248 / 0.92);      /* rung 0 */
  --glass-rim: rgb(255 255 255 / 0.95);
  --glass-rim-echo: rgb(255 255 255 / 0.6);
  --glass-shadow: 0 6px 24px rgb(0 0 0 / 0.12), 0 1px 2px rgb(0 0 0 / 0.06);
}
@media (prefers-color-scheme: dark) {
  :root {
    --glass-fill: rgb(30 30 32 / 0.55);
    --glass-fill-text: rgb(30 30 32 / 0.78);
    --glass-solid: rgb(28 28 30 / 0.94);
    --glass-rim: rgb(255 255 255 / 0.45);
    --glass-rim-echo: rgb(255 255 255 / 0.18);
    --glass-shadow: 0 6px 24px rgb(0 0 0 / 0.4), 0 1px 2px rgb(0 0 0 / 0.3);
  }
}
```

(The app has its own theme switch, so mirror these under its `[data-theme]` selectors as well.)

Glass component, rungs 0–2 for every browser:

```css
.glass {
  position: relative;
  isolation: isolate;
  border: 0;                         /* <button> UA border shows as a grey arc otherwise — seen in the first render */
  border-radius: 999px;
  color: inherit;
  background: var(--glass-solid);    /* rung 0 */
}
@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
  .glass {
    background: var(--glass-fill);
    /* literal values in the prefixed line: var() inside -webkit-backdrop-filter is reported flaky in older Safari */
    -webkit-backdrop-filter: blur(14px) saturate(1.8) brightness(1.15);
    backdrop-filter: blur(var(--glass-blur)) saturate(1.8) brightness(1.15);
  }
}
/* specular rim: 1px gradient ring; light from top-left, echo bottom-right */
.glass::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(var(--light-angle, 135deg),
    var(--glass-rim), rgb(255 255 255 / 0.15) 30%, rgb(255 255 255 / 0.05) 55%, var(--glass-rim-echo));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
  pointer-events: none;
}
/* inner glow (the "thickness") + soft float shadow */
.glass::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  box-shadow:
    inset 0 1px 6px rgb(255 255 255 / 0.55),
    inset 0 -6px 12px -6px rgb(0 0 0 / 0.06),
    var(--glass-shadow);
  pointer-events: none;
}
/* tinted variant over a coloured hero (Apple Books detail page) */
.glass[data-tint] {
  --glass-fill: color-mix(in oklab, var(--cover-dominant) 55%, rgb(255 255 255 / 0.35));
}
/* rung 3: only when JS sets html[data-refract] */
html[data-refract] .glass[data-refract] {
  -webkit-backdrop-filter: url(#lg-pill) blur(3px) saturate(1.8) brightness(1.15);
  backdrop-filter: url(#lg-pill) blur(3px) saturate(1.8) brightness(1.15);
}
/* accessibility rungs */
@media (prefers-reduced-transparency: reduce) {
  .glass, html[data-refract] .glass[data-refract] {
    background: var(--glass-solid);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
@media (prefers-contrast: more) {
  .glass { background: var(--glass-solid); outline: 1px solid CanvasText; }
}
@media (forced-colors: active) {
  .glass { background: Canvas; border: 1px solid CanvasText; }
}
/* "elastic" press, Liquid-Glass-like */
.glass:active { scale: 1.06; transition: scale 450ms var(--spring); }
:root { --spring: linear(0, 0.226 2%, 1.116 5.4%, 1.565 8.2%, 1.458 10.9%, 0.937 14.3%, 0.67 17.1%, 1.042 23.3%, 1.201 26.7%, 0.977 32.2%, 0.882 35.6%, 1.045 42.4%, 0.96 53.4%, 1.013 59.9%, 0.986 71.2%, 1); }
```

Rung 3, the edge-refraction filter. It runs in Blink only (✅ Chromium 153). The map is generated once per size, takes about 18k pixels, and costs well under 1 ms:

```tsx
// components/GlassLens.tsx  (mount once in layout, next to the tab bar)
"use client";
import { useEffect } from "react";

const isBlink = () =>
  typeof navigator !== "undefined" &&
  !!(navigator as any).userAgentData?.brands?.some((b: { brand: string }) => b.brand === "Chromium");
const isLowEnd = () =>
  ((navigator as any).deviceMemory ?? 8) < 4 || (navigator.hardwareConcurrency ?? 8) < 4; // ponytail: crude gate; calibrate on a Mali-G57-class phone

/** R/G-encoded displacement for a pill: lensing only in the outer `bezel` px, centre untouched. */
function pillMap(w: number, h: number, bezel: number): Promise<string> {
  const W = Math.round(w), H = Math.round(h), R = H / 2;
  const c = new OffscreenCanvas(W, H), ctx = c.getContext("2d")!;
  const img = ctx.createImageData(W, H), d = img.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const px = x + 0.5 - W / 2, py = y + 0.5 - H / 2;
    const qx = Math.abs(px) - (W / 2 - R), qy = Math.abs(py) - (H / 2 - R);
    const inside = -(Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - R);
    let nx = 0, ny = 0; // outward normal
    if (qx > 0 && qy > 0) { const l = Math.hypot(qx, qy) || 1; nx = (qx / l) * Math.sign(px); ny = (qy / l) * Math.sign(py); }
    else if (qx > qy) nx = Math.sign(px); else ny = Math.sign(py);
    const t = Math.min(Math.max(inside / bezel, 0), 1);
    const mag = Math.pow(1 - t, 2.2);          // steep at the rim, 0 at the bezel's inner edge
    const i = (y * W + x) * 4;
    d[i] = 128 - nx * mag * 127;               // sample inward: never reads outside the backdrop
    d[i + 1] = 128 - ny * mag * 127;
    d[i + 2] = 128; d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c.convertToBlob().then((b) => URL.createObjectURL(b));
}

export function GlassLens({ targetId }: { targetId: string }) {
  useEffect(() => {
    if (!isBlink() || isLowEnd() || matchMedia("(prefers-reduced-transparency: reduce)").matches) return;
    const el = document.getElementById(targetId);
    const fe = document.getElementById("lg-map");
    if (!el || !fe) return;
    let url = "";
    const fit = async () => {
      const r = el.getBoundingClientRect();
      URL.revokeObjectURL(url);
      url = await pillMap(r.width, r.height, 16);
      fe.setAttribute("href", url);
      fe.setAttribute("width", String(r.width));
      fe.setAttribute("height", String(r.height));
      document.documentElement.dataset.refract = "";
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => { ro.disconnect(); URL.revokeObjectURL(url); delete document.documentElement.dataset.refract; };
  }, [targetId]);

  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <filter id="lg-pill" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB" primitiveUnits="userSpaceOnUse">
        <feImage id="lg-map" x="0" y="0" preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="28" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
```

Notes:
- `scale` is the maximum shift in px (128 means 0, 0/255 means ∓scale/2). 24–32 reads as Apple. Above 40 it turns into a funhouse mirror.
- The filter is pinned to one element size. To use it on a second shape, add a second `<filter>`; one filter cannot serve elements of different sizes. Only animate `scale`; regenerating the map per frame is wasteful.
- Displacement samples **inward**, so it never needs pixels outside the element's backdrop. Outward sampling (kube.io's Snell model) needs about a 20 px overscan and leaves transparent gutters.
- For physically accurate profiles (convex squircle `y = ⁴√(1-(1-x)⁴)`, n = 1.5) see [kube.io](https://kube.io/blog/liquid-glass-css-svg/). The `pow(1-t, 2.2)` falloff above is visually indistinguishable at 16 px bezels and far less code.

### 2.4 Scroll edge effect (iOS 26 style), one layer (✅ Chromium)

Apple blurs and fades content under bars. Avoid the "7 stacked backdrop layers" progressive blur: each layer is a separate composited pass ([dev.to](https://dev.to/devyatov/liquid-glass-on-the-web-6-ways-to-build-it-with-css-and-svg-3m07)). One masked layer is enough:

```css
.edgeTop {
  position: fixed;
  inset: 0 0 auto;
  block-size: calc(env(safe-area-inset-top) + 72px);
  background: linear-gradient(var(--paper), rgb(from var(--paper) r g b / 0));
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  -webkit-mask-image: linear-gradient(#000 35%, transparent);
          mask-image: linear-gradient(#000 35%, transparent);
  pointer-events: none;
  z-index: 5;
}
```

The cheaper variant, and the default for the reader: drop the backdrop and mask the **scroller's** edge with `mask-image` (modern-web-guidance `soft-edge-content-fade`).

### 2.5 iOS Safari 26+ specifics that bite glass

- Safari 26+ **ignores `<meta name="theme-color">`** and tints its own Liquid Glass bars by sampling `position: fixed/sticky` elements that are within ~4 px of the top or ~3 px of the bottom, at least 80% of the viewport wide and at least 3 px tall. It reads `background-color` and `backdrop-filter`. If nothing qualifies, it uses the html/body background. It still samples elements with `opacity: 0`, and it ignores pseudo-elements and absolute children ([1ar.io](https://1ar.io/updates/safari-26-liquid-glass-web/), [jahir.dev](https://jahir.dev/blog/safari-toolbar), [Ben Frain](https://benfrain.com/ios26-safari-theme-color-tab-tinting-with-fixed-position-elements/)).
  - Rules: set an explicit `background-color` on `html` **and** `body` (the paper colour per theme). Floating pills inset by 10–14 px are safe. A full-width edge-hugging glass layer (like `.edgeTop`) **becomes** the status-bar tint, so give it the paper colour. Hide closed overlays with `display: none`, not `opacity: 0`.
  - The app currently sets `themeColor: "#f6f2e7"` in `layout.tsx`. That is harmless, but Safari 26+ no longer uses it.
- During any view transition, Safari and Firefox **drop backdrop blur** for about 400 ms (WebKit 302256). Keep `--glass-fill` at ≥ 0.5 alpha so the unblurred frame doesn't flash text through.
- Reduce Transparency and the iOS 27 glass slider are **not detectable** from the web. Defaults therefore must pass contrast with the blur gone: test text-on-glass against the worst backdrop (black body text scrolling under a white glass pill).

### 2.6 Performance budget (Android is where it hurts)

- Field data: on a **Galaxy A15 (Mali-G57 MC2, 90 Hz), Chrome 153**, seven `blur()` panels held the app at 75–80% of frames on time. GPU-process time was 8.2 ms/frame vs 4.7 ms with the blur removed, and p95 frame time was 22.3 ms vs 11.2 ms ([bot-crossing #74](https://github.com/Station-Sciences/bot-crossing/issues/74)). The shipped panels used `blur(18px) saturate(1.3)`, **the exact value FantPub uses today** in `BottomNav.module.css` and `ReaderBar.module.css`.
- Cost scales with blurred **area × radius** and is paid on every scroll frame for fixed surfaces. Rules:
  1. ≤ 2 glass surfaces visible while scrolling (tab pill + one button). The reader shows **0** while reading: bars auto-hide, which the app already does.
  2. Blur 12–16 px. Refraction uses `blur(3px)` because the displacement does the visual work.
  3. Never animate the blur radius. `SettingsSheet.module.css` currently transitions `::backdrop` `backdrop-filter: blur(0 → 3px)`: keep the blur constant (or drop it; Apple sheets dim rather than blur) and animate only the `background` alpha. Animate glass with `opacity`/`translate`/`scale` only.
  4. Don't put a backdrop-filter element inside an ancestor with `opacity < 1`, `filter`, `mask`, `clip-path` or `mix-blend-mode`. That ancestor becomes the "backdrop root" and the glass blurs nothing.
  5. `will-change` only during entrance animations.
  6. Refraction is limited to the tab pill (~300×62 px) and gated by `deviceMemory`/`hardwareConcurrency`. Before shipping, measure with a 30 s rAF sampler on a Helio G99/Mali-G57-class phone (Redmi Note 13, Galaxy A15/A25 are common in RU). If on-time frames fall below 95% at 60 Hz, drop rung 3 on that tier.
- On iPhone, WebKit composites `backdrop-filter` through Core Animation and it is generally cheap. The risk is mid/low Android, which is most of the audience.

### 2.7 Libraries: verdict

| Library | How | Verdict |
|---|---|---|
| `liquid-glass-react` (rdev) | SVG displacement in backdrop; "Safari and Firefox only partially support the effect (displacement will not be visible)" ([README](https://cdn.jsdelivr.net/npm/liquid-glass-react@1.1.1/README.md)) | Same rung 3 as above, but adds elasticity/aberration knobs FantPub doesn't need. Skip; ~60 lines of our own covers it. |
| `@specy/liquid-glass`, `liquidGL` | Three.js/WebGL + **html2canvas** screenshot of the DOM behind | No: heavy, the snapshot goes stale on scroll, web-font fidelity issues. |
| `liquid-glass-web-react` (PallavAg) | ~5 kB; refracts **the content element itself** via `filter: url()`, so it works cross-browser incl. iOS ([repo](https://github.com/PallavAg/liquid-glass-web-react)) | Not usable for fixed bars over scrolling content. Possible optional "wow": a draggable lens over the story text, i.e. Pabchik's glasses. Optional, not v1. |
| `-apple-visual-effect` | private WebKit property | Doesn't work on the web (§1). |

---

## 3. Skeuomorphic books

### 3.1 Apple Books cover: measured numbers

Sampled from `mobbin/06-home_ab_home_continue_shelf.jpg` (cover 467 px wide @3x ≈ 155 pt; flat cover luminance 185):

| Zone (from the spine edge, % of cover width) | Luminance | CSS equivalent |
|---|---|---|
| 0–1.1% outer spine edge | 146–155 (−20%) | black 0.20 |
| 1.1–1.6% ridge highlight | 196–215 (+16%) | white 0.35 |
| 1.7–2.8% | ~base | — |
| 3.0–4.5% hinge crease | 161–168 (−10%) | black 0.12 |
| 4.7–5.8% soft highlight | 190–199 | white 0.20 |
| ≥ 6.6% | flat | — |
| last 1.7% at the fore-edge | +4% | white 0.10 |
| top edge, ~1 pt | 210–215 | `inset 0 1px 0 rgb(255 255 255/.28)` |
| bottom edge, ~1 pt | −15% | `inset 0 -1px 0 rgb(0 0 0/.16)` |
| corner radius | ≈1.2–2% of width (2–3 px at 150 px) | nearly square |
| shadow | 30% darkening right at the bottom edge, falling off over ~27 pt downward; ~10% darkening ~12 pt sideways | 3-layer shadow below |

No page block is visible in Apple Books grids: covers are flat with spine light. Detail pages sit the cover on a full-bleed background in the **cover's dominant colour**, with tinted glass buttons.

### 3.2 Flat cover (✅ both engines)

```css
.cover {
  --w: 150px;
  position: relative;
  inline-size: var(--w);
  aspect-ratio: 2 / 3;
  border-radius: calc(var(--w) * .012) calc(var(--w) * .02) calc(var(--w) * .02) calc(var(--w) * .012);
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 1px 1px rgb(0 0 0 / .22),          /* contact */
    0 4px 8px rgb(0 0 0 / .12),           /* key */
    0 16px 26px -6px rgb(0 0 0 / .26);    /* ambient, falls downward */
}
.cover::before {                           /* spine fold + edge light, measured */
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  border-radius: inherit;
  background: linear-gradient(90deg,
    rgb(0 0 0 / .20) 0%, rgb(0 0 0 / .18) 1%,
    rgb(255 255 255 / .35) 1.4%, rgb(255 255 255 / .08) 2.2%, transparent 2.8%,
    rgb(0 0 0 / .12) 3.4%, rgb(0 0 0 / .12) 4.4%,
    rgb(255 255 255 / .20) 5.3%, transparent 6.6%,
    transparent 98.2%, rgb(255 255 255 / .10) 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .28), inset 0 -1px 0 rgb(0 0 0 / .16);
}
```

This replaces the cloth/foil look. The `::before` layer works over **any** cover art: future illustrated covers, or the current SVG covers if they stay.

### 3.3 2.5D book with a page block, the default for lists and the hero (✅ identical in Chromium 153 and WebKit 26.6)

```css
.book {                                   /* wrapper around .cover */
  --d: calc(var(--w, 150px) * .06);       /* a short story is a thin book */
  position: relative;
  inline-size: fit-content;
  margin-inline-end: var(--d);
}
.book::after {                            /* page block seen past the fore-edge */
  content: "";
  position: absolute;
  inset-block: 1.2% .6%;
  inset-inline-start: 100%;
  inline-size: var(--d);
  translate: -1px 0;
  clip-path: polygon(0 0, 100% 2.5%, 100% 98.5%, 0 100%);
  background:
    linear-gradient(90deg, rgb(0 0 0 / .22), rgb(0 0 0 / .04) 45%, rgb(0 0 0 / .12)),
    repeating-linear-gradient(90deg, #fbf8f1 0 .75px, #ddd5c4 .75px 1.5px);   /* sheets are vertical: 90deg */
}
```

No `preserve-3d`, no sorting, no raster risk, and the cost is a few paints. Screenshot: `04_glass_proto/shot_books_2_5d_chromium.png`.

### 3.4 Full CSS-3D book: only for the opening ritual

The existing `Book3D.tsx` approach (faces in `preserve-3d`) is right for **one centred, non-scrolling** moment. Rules learned while prototyping:
- Put `backface-visibility: hidden` on **every** face. Without it, the back board showed through the front in Chromium.
- **Keep filters and shadows out of the 3D tree.** A `filter: blur()` child inside `preserve-3d` forces flattening in WebKit. Render the contact shadow as a 2D sibling of the 3D element (the current `.floor` already does this).
- Under Chromium 153 **mobile emulation**, a 3D book scrolled partly above the viewport **lost the lower part of its front face**: the back board showed through, or nothing did. Desktop emulation was fine, and the cause wasn't found by bisecting `overflow`, `mix-blend-mode`, `transition` or `will-change`. Treat it as a real risk until it's checked on an Android phone. This is the main reason the scrolling hero should be 2.5D, with the 3D book shown in a fixed overlay at tap time.
- Text on rotated faces rasterises soft in Chromium (visible in the render). Keep titles on the flat 2.5D/cover layer, or accept the softness during motion only.
- Thickness: 6–8% of width for a short story. The current 15% reads as a novel.
- **Testing caveat**: Playwright's headless WebKit renders neither 3D perspective nor backdrop blur (no accelerated compositing), so WebKit screenshots of these two features are not evidence. Verify on a real iPhone.

### 3.5 Specular sheen driven by scroll: no permission, compositor-only (✅ both engines)

```css
.cover { view-timeline: --cover; }              /* name the timeline on the element… */
.cover::after {
  content: "";
  position: absolute;
  inset: 0 -100%;
  z-index: 3;
  pointer-events: none;
  background: linear-gradient(105deg, transparent 42%, rgb(255 255 255 / .35) 50%, transparent 58%);
  mix-blend-mode: soft-light;
}
@supports (animation-timeline: view()) {
  .cover::after {
    animation: sheen linear both;
    animation-timeline: --cover;                /* …and reference it from the pseudo. AFTER the shorthand. */
  }
}
@keyframes sheen { from { translate: -25% 0; } to { translate: 25% 0; } }
@media (prefers-reduced-motion: reduce) { .cover::after { animation: none; } }
```

Gotcha (verified): `animation-timeline: view()` set directly on `::after` **did not animate** in either engine (translate stayed 0%). A named `view-timeline` on the element did: −13.6% → 0.4% → 14.5% across three scroll positions in both Chromium 153 and WebKit 26.6. Firefox has no scroll-driven animations, so the sheen just sits static.

### 3.6 Tilt (pointer + optional gyro)

```tsx
"use client";
import { useEffect, type RefObject } from "react";

type DOE = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

/** Call ONLY from a click/tap handler (iOS needs user activation; shows a system prompt). */
export async function enableMotion(): Promise<boolean> {
  const D = (globalThis as any).DeviceOrientationEvent as DOE | undefined;
  if (!D) return false;
  if (typeof D.requestPermission === "function") {
    try { return (await D.requestPermission()) === "granted"; } catch { return false; } // iOS 14.5+, Chrome 152+
  }
  return true;
}

export function useTilt(el: RefObject<HTMLElement | null>, motion: boolean, range = 20) {
  useEffect(() => {
    const node = el.current;
    if (!node || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0, y = 0, raf = 0, base: number | null = null;
    const write = () => {
      raf = 0;
      node.style.setProperty("--tilt-x", x.toFixed(3));
      node.style.setProperty("--tilt-y", y.toFixed(3));
      node.style.setProperty("--tilt-mag", Math.min(1, Math.hypot(x, y)).toFixed(3));
    };
    const queue = () => { raf ||= requestAnimationFrame(write); };
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = node.getBoundingClientRect();
      x = clamp(((e.clientX - r.left) / r.width) * 2 - 1);
      y = clamp(((e.clientY - r.top) / r.height) * 2 - 1);
      queue();
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      base ??= e.beta;                                     // calibrate to how this person holds the phone
      x += (clamp(e.gamma / range) - x) * 0.15;            // low-pass: sensors jitter
      y += (clamp((e.beta - base) / range) - y) * 0.15;
      queue();
    };
    addEventListener("pointermove", onPointer, { passive: true });
    if (motion) addEventListener("deviceorientation", onOrient);
    return () => {
      removeEventListener("pointermove", onPointer);
      removeEventListener("deviceorientation", onOrient);
      cancelAnimationFrame(raf);
    };
  }, [el, motion, range]);
}
```

CSS consumes `--tilt-x/-y/-mag`. Book: `rotateY(calc(-28deg + var(--tilt-x,0) * 14deg))`. Sheen: `background-position: calc(50% + var(--tilt-x,0) * 60%) 0`. Glass rim: `--light-angle: calc(135deg + var(--tilt-x,0) * 40deg)`. Product rule: **don't** prompt on first open. On iOS, put "Живая обложка" behind an explicit toggle in Settings and store the opt-in in `localStorage`. On Chrome 152+ `enableMotion()` currently resolves without a prompt.

### 3.7 Cover-coloured surfaces

Apple's detail page = cover on its dominant colour + glass tinted from it. Compute the dominant/darker colour **at build time** from the cover art (or reuse the existing per-cloth palette in `lib/cloth.ts`) and emit `--cover-dominant` with the story. No runtime colour extraction.

---

## 4. Page turn / page curl

| Option | Cost | Accessibility / fit | Verdict |
|---|---|---|---|
| CSS 3D `rotateY` page flip | Low | Requires **paginating** the story (CSS columns + fixed page boxes), so it fights the vertical scroll, font-size setting and text reflow | No |
| StPageFlip / `page-flip` 2.0.7 (+ `react-pageflip`) | ~50 kB, canvas or HTML mode | Last published **2021-04-18**, unmaintained; fixed page sizes; duplicated/absolute-positioned content; poor screen-reader/selection/find-in-page | No |
| WebGL curl shader (two textures + cylinder fragment shader) | GPU; needs the page as a texture | Live text → texture needs html2canvas (slow, wrong fonts) or HTML-in-Canvas (Chrome origin trial only, ends 2026-10-20) | No |
| Apple Books itself | — | Offers Curl, Slide, Fast Fade and Scroll; curl is a legacy option ([Apple support](https://support.apple.com/guide/iphone/read-books-iphc1af7c57/ios)) | Scroll is a legit "Apple Books" mode |

**Recommendation: no page turning in the reader.** Spend the skeuomorphism on the object (book, opening, paper) rather than on navigation. Use the curl motif once, as a corner peel on today's cover that hints "open me" (✅ Chromium, `04_glass_proto/corner_peel.html`):

```css
@property --peel { syntax: "<length>"; inherits: true; initial-value: 0px; }
.peel {
  position: relative;
  filter: drop-shadow(0 10px 14px rgb(0 0 0 / .22));        /* shadow follows the clipped shape */
  transition: --peel 420ms cubic-bezier(.3, 1.4, .5, 1);
}
.peel:is(:hover, :focus-visible, [data-hint]) { --peel: 34px; }
.peel > .face {                                              /* the cover */
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--peel)), calc(100% - var(--peel)) 100%, 0 100%);
}
.peel::after {                                               /* folded-over corner = paper back of the cover */
  content: "";
  position: absolute;
  right: 0;
  bottom: 0;
  inline-size: var(--peel);
  block-size: var(--peel);
  clip-path: polygon(0 0, 100% 0, 0 100%);
  background: linear-gradient(315deg, transparent 50%, #fffaf0 50%, #ece3cf 78%, #d6cab0);
  box-shadow: inset 2px 2px 4px rgb(0 0 0 / .12);
}
@media (prefers-reduced-motion: reduce) { .peel { transition: none; } }
```

Set `data-hint` for about 1.2 s after first paint once per day, then remove it. The spring overshoot comes from the `cubic-bezier(.3,1.4,.5,1)` transition on the registered `--peel`.

---

## 5. Next.js 16 / React 19.3: book → reader "opening" transition

### 5.1 How it works

- Next App Router navigations already run inside `startTransition`, so every `<ViewTransition>` reacts. `<Link transitionTypes={['open-book']}>` adds a type ([Next view-transitions guide](https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/view-transitions.mdx)).
- When a named `<ViewTransition name="book-x">` unmounts on page A and one with the same name mounts on page B **in the same commit**, React runs a **share** animation. The group morphs position and size and cross-fades the old and new snapshots.
- Caveats ([react.dev](https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/ViewTransition.md)):
  - A name must be unique among mounted boundaries.
  - `<ViewTransition>` must wrap the DOM node directly, with no `<div>` above it, for enter/exit.
  - If the destination suspends to a fallback first, the share is skipped. So **no `loading.tsx` under `/rasskaz`**: the route is SSG, keep it that way, and keep `<Link>` prefetch on.
  - React does not handle reduced motion for you.
- Snapshots are flat images, so 3D is fine: **name the non-transformed wrapper** of the book (`.stage`), not a 3D face. The snapshot is the composited 3D scene as painted.

### 5.2 Code

Home (today's book):

```tsx
import Link from "next/link";
import type { Route } from "next";
import { ViewTransition } from "react";

<Link href={`/rasskaz/${slug}` as Route} transitionTypes={["open-book"]} aria-label={`Читать «${title}»`}>
  <ViewTransition name={`book-${slug}`} share="close-book">
    <div className={styles.stage}>{/* 2.5D book or Book3D */}</div>
  </ViewTransition>
</Link>
```

Reader (`app/rasskaz/[slug]/page.tsx`), destination = a fixed full-screen sheet of paper:

```tsx
<ViewTransition name={`book-${slug}`} share="open-book">
  <div className={styles.paper} aria-hidden="true" />
</ViewTransition>
```

```css
/* page.module.css */
.paper { position: fixed; inset: 0; z-index: -1; background: var(--fp-paper); }
```

Global CSS (must live in `globals.css`: CSS Modules would hash `.open-book` inside the pseudo-element argument):

```css
::view-transition-group(.open-book),
::view-transition-group(.close-book) {
  animation-duration: 520ms;
  animation-timing-function: cubic-bezier(.32, .72, 0, 1);   /* iOS sheet-like */
}
::view-transition-old(.open-book),
::view-transition-new(.open-book),
::view-transition-old(.close-book),
::view-transition-new(.close-book) {
  height: 100%;
  object-fit: cover;                       /* cover 2:3 ↔ viewport ~9:19.5 without stretching */
}
::view-transition-old(.open-book) { animation: 240ms ease-in 140ms both vt-fade-out; }
::view-transition-new(.open-book) { animation: 300ms ease-out 200ms both vt-fade-in; }
@keyframes vt-fade-out { to { opacity: 0; } }
@keyframes vt-fade-in { from { opacity: 0; } }

/* the rest of the reader rises in after the paper has landed */
:root:active-view-transition-type(open-book)::view-transition-new(.page-in) {
  animation-delay: 260ms;
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) { animation-duration: 0s !important; animation-delay: 0s !important; }
}
```

The visual sequence: the cover lifts from the shelf, grows to fill the screen while its colour cross-fades into paper, and then the title and text rise. This is Apple Books' open zoom with no WebGL.

iOS edge-swipe back: Safari plays its own snapshot slide, and a second author transition would double it. Skip ours when the UA already animated ([MDN](https://developer.mozilla.org/docs/Web/API/PopStateEvent/hasUAVisualTransition)). Untested on device:

```tsx
// in a client component in the root layout
useEffect(() => {
  const onPop = (e: PopStateEvent) => {
    if (!(e as any).hasUAVisualTransition) return;
    document.documentElement.dataset.uaNav = "";
    setTimeout(() => delete document.documentElement.dataset.uaNav, 700);
  };
  addEventListener("popstate", onPop, { capture: true });
  return () => removeEventListener("popstate", onPop, { capture: true });
}, []);
```

```css
:root[data-ua-nav]::view-transition-group(*),
:root[data-ua-nav]::view-transition-old(*),
:root[data-ua-nav]::view-transition-new(*) { animation: none !important; }
```

Support: the morph runs in Chrome 111+, Safari 18.2+ and Firefox 147+, so practically all of FantPub's audience. Elsewhere navigation is instant, with no errors.

### 5.3 Fixes needed in the current code for this to work

- `app/rasskaz/[slug]/page.module.css` `.thumb` has a raw `view-transition-name: story-cover`, but no element on the home page carries that name, so there is **no morph today**. Raw names can also collide with React-managed ones. Remove it and use the React `name` prop.
- `globals.css` reduced-motion block sets `animation-duration: 1ms !important` on `*`. modern-web-guidance (`css` guide §9) advises against this global hack. Use per-component reduced variants, or the `--animation-reduced` pattern from that guide.

---

## 6. Quick audit of today's glass-related code vs these findings

| File | Now | Change |
|---|---|---|
| `BottomNav.module.css`, `reader/ReaderBar.module.css` | `blur(18px) saturate(1.3)` + `--fp-vellum` + feTurbulence grain at `soft-light` | Rungs 0–2 recipe (§2.3), blur 14 px, saturate 1.8, brightness 1.15. Drop the paper grain: the glass is the texture now. Refraction only on BottomNav. |
| `reader/SettingsSheet.module.css` | `::backdrop` transitions `backdrop-filter` 0→3 px | Constant (or no) blur; animate `background` alpha only. |
| `Book3D.module.css` | depth 15% of width, faces partly without `backface-visibility`, 3D used in the scrolling hero | 6–8% depth; `backface-visibility: hidden` on all faces; 2.5D in the scrolling hero; 3D only in a fixed opening overlay. |
| `app/rasskaz/[slug]/page.module.css` | raw `view-transition-name: story-cover` | React `<ViewTransition name share>` per §5. |
| `layout.tsx` | `themeColor` | Keep for Android; add an explicit `html, body { background-color }` per theme for Safari 26+ tinting. |

---

## 7. Prototype files (open locally in Chrome)

- `research/redesign/04_glass_proto/glass_books.html`: tinted glass buttons, glass tab pill with Blink refraction, scroll-edge layer, flat cover, 2.5D books, CSS-3D book. `?tx=0.6&ty=-0.2` fakes a tilt.
- `research/redesign/04_glass_proto/sheen_scroll.html`: scroll-driven sheen (named view-timeline).
- `research/redesign/04_glass_proto/corner_peel.html`: CSS corner peel.
- Screenshots: `shot_tabbar_chromium153_refraction.png` (edge lensing visible: colour blocks bend into the rim), `shot_tabbar_webkit26_headless.png` (rung 1–2 only; the headless blur is missing, which is a test artifact), `shot_books_2_5d_chromium.png`, `shot_cover_glassbuttons_chromium_vs_webkit.png`, `shot_corner_peel.png`.

---

## Sources

- modern-web-guidance guides (skill 2026_09_04): `same-document-transitions`, `cross-document-transitions`, `directional-navigation-transitions`, `css`, `scrollytelling`, `parallax-scroll-effects`, `interactive-content-reveal`, `physics-based-easing`, `interactive-content-in-3d-scenes`.
- MDN browser-compat-data (main): https://github.com/mdn/browser-compat-data
- Apple HIG Materials (JSON): https://developer.apple.com/design/human-interface-guidelines/materials
- iOS 27 release: https://www.macrumors.com/2026/09/14/apple-releases-ios-27/ · https://9to5mac.com/2026/09/14/ios-27-now-available-features-compatible-iphones/
- Safari 27 features: https://webkit.org/blog/18325/webkit-features-for-safari-27-0/
- WebKit 245510 (SVG filter in backdrop-filter): https://bugs.webkit.org/show_bug.cgi?id=245510 · WebKit 302256 (blur lost in view transitions): https://bugs.webkit.org/show_bug.cgi?id=302256 · Mozilla 1961378: https://bugzilla.mozilla.org/show_bug.cgi?id=1961378 · W3C svgwg #1142 (backdrop refraction proposal, 2026-06-25, no vendor response): https://github.com/w3c/svgwg/issues/1142
- Private `-apple-visual-effect`: https://alastair.is/apple-has-a-private-css-property-to-add-liquid-glass-effects-to-web-content/
- Liquid glass techniques: https://kube.io/blog/liquid-glass-css-svg/ · https://webtricks.dev/blog/liquid-glass-css · https://dev.to/devyatov/liquid-glass-on-the-web-6-ways-to-build-it-with-css-and-svg-3m07 · https://www.buildmvpfast.com/blog/liquid-glass-css-backdrop-filter-recipes-2026 · https://html-in-canvas.dev/liquid-glass-effect/
- Libraries: https://github.com/rdev/liquid-glass-react · https://classic.yarnpkg.com/en/package/@specy/liquid-glass · https://github.com/naughtyduk/liquidGL · https://github.com/PallavAg/liquid-glass-web-react
- Mobile blur cost: https://github.com/Station-Sciences/bot-crossing/issues/74
- Safari 26 toolbar tinting: https://1ar.io/updates/safari-26-liquid-glass-web/ · https://jahir.dev/blog/safari-toolbar · https://benfrain.com/ios26-safari-theme-color-tab-tinting-with-fixed-position-elements/
- React ViewTransition: https://react.dev/reference/react/ViewTransition · React 19.3 post (react.dev repo, 2026-09-09) · Next.js view transitions guide: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/view-transitions.mdx
- hasUAVisualTransition: https://developer.mozilla.org/docs/Web/API/PopStateEvent/hasUAVisualTransition
- Device orientation permission: https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static · Chrome intent to ship: https://groups.google.com/a/chromium.org/g/blink-dev/c/ckd2rFmT3PA
- HTML-in-Canvas origin trial: https://developer.chrome.com/blog/html-in-canvas-origin-trial
- Page flip libs: https://cdn.jsdelivr.net/npm/page-flip@2.0.7/README.md · https://depscope.dev/pkg/npm/page-flip
- Book CSS refs: https://gist.github.com/jshmllr/dce62a4c67bb10592c82370a985dd3e4 · https://dev.to/scastiel/create-an-animated-3d-book-in-css-step-by-step-26ic
- Apple Books screenshots: `research/mobbin/01-home_ab_book_detail_color_bg.jpg`, `02-…fanned_covers.jpg`, `06-…continue_shelf.jpg`, `11-reader_ab_reader_glass_menu.jpg` (Mobbin, iOS 26).
