// Captures the seal-breaking ritual mid-animation at several offsets.
// Usage: node ritual-shot.mjs <outDir> [base]
import { chromium } from "playwright-core";
const [, , out, base = "https://fantpub.vercel.app"] = process.argv;
const b = await chromium.launch({ channel: "chrome", headless: true });
const state = { v: 1, read: {}, opened: {}, progress: {}, reactions: {}, guesses: {}, prefs: { theme: "auto", font: "literata", size: 3, leading: "normal", blind: true }, introSeen: true, ritualDay: null, installHintDismissed: false };
for (const t of [350, 700, 1100, 1450]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ru-RU" });
  const p = await ctx.newPage();
  await p.goto(base + "/o-proekte", { waitUntil: "networkidle" });
  await p.evaluate((s) => localStorage.setItem("fantpub:v1", JSON.stringify(s)), state);
  await p.goto(base + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1300);
  await p.click('button[aria-label^="Сломать"]');
  await p.waitForTimeout(t);
  await p.screenshot({ path: `${out}/ritual-${t}.png` });
  await ctx.close();
}
await b.close();
