// Validates web/content: frontmatter, covers, blind-reading leaks, quotes, issue sequence.
// Usage: node tools/validate-content.mjs
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const matter = require("../web/node_modules/gray-matter");

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "web");
const COVERS = JSON.parse(fs.readFileSync(path.join(ROOT, "content/covers.json"), "utf8"));
const GENRES = new Set(["фантастика", "хоррор", "мистика", "притча", "юмор", "детектив", "реализм", "приключения", "сказка"]);
const authors = JSON.parse(fs.readFileSync(path.join(ROOT, "content/authors.json"), "utf8"));

const dir = path.join(ROOT, "content/stories");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
const problems = [];
const warn = [];
const rows = [];
for (const f of files) {
  const raw = fs.readFileSync(path.join(dir, f), "utf8");
  let d, content;
  try {
    ({ data: d, content } = matter(raw));
  } catch (e) {
    problems.push(`${f}: YAML error ${e.message}`);
    continue;
  }
  const p = (m) => problems.push(`${f}: ${m}`);
  const w = (m) => warn.push(`${f}: ${m}`);
  for (const k of ["slug", "issue", "title", "author", "year", "translation", "genres", "mood", "age", "teaser", "hook", "note", "quote"]) if (d[k] === undefined || d[k] === "" || d[k] === null) p(`missing ${k}`);
  if (d.slug && `${d.slug}.md` !== f) p(`slug ${d.slug} ≠ filename`);
  if (d.author && !authors[d.author]) p(`author ${d.author} not in authors.json`);
  if (!COVERS[d.slug]) p(`no cover in content/covers.json (run tools/build-covers.py)`);
  // blind reading: URLs are visible before the reveal, so a slug must not carry the author's name
  const surname = String(d.author ?? "").split("-").at(-1);
  if (surname && surname.length > 2 && String(d.slug).includes(surname)) p(`slug "${d.slug}" names the author`);
  for (const g of d.genres ?? []) if (!GENRES.has(g)) w(`genre «${g}» not in list`);
  if ((d.hook ?? "").length > 120) w(`hook ${d.hook.length} chars`);
  if ((d.note ?? "").length > 340) w(`note ${d.note.length} chars`);
  const a = authors[d.author];
  if (a) {
    const leak = [a.name, a.nameShort, ...(a.name || "").split(" ")].filter((x) => x && x.length > 3);
    for (const x of leak) {
      if ((d.hook ?? "").includes(x)) p(`hook names the author (${x})`);
      if ((d.teaser ?? "").includes(x)) p(`teaser names the author (${x})`);
    }
  }
  const text = content.replace(/\s+/g, " ");
  const words = text.split(" ").filter(Boolean).length;
  const paras = content.split(/\n{2,}/).filter((x) => x.trim()).length;
  if (words < 300) p(`only ${words} words`);
  const q = (d.quote ?? "").replace(/\s+/g, " ").trim();
  if (q && !text.includes(q.replace(/^«|»$/g, ""))) w(`quote not found verbatim in text`);
  if (/\[\d+\]|\{\{|\}\}|<ref|\|\s*thumb/.test(content)) p(`wiki markup leftovers`);
  if (/"[А-Яа-яЁё]/.test(content)) w(`straight quotes in text`);
  rows.push({ issue: d.issue, slug: d.slug, cloth: d.cloth, motif: d.motif, words, paras, minutes: Math.max(1, Math.round(words / 170)), genres: (d.genres ?? []).join(","), mood: d.mood });
}
rows.sort((a, b) => a.issue - b.issue);
for (let i = 1; i < rows.length; i++) {

  if (rows[i].motif === rows[i - 1].motif) warn.push(`issues ${rows[i - 1].issue}/${rows[i].issue} share motif ${rows[i].motif}`);
}
const issues = rows.map((r) => r.issue);
for (let i = 1; i <= Math.max(0, ...issues); i++) if (!issues.includes(i)) problems.push(`missing issue ${i}`);
if (new Set(issues).size !== issues.length) problems.push(`duplicate issue numbers`);

console.table(rows);
console.log(`\n${problems.length} problems`);
problems.forEach((x) => console.log("  ✗", x));
console.log(`${warn.length} warnings`);
warn.forEach((x) => console.log("  !", x));
process.exit(problems.length ? 1 : 0);
