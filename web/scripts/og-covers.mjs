// next/og (satori) can't decode WebP, so link previews and quote cards read JPEG copies of the covers.
// Run after tools/build-covers.py:  node scripts/og-covers.mjs
// Writes assets/og-covers/<slug>.jpg (480×720) — assets/** is traced into the server functions
// by next.config (public/ is not), so the OG routes can read them with fs in production.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const covers = JSON.parse(fs.readFileSync(path.join(root, "content", "covers.json"), "utf8"));
const out = path.join(root, "assets", "og-covers");
fs.mkdirSync(out, { recursive: true });

let n = 0;
for (const [slug, cover] of Object.entries(covers)) {
  const src = path.join(root, "public", cover.src.split("?")[0]);
  await sharp(src).resize(480, 720, { fit: "cover" }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(out, `${slug}.jpg`));
  n++;
}
console.log(`og-covers: ${n} JPEGs → ${path.relative(root, out)}`);
