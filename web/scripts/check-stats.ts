// Self-check for streak/week maths: node scripts/check-stats.ts
import assert from "node:assert/strict";
import { streak, week } from "../src/lib/stats";

const at = (day: string, h = 12) => Date.parse(`${day}T${String(h).padStart(2, "0")}:00:00+03:00`);
const goal = { daily: 10, yearly: 100 };
const base = { goal, read: {} as Record<string, number> };

// three met days ending yesterday: today not met yet → streak still 3
let s: { goal: typeof goal; read: Record<string, number>; log: Record<string, number> } = { ...base, log: { "2026-10-04": 600, "2026-10-05": 700, "2026-10-06": 601 } };
assert.deepEqual(streak(s, at("2026-10-07")), { current: 3, record: 3 });
// today met too → 4
s = { ...base, log: { ...s.log, "2026-10-07": 900 } };
assert.equal(streak(s, at("2026-10-07")).current, 4);
// a gap breaks it; record remembers the longest run
s = { ...base, log: { "2026-10-01": 600, "2026-10-02": 600, "2026-10-03": 600, "2026-10-06": 600 } };
assert.deepEqual(streak(s, at("2026-10-07")), { current: 1, record: 3 });
// finishing a story counts even below the minutes goal
const r = { ...base, log: { "2026-10-07": 30 }, read: { a: at("2026-10-07") } };
assert.equal(streak(r, at("2026-10-07")).current, 1);
// week starts on Monday, 7 entries, today flagged, future days empty
const w = week({ ...base, log: { "2026-10-05": 300 } }, at("2026-10-07"));
assert.equal(w.length, 7);
assert.equal(w[0].day, "2026-10-05");
assert.equal(w[0].progress, 0.5);
assert.equal(w[2].today, true);
assert.equal(w[3].future, true);
console.log("stats ok");
