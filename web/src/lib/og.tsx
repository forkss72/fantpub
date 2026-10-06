import "server-only";
import fs from "node:fs";
import path from "node:path";
import { CLOTHS } from "./cloth";
import { coverSvg, svgDataUri } from "./cover-svg";
import type { StoryMeta } from "./types";

const dir = path.join(process.cwd(), "assets", "og-fonts");
const read = (f: string) => fs.readFileSync(path.join(dir, f));

let fontsCache: { name: string; data: Buffer; weight: 400 | 500 | 600; style: "normal" | "italic" }[] | null = null;
export function ogFonts() {
  if (!fontsCache) {
    fontsCache = [
      { name: "Lora", data: read("lora-600.sub.ttf"), weight: 600, style: "normal" },
      { name: "Lora", data: read("lora-italic.sub.ttf"), weight: 400, style: "italic" },
      { name: "Onest", data: read("onest-500.sub.ttf"), weight: 500, style: "normal" },
      { name: "Plex", data: read("plexmono-500.sub.ttf"), weight: 500, style: "normal" },
    ];
  }
  return fontsCache;
}

const PAPER = "#f6f2e7";
const INK = "#1d1c17";

function SealMark({ size, issue }: { size: number; issue: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: "radial-gradient(circle at 36% 30%, #e6f0c6, #b9cf84 48%, #7f9450)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 14px rgba(40,34,14,.35)",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", gap: size * 0.04 }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ width: size * 0.26, height: size * 0.26, borderRadius: size, border: `${Math.max(3, size * 0.045)}px solid #3f4c1f`, display: "flex" }} />
        ))}
      </div>
      <div style={{ position: "absolute", bottom: size * 0.16, fontFamily: "Plex", fontSize: size * 0.11, color: "#3f4c1f", display: "flex" }}>№ {issue}</div>
    </div>
  );
}

