// Final screenshots of production for the morning report.
// Usage: node final-shots.mjs <outDir> [base=https://fantpub.vercel.app]
import { chromium } from "playwright-core";
import fs from "node:fs";

const [, , out, base = "https://fantpub.vercel.app"] = process.argv;
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });

const seen = (extra = {}) => ({ v: 1, read: {}, opened: {}, progress: {}, reactions: {}, guesses: {}, prefs: { theme: "auto", font: "literata", size: 3, leading: "normal", blind: true }, introSeen: true, ritualDay: null, installHintDismissed: false, ...extra });

async function shot(name, fn, { state, w = 390, h = 844 } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: w < 700, hasTouch: w < 700, locale: "ru-RU" });
  const page = await ctx.newPage();
  if (state) {
    await page.goto(base + "/o-proekte", { waitUntil: "networkidle" });
    await page.evaluate((s) => localStorage.setItem("fantpub:v1", JSON.stringify(s)), state);
  }
  await fn(page);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/${name}.png` });
  await ctx.close();
}

const probe = await browser.newPage();
await probe.goto(base + "/arhiv", { waitUntil: "networkidle" });
const slugs = await probe.$$eval('a[href^="/rasskaz/"]', (as) => [...new Set(as.map((a) => a.getAttribute("href").split("/")[2]))]);
await probe.close();
const today = slugs[0];
const older = slugs.slice(1);
const readMany = Object.fromEntries(older.slice(0, 7).map((s, i) => [s, Date.now() - (i + 1) * 864e5]));

await shot("01-home", async (p) => { await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1600); }, { state: seen() });
// 02-ritual: the animation outruns this helper's settle delay — use ritual-shot.mjs.
await shot("03-reader", async (p) => {
  await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1300);
  await p.click('button[aria-label^="Сломать"]'); await p.waitForURL(/rasskaz/, { timeout: 10000 }); await p.waitForTimeout(1500);
}, { state: seen() });
await shot("04-guess", async (p) => {
  await p.goto(`${base}/rasskaz/${today}?z=1`, { waitUntil: "networkidle" });
  await p.evaluate(() => { const t = document.querySelector("[data-story-text]"); window.scrollTo(0, t.offsetTop + t.offsetHeight - 160); }); await p.waitForTimeout(1200);
}, { state: seen() });
await shot("05-note", async (p) => {
  await p.goto(`${base}/rasskaz/${today}?z=1`, { waitUntil: "networkidle" });
  await p.evaluate(() => { const t = document.querySelector("[data-story-text]"); window.scrollTo(0, t.offsetTop + t.offsetHeight - 160); }); await p.waitForTimeout(800);
  const opts = await p.$$('[class*="option"]'); if (opts[0]) await opts[0].click(); await p.waitForTimeout(1400);
  const r = await p.$('button[data-key="wow"]'); if (r) await r.click(); await p.waitForTimeout(500);
  await p.evaluate(() => { const n = document.querySelector('aside[aria-labelledby^="note-"]'); n && n.scrollIntoView({ block: "center" }); }); await p.waitForTimeout(600);
}, { state: seen() });
await shot("06-calendar", async (p) => {
  await p.goto(base + "/arhiv", { waitUntil: "networkidle" });
  await p.click('button:has-text("Календарь")'); await p.waitForTimeout(500); await p.evaluate(() => window.scrollTo(0, 250)); await p.waitForTimeout(400);
}, { state: seen({ read: readMany }) });
await shot("07-shelf", async (p) => { await p.goto(base + "/polka", { waitUntil: "networkidle" }); await p.waitForTimeout(800); }, { state: seen({ read: readMany, reactions: { [older[0]]: "wow", [older[1]]: "hooked" }, guesses: { [older[0]]: true, [older[2]]: true, [older[1]]: false } }) });
await shot("08-night", async (p) => {
  await p.goto(`${base}/rasskaz/${older[2]}`, { waitUntil: "networkidle" }); await p.evaluate(() => window.scrollTo(0, 560)); await p.waitForTimeout(600);
}, { state: seen({ prefs: { theme: "night", font: "classic", size: 3, leading: "normal", blind: true } }) });
await shot("12-desktop", async (p) => { await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1600); }, { state: seen(), w: 1440, h: 900 });

const og = await (await fetch(`${base}/rasskaz/${today}/opengraph-image`)).arrayBuffer();
fs.writeFileSync(`${out}/09-og.png`, Buffer.from(og));
await browser.close();
console.log(JSON.stringify({ today, n: slugs.length }));
