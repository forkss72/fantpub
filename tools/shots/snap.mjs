// Screenshot helper for the redesign. Usage:
//   node tools/shots/snap.mjs <path-or-url> <out.png> [--w 390] [--h 844] [--dark] [--full]
//        [--wait 1200] [--state '{"onboarded":true}'] [--click 'css selector'] [--scroll 600]
// Default base: http://localhost:3100. --state merges into the fantpub:v2 localStorage record.
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const [target, out] = args;
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i === -1 ? d : args[i + 1];
};
const flag = (k) => args.includes(`--${k}`);
const base = process.env.BASE ?? "http://localhost:3100";
const url = target.startsWith("http") ? target : base + target;
const w = Number(opt("w", 390));
const h = Number(opt("h", 844));
const mobile = w < 700;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({
  viewport: { width: w, height: h },
  deviceScaleFactor: 2,
  isMobile: mobile,
  hasTouch: mobile,
  locale: "ru-RU",
  colorScheme: flag("dark") ? "dark" : "light",
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const state = opt("state", null);
await page.addInitScript((s) => {
  const base = { v: 2, onboarded: true };
  const cur = JSON.parse(localStorage.getItem("fantpub:v2") || "null") || {};
  localStorage.setItem("fantpub:v2", JSON.stringify({ ...base, ...cur, ...(s ? JSON.parse(s) : {}) }));
}, state);
await page.goto(url, { waitUntil: "load", timeout: 60000 });
const click = opt("click", null);
if (click) {
  await page.click(click);
}
const scroll = opt("scroll", null);
if (scroll) await page.evaluate((y) => window.scrollTo(0, Number(y)), scroll);
await page.waitForTimeout(Number(opt("wait", 1200)));
await page.screenshot({ path: out, fullPage: flag("full") });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
console.log(JSON.stringify({ out, overflow, errors: errors.slice(0, 8) }));
await browser.close();
