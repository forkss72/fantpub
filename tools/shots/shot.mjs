// Usage: node shot.mjs <url> <out.png> [width=390] [height=844] [actionsJSON]
import { chromium } from "playwright-core";
const [, , url, out, w = "390", h = "844", actions = "[]"] = process.argv;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, isMobile: +w < 700, hasTouch: +w < 700, locale: "ru-RU", colorScheme: process.env.SCHEME || "light" });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(url, { waitUntil: "networkidle" });
for (const a of JSON.parse(actions)) {
  if (a.eval) await page.evaluate(a.eval);
  if (a.click) await page.click(a.click);
  if (a.wait) await page.waitForTimeout(a.wait);
  if (a.shot) await page.screenshot({ path: a.shot, fullPage: !!a.full });
  if (a.goto) await page.goto(a.goto, { waitUntil: "networkidle" });
}
await page.waitForTimeout(600);
await page.screenshot({ path: out, fullPage: process.env.FULL === "1" });
if (errors.length) console.log("ERRORS:", errors.slice(0, 8).join("\n"));
await browser.close();
console.log("ok", out);
