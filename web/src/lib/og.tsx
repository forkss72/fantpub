import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { CSSProperties } from "react";
import { humanDate, plural } from "./date";
import { SITE_URL } from "./site";
import type { CoverColors, StoryMeta } from "./types";

/*
 * Link previews and quote cards, drawn by next/og (satori). Same language as the app:
 * the real cover as a book object on a field painted with its own colours, Literata for titles.
 * Never the author's name: every shared link is a riddle.
 */

const ASSETS = path.join(process.cwd(), "assets");
const read = (f: string) => fs.readFileSync(path.join(ASSETS, "og-fonts", f));

type OgFont = { name: string; data: Buffer; weight: 400 | 500 | 600; style: "normal" | "italic" };
let fontsCache: OgFont[] | null = null;
export function ogFonts(): OgFont[] {
  fontsCache ??= [
    { name: "Literata", data: read("literata-600.sub.ttf"), weight: 600, style: "normal" },
    { name: "Literata", data: read("literata-italic.sub.ttf"), weight: 400, style: "italic" },
    { name: "Onest", data: read("onest-500.sub.ttf"), weight: 500, style: "normal" },
  ];
  return fontsCache;
}

/** satori can't decode WebP: scripts/og-covers.mjs writes JPEG copies to assets/og-covers. */
const artCache = new Map<string, string>();
function coverArt(slug: string): string | null {
  const hit = artCache.get(slug);
  if (hit) return hit;
  try {
    const uri = `data:image/jpeg;base64,${fs.readFileSync(path.join(ASSETS, "og-covers", `${slug}.jpg`)).toString("base64")}`;
    artCache.set(slug, uri);
    return uri;
  } catch {
    return null; // a cover nobody converted yet: the book is drawn in its own colour, still readable
  }
}

const HOST = new URL(SITE_URL).host;
const SERIF: CSSProperties = { fontFamily: "Literata", fontWeight: 600 };
const ITALIC: CSSProperties = { fontFamily: "Literata", fontStyle: "italic", fontWeight: 400 };
const SANS: CSSProperties = { fontFamily: "Onest", fontWeight: 500 };

function rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** Apple's product-page field: the cover's own colour, a little darker towards the bottom, light behind the book. */
function field(c: CoverColors, lightAt: string): CSSProperties {
  return {
    backgroundColor: c.bg,
    backgroundImage: `radial-gradient(circle at ${lightAt}, ${rgba(c.light, 0.2)}, ${rgba(c.light, 0)} 46%), linear-gradient(180deg, ${c.bg}, ${c.dark})`,
  };
}