/** 1200×630 link preview. No author: every shared link is a riddle. */
export function OgStory({ story }: { story: StoryMeta }) {
  const cloth = CLOTHS[story.cloth] ?? CLOTHS.forest;
  return (
    <div style={{ width: 1200, height: 630, display: "flex", background: PAPER, color: INK, position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 520, height: 630, background: `radial-gradient(circle at 50% 46%, rgba(203,221,155,.55), rgba(246,242,231,0) 64%)`, display: "flex" }} />
      <div style={{ width: 520, height: 630, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{ display: "flex", position: "relative", transform: "rotate(-4deg)", boxShadow: "0 30px 40px -18px rgba(52,42,18,.55)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={svgDataUri(coverSvg({ motif: story.motif, cloth: story.cloth, width: 300, height: 450 }))} width={300} height={450} alt="" />
          <div
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              top: 120,
              padding: "22px 16px",
              background: cloth.label,
              color: cloth.labelInk,
              borderRadius: 6,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              border: `2px solid ${cloth.labelInk}55`,
            }}
          >
            <div style={{ fontFamily: "Plex", fontSize: 15, letterSpacing: 2, opacity: 0.7, display: "flex" }}>№ {story.issue}</div>
            <div style={{ fontFamily: "Lora", fontWeight: 600, fontSize: story.title.length > 18 ? 26 : 32, lineHeight: 1.05, textAlign: "center", marginTop: 8, display: "flex" }}>
              {story.title}
            </div>
          </div>
          <div style={{ position: "absolute", right: -40, top: 300, display: "flex" }}>
            <SealMark size={96} issue={story.issue} />
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 70px 0 30px" }}>
        <div style={{ fontFamily: "Plex", fontSize: 20, letterSpacing: 3, color: "#6b6658", display: "flex" }}>FANTPUB · ВЫПУСК № {story.issue}</div>
        <div style={{ fontFamily: "Lora", fontWeight: 600, fontSize: story.title.length > 22 ? 62 : 76, lineHeight: 1.02, marginTop: 18, display: "flex" }}>{story.title}</div>
        <div style={{ fontFamily: "Lora", fontStyle: "italic", fontSize: 32, color: "#4a473d", marginTop: 22, display: "flex" }}>
          Рассказ на {story.minutes} мин. Угадаете автора?
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 44 }}>
          <div style={{ width: 46, height: 46, borderRadius: 46, background: "#cbdd9b", border: `2px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
            <div style={{ width: 14, height: 14, borderRadius: 14, border: `3px solid ${INK}`, background: "#fcfaf4", display: "flex" }} />
            <div style={{ width: 14, height: 14, borderRadius: 14, border: `3px solid ${INK}`, background: "#fcfaf4", display: "flex" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Lora", fontWeight: 600, fontSize: 28, display: "flex" }}>FantPub</div>
            <div style={{ fontFamily: "Plex", fontSize: 15, letterSpacing: 2, color: "#6b6658", display: "flex" }}>РАССКАЗ НА КАЖДЫЙ ДЕНЬ</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 1080×1350 card for VK posts / stories — the «folded sheet». */
export function ShareCard({ story }: { story: StoryMeta }) {
  const cloth = CLOTHS[story.cloth] ?? CLOTHS.forest;
  const quote = story.quote && story.quote.length <= 260 ? story.quote : "";
  return (
    <div style={{ width: 1080, height: 1350, display: "flex", flexDirection: "column", alignItems: "center", background: PAPER, color: INK, padding: "90px 90px 80px", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 700, background: "radial-gradient(circle at 50% 55%, rgba(203,221,155,.6), rgba(246,242,231,0) 62%)", display: "flex" }} />
      <div style={{ fontFamily: "Plex", fontSize: 26, letterSpacing: 4, color: "#6b6658", display: "flex" }}>FANTPUB · ВЫПУСК № {story.issue}</div>
      <div style={{ display: "flex", position: "relative", marginTop: 56, transform: "rotate(-3deg)", boxShadow: "0 40px 50px -22px rgba(52,42,18,.55)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={svgDataUri(coverSvg({ motif: story.motif, cloth: story.cloth, width: 360, height: 540 }))} width={360} height={540} alt="" />
        <div
          style={{
            position: "absolute",
            left: 46,
            right: 46,
            top: 150,
            padding: "26px 18px",
            background: cloth.label,
            color: cloth.labelInk,
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: `2px solid ${cloth.labelInk}55`,
          }}
        >
          <div style={{ fontFamily: "Plex", fontSize: 18, letterSpacing: 2, opacity: 0.7, display: "flex" }}>№ {story.issue}</div>
          <div style={{ fontFamily: "Lora", fontWeight: 600, fontSize: story.title.length > 18 ? 30 : 38, lineHeight: 1.05, textAlign: "center", marginTop: 10, display: "flex" }}>
            {story.title}
          </div>
        </div>
        <div style={{ position: "absolute", right: -50, top: 350, display: "flex" }}>
          <SealMark size={120} issue={story.issue} />
        </div>
      </div>
      {quote ? (
        <div style={{ fontFamily: "Lora", fontStyle: "italic", fontSize: quote.length > 150 ? 34 : 42, lineHeight: 1.35, textAlign: "center", marginTop: 72, display: "flex" }}>«{quote}»</div>
      ) : (
        <div style={{ fontFamily: "Lora", fontStyle: "italic", fontSize: 44, lineHeight: 1.3, textAlign: "center", marginTop: 80, display: "flex" }}>
          Рассказ на {story.minutes} минут. Угадаете автора?
        </div>
      )}
      <div style={{ fontFamily: "Plex", fontSize: 22, letterSpacing: 3, color: "#6b6658", marginTop: 34, display: "flex" }}>
        РАССКАЗ НА {story.minutes} МИН · УГАДАЕТЕ АВТОРА?
      </div>
      <div style={{ flex: 1, display: "flex" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ fontFamily: "Lora", fontWeight: 600, fontSize: 38, display: "flex" }}>FantPub</div>
        <div style={{ fontFamily: "Plex", fontSize: 20, letterSpacing: 3, color: "#6b6658", display: "flex" }}>РАССКАЗ НА КАЖДЫЙ ДЕНЬ</div>
      </div>
    </div>
  );
}

/** 1200×630 default preview for the site: a fan of three clothbound books and the seal. */
export function OgSite() {
  const books: { motif: string; cloth: "forest" | "oxblood" | "ink"; rot: number; x: number; y: number }[] = [
    { motif: "window", cloth: "forest", rot: -12, x: 60, y: 120 },
    { motif: "star", cloth: "ink", rot: 6, x: 290, y: 70 },
    { motif: "rose", cloth: "oxblood", rot: -3, x: 175, y: 95 },
  ];
  return (
    <div style={{ width: 1200, height: 630, display: "flex", background: PAPER, color: INK, position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 640, height: 630, background: "radial-gradient(circle at 50% 50%, rgba(203,221,155,.6), rgba(246,242,231,0) 62%)", display: "flex" }} />
      <div style={{ width: 600, height: 630, position: "relative", display: "flex" }}>
        {books.map((b) => (
          <div key={b.motif} style={{ position: "absolute", left: b.x, top: b.y, transform: `rotate(${b.rot}deg)`, boxShadow: "0 30px 40px -18px rgba(52,42,18,.55)", display: "flex" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={svgDataUri(coverSvg({ motif: b.motif, cloth: b.cloth, width: 240, height: 360 }))} width={240} height={360} alt="" />
          </div>
        ))}
        <div style={{ position: "absolute", left: 400, top: 380, display: "flex" }}>
          <SealMark size={120} issue={1} />
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 70px 0 10px" }}>
        <div style={{ fontFamily: "Plex", fontSize: 20, letterSpacing: 3, color: "#6b6658", display: "flex" }}>РАССКАЗ НА КАЖДЫЙ ДЕНЬ</div>
        <div style={{ fontFamily: "Lora", fontWeight: 600, fontSize: 96, lineHeight: 1, marginTop: 14, display: "flex" }}>FantPub</div>
        <div style={{ fontFamily: "Lora", fontStyle: "italic", fontSize: 34, lineHeight: 1.3, color: "#4a473d", marginTop: 26, display: "flex" }}>
          Одна книга в день. Сломайте печать, прочитайте за 5–10 минут и угадайте автора.
        </div>
      </div>
    </div>
  );
}
