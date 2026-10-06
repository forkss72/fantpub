// Captures every key screen & state for the review/report.
// Usage: node report-shots.mjs <baseUrl> <outDir>
import { chromium } from "playwright-core";
import fs from "node:fs";

const [, , base = "http://localhost:3100", out = "./out"] = process.argv;
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];

async function phone(name, fn, { scheme = "light", w = 390, h = 844, full = false, state } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: w < 700, hasTouch: w < 700, locale: "ru-RU", colorScheme: scheme });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name}: ${e}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`${name}: ${m.text()}`));
  if (state) {
    await page.goto(base + "/o-proekte", { waitUntil: "networkidle" });
    await page.evaluate((s) => localStorage.setItem("fantpub:v1", JSON.stringify(s)), state);
  }
  await fn(page);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: full });
  await ctx.close();
}

const seen = (extra = {}) => ({ v: 1, read: {}, opened: {}, progress: {}, reactions: {}, guesses: {}, prefs: { theme: "auto", font: "literata", size: 3, leading: "normal", blind: true }, introSeen: true, ritualDay: null, installHintDismissed: false, ...extra });

// pick slugs from the live archive
const probe = await browser.newPage();
await probe.goto(base + "/arhiv", { waitUntil: "networkidle" });
const slugs = await probe.$$eval('a[href^="/rasskaz/"]', (as) => [...new Set(as.map((a) => a.getAttribute("href").split("/")[2]))]);
await probe.close();
const today = slugs[0];
const older = slugs.slice(1, 8);

await phone("01-home-first-visit", async (p) => { await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1200); });
await phone("02-home-sealed", async (p) => { await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1200); }, { state: seen() });
await phone("03-ritual-crack", async (p) => {
  await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1000);
  await p.click('button[aria-label^="Сломать"]'); await p.waitForTimeout(260);
}, { state: seen() });
await phone("04-ritual-open", async (p) => {
  await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1000);
  await p.click('button[aria-label^="Сломать"]'); await p.waitForTimeout(1350);
}, { state: seen() });
await phone("05-reader-blind", async (p) => {
  await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1000);
  await p.click('button[aria-label^="Сломать"]'); await p.waitForURL(/rasskaz/, { timeout: 8000 }); await p.waitForTimeout(900);
}, { state: seen() });
await phone("06-reader-text", async (p) => {
  await p.goto(`${base}/rasskaz/${older[0]}`, { waitUntil: "networkidle" });
  await p.evaluate(() => window.scrollTo(0, 620)); await p.waitForTimeout(500);
}, { state: seen() });
await phone("07-end-guess", async (p) => {
  await p.goto(`${base}/rasskaz/${today}?z=1`, { waitUntil: "networkidle" });
  await p.evaluate(() => { const t = document.querySelector("[data-story-text]"); window.scrollTo(0, t.offsetTop + t.offsetHeight - 120); }); await p.waitForTimeout(900);
}, { state: seen() });
await phone("08-end-reveal", async (p) => {
  await p.goto(`${base}/rasskaz/${today}?z=1`, { waitUntil: "networkidle" });
  await p.evaluate(() => { const t = document.querySelector("[data-story-text]"); window.scrollTo(0, t.offsetTop + t.offsetHeight - 120); }); await p.waitForTimeout(700);
  const opts = await p.$$('button[class*="option"]'); if (opts[0]) await opts[0].click(); await p.waitForTimeout(1300);
  const r = await p.$('button[data-key="wow"]'); if (r) await r.click(); await p.waitForTimeout(600);
  await p.evaluate(() => window.scrollBy(0, 260)); await p.waitForTimeout(400);
}, { state: seen() });
await phone("09-note", async (p) => {
  await p.goto(`${base}/rasskaz/${older[1]}`, { waitUntil: "networkidle" });
  await p.evaluate(() => { const n = document.querySelector('aside[aria-labelledby^="note-"]'); n && n.scrollIntoView({ block: "center" }); }); await p.waitForTimeout(600);
}, { state: seen() });
await phone("10-settings", async (p) => {
  await p.goto(`${base}/rasskaz/${older[2]}`, { waitUntil: "networkidle" });
  await p.click('button[aria-label="Настройки чтения"]'); await p.waitForTimeout(700);
}, { state: seen() });
await phone("11-archive", async (p) => { await p.goto(base + "/arhiv", { waitUntil: "networkidle" }); await p.evaluate(() => window.scrollTo(0, 360)); }, { state: seen({ read: Object.fromEntries(older.slice(0, 4).map((s, i) => [s, Date.now() - i * 864e5])) }) });
await phone("12-calendar", async (p) => {
  await p.goto(base + "/arhiv", { waitUntil: "networkidle" });
  await p.click('button:has-text("Календарь")'); await p.waitForTimeout(400); await p.evaluate(() => window.scrollTo(0, 330));
}, { state: seen({ read: Object.fromEntries(older.slice(0, 4).map((s, i) => [s, Date.now() - i * 864e5])) }) });
await phone("13-shelf", async (p) => { await p.goto(base + "/polka", { waitUntil: "networkidle" }); }, { state: seen({ read: Object.fromEntries(older.map((s, i) => [s, Date.now() - i * 864e5])), reactions: { [older[0]]: "wow", [older[1]]: "hooked" }, guesses: { [older[0]]: true, [older[1]]: false } }) });
await phone("14-reader-night", async (p) => {
  await p.goto(`${base}/rasskaz/${older[3]}`, { waitUntil: "networkidle" }); await p.evaluate(() => window.scrollTo(0, 560));
}, { state: seen({ prefs: { theme: "night", font: "classic", size: 3, leading: "normal", blind: true } }) });
await phone("15-home-dusk", async (p) => { await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1000); }, { state: seen({ prefs: { theme: "dusk", font: "literata", size: 3, leading: "normal", blind: true } }) });
await phone("16-about", async (p) => { await p.goto(base + "/o-proekte", { waitUntil: "networkidle" }); }, {});
await phone("17-404", async (p) => { await p.goto(base + "/rasskaz/net-takogo", { waitUntil: "networkidle" }); }, {});
await phone("18-desktop-home", async (p) => { await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1200); }, { w: 1440, h: 900, state: seen() });
await phone("19-desktop-reader", async (p) => { await p.goto(`${base}/rasskaz/${older[4]}`, { waitUntil: "networkidle" }); }, { w: 1440, h: 900, state: seen() });

await browser.close();
console.log(JSON.stringify({ today, older, errors: errors.slice(0, 30) }, null, 1));