const minutes = (m: number) => `${m} ${plural(m, ["минута", "минуты", "минут"])}`;
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The book object from components/ui/Book: art, hinge crease, bevel, frosted band with live type, page block, contact shadow. */
function OgBook({ story, width, depth = true }: { story: Pick<StoryMeta, "slug" | "title" | "issue" | "cover">; width: number; depth?: boolean }) {
  const w = width;
  const h = Math.round(w * 1.5);
  const d = depth ? Math.round(w * 0.055) : 0;
  const c = story.cover.colors;
  const art = coverArt(story.slug);
  const r1 = Math.max(2, Math.round(w * 0.012));
  const r2 = Math.max(3, Math.round(w * 0.022));
  const ts = story.title.length > 16 ? 0.092 : 0.106; // the app clamps long titles; a static card can afford to fit them
  return (
    <div style={{ display: "flex", position: "relative", width: w + d, height: h, flex: "none" }}>
      {/* pages seen past the fore-edge */}
      {depth && (
        <div
          style={{
            position: "absolute",
            left: w - 2,
            top: Math.round(h * 0.014),
            width: d,
            height: Math.round(h * 0.978),
            borderRadius: `0 ${r1}px ${r1}px 0`,
            backgroundImage: "linear-gradient(90deg, rgba(0,0,0,.28), rgba(0,0,0,.04) 45%, rgba(0,0,0,.16)), repeating-linear-gradient(90deg, #fbf9f4 0px, #fbf9f4 1px, #d9d3c6 1px, #d9d3c6 2px)",
            boxShadow: `0 ${Math.round(w * 0.07)}px ${Math.round(w * 0.12)}px ${rgba("#000000", 0.3)}`,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: w,
          height: h,
          display: "flex",
          borderRadius: `${r1}px ${r2}px ${r2}px ${r1}px`,
          backgroundColor: c.dark,
          overflow: "hidden",
          boxShadow: `0 1px 2px rgba(0,0,0,.25), 0 ${Math.round(w * 0.03)}px ${Math.round(w * 0.05)}px rgba(0,0,0,.14), 0 ${Math.round(w * 0.1)}px ${Math.round(w * 0.18)}px ${rgba("#000000", 0.38)}`,
        }}
      >
        {art ? (
          // eslint-disable-next-line @next/next/no-img-element -- satori draws <img>, there is no optimizer here
          <img src={art} width={w} height={h} alt="" style={{ position: "absolute", left: 0, top: 0, width: w, height: h }} />
        ) : (
          <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, display: "flex", backgroundImage: `linear-gradient(180deg, ${c.base}, ${c.dark})` }} />
        )}
        {/* hinge crease + edge light, as in Book.module.css */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: w,
            height: h,
            display: "flex",
            backgroundImage:
              "linear-gradient(90deg, rgba(0,0,0,.26) 0%, rgba(0,0,0,.16) 1%, rgba(255,255,255,.32) 1.5%, rgba(255,255,255,.06) 2.3%, rgba(0,0,0,0) 2.9%, rgba(0,0,0,.14) 3.5%, rgba(0,0,0,.12) 4.5%, rgba(255,255,255,.18) 5.4%, rgba(0,0,0,0) 6.8%, rgba(0,0,0,0) 98.2%, rgba(255,255,255,.1) 100%), linear-gradient(180deg, rgba(255,255,255,.1), rgba(255,255,255,0) 14%, rgba(0,0,0,0) 60%, rgba(0,0,0,.1))",
          }}
        />
        {/* title printed on the frosted band baked into the art (bottom 26%) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: Math.round(h * 0.74),
            width: w,
            height: h - Math.round(h * 0.74),
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: `0 ${Math.round(w * 0.09)}px 0 ${Math.round(w * 0.11)}px`,
            color: "#fff",
            textShadow: "0 1px 2px rgba(0,0,0,.25)",
          }}
        >
          <div style={{ ...SERIF, fontSize: Math.round(w * ts), lineHeight: 1.04, letterSpacing: -0.015 * w * ts, lineClamp: 2, display: "block" }}>{story.title}</div>
          <div style={{ ...SANS, fontSize: Math.round(w * 0.046), marginTop: Math.round(w * 0.036), opacity: 0.82, letterSpacing: 0.02 * w * 0.046 }}>{`FantPub · № ${story.issue}`}</div>
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, display: "flex", borderRadius: `${r1}px ${r2}px ${r2}px ${r1}px`, boxShadow: "inset 0 1px 0 rgba(255,255,255,.3), inset 0 -1px 0 rgba(0,0,0,.18), inset 0 0 0 1px rgba(0,0,0,.18)" }} />
      </div>
    </div>
  );
}

/** The sealed-author chip from the app, asking instead of hiding. */
function Riddle({ size }: { size: number }) {
  return (
    <div
      style={{
        ...SANS,
        display: "flex",
        alignItems: "center",
        alignSelf: "flex-start",
        height: Math.round(size * 2.1),
        padding: `0 ${Math.round(size * 0.85)}px`,
        borderRadius: 999,
        fontSize: size,
        color: "#fff",
        backgroundColor: "rgba(255,255,255,.16)",
        border: "1.5px solid rgba(255,255,255,.3)",
      }}
    >
      Угадаете автора?
    </div>
  );
}

function titleSize(title: string, sizes: [number, number, number, number]) {
  const n = title.length;
  return n <= 12 ? sizes[0] : n <= 20 ? sizes[1] : n <= 30 ? sizes[2] : sizes[3];
}

/** 1200×630 link preview. */
export function OgStory({ story }: { story: StoryMeta }) {
  const c = story.cover.colors;
  const ts = titleSize(story.title, [84, 72, 60, 50]);
  return (
    <div style={{ width: 1200, height: 630, display: "flex", alignItems: "center", padding: "0 80px 0 104px", color: "#fff", ...field(c, "24% 46%") }}>
      <OgBook story={story} width={304} />
      <div style={{ flex: 1, height: 456, display: "flex", flexDirection: "column", justifyContent: "center", marginLeft: 72, position: "relative" }}>
        <div style={{ ...SANS, fontSize: 24, color: "rgba(255,255,255,.78)" }}>{`Выпуск № ${story.issue} · ${humanDate(story.date)}`}</div>
        <div style={{ ...SERIF, fontSize: ts, lineHeight: 1.04, letterSpacing: -0.012 * ts, marginTop: 16, textWrap: "balance" }}>{story.title}</div>
        <div style={{ display: "flex", marginTop: 28 }}>
          <Riddle size={26} />
        </div>
        <div style={{ ...SANS, fontSize: 24, color: "rgba(255,255,255,.78)", marginTop: 24 }}>{`${capital(story.mood)} · ${minutes(story.minutes)}`}</div>
        <div style={{ ...SERIF, position: "absolute", right: 0, bottom: -4, fontSize: 30, letterSpacing: -0.3 }}>FantPub</div>
      </div>
    </div>
  );
}

/** 1080×1350 quote card for VK posts / stories: the line in serif on the cover's colour, the book below it. */
export function ShareCard({ story }: { story: StoryMeta }) {
  const c = story.cover.colors;
  const quote = story.quote && story.quote.length <= 280 ? story.quote.replace(/\.$/, "") : "";
  const qs = quote.length <= 90 ? 64 : quote.length <= 150 ? 54 : quote.length <= 200 ? 47 : 42;
  const ts = titleSize(story.title, [48, 44, 38, 34]);
  return (
    <div style={{ width: 1080, height: 1350, display: "flex", flexDirection: "column", padding: "96px 92px 88px", color: "#fff", ...field(c, "26% 78%") }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {quote ? (
          <div style={{ ...ITALIC, fontSize: qs, lineHeight: 1.3, letterSpacing: -0.005 * qs, textWrap: "pretty" }}>{`«${quote}»`}</div>
        ) : (
          <div style={{ ...ITALIC, fontSize: 52, lineHeight: 1.3, textWrap: "pretty" }}>{story.hook || story.teaser}</div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", marginTop: 64 }}>
        <OgBook story={story} width={232} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: 48, paddingBottom: 4 }}>
          <div style={{ ...SERIF, fontSize: ts, lineHeight: 1.08, letterSpacing: -0.01 * ts, textWrap: "balance" }}>{story.title}</div>
          <div style={{ ...SANS, fontSize: 26, color: "rgba(255,255,255,.78)", marginTop: 12 }}>
            {`Выпуск № ${story.issue} · ${minutes(story.minutes)}`}
          </div>
          <div style={{ display: "flex", marginTop: 28 }}>
            <Riddle size={26} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", marginTop: 56 }}>
            <div style={{ ...SERIF, fontSize: 32, letterSpacing: -0.3 }}>FantPub</div>
            <div style={{ ...SANS, fontSize: 24, color: "rgba(255,255,255,.7)", marginLeft: 14 }}>{HOST}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

type Shelved = Pick<StoryMeta, "slug" | "title" | "issue" | "cover">;

/** 1200×630 default preview: the first five issues fanned like an Apple Books series, on the middle cover's colour. */
export function OgSite({ books }: { books: Shelved[] }) {
  const five = books.slice(0, 5);
  const mid = five[Math.floor(five.length / 2)];
  // back to front: outer pair, inner pair, the middle book
  const slots = [
    { i: 0, w: 156, dx: -214 },
    { i: 4, w: 156, dx: 214 },
    { i: 1, w: 192, dx: -122 },
    { i: 3, w: 192, dx: 122 },
    { i: 2, w: 236, dx: 0 },
  ].filter((x) => five[x.i]);
  const cx = 348;
  return (
    <div style={{ width: 1200, height: 630, display: "flex", color: "#fff", position: "relative", ...field(mid.cover.colors, "28% 50%") }}>
      {slots.map(({ i, w, dx }) => (
        <div key={five[i].slug} style={{ position: "absolute", display: "flex", left: cx + dx - w / 2, top: 315 - (w * 1.5) / 2 }}>
          <OgBook story={five[i]} width={w} depth={false} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 684, top: 0, bottom: 0, right: 64, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ ...SERIF, fontSize: 92, lineHeight: 1, letterSpacing: -1.5 }}>FantPub</div>
        <div style={{ ...SERIF, fontSize: 36, lineHeight: 1.15, color: "rgba(255,255,255,.62)", marginTop: 14, letterSpacing: -0.4 }}>Рассказ на каждый день</div>
        <div style={{ ...SANS, fontSize: 24, lineHeight: 1.4, color: "rgba(255,255,255,.82)", marginTop: 34 }}>Классика на 5–10 минут.</div>
        <div style={{ ...SANS, fontSize: 24, lineHeight: 1.4, color: "rgba(255,255,255,.82)" }}>Автора узнаете в конце.</div>
      </div>
    </div>
  );
}
