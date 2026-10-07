---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/rasskaz/[slug]/page.tsx","src/app/arhiv/page.tsx"]
---

Scope: the whole FantPub web app (Today, book sheet, reader, finish sheet, Archive, Search, Полка, Profile, Onboarding). Mode: Operate for the shell, Read inside the reader.
Audience: Russian-speaking phone readers; one complete public-domain story a day, read blind.
Owner brief (pinned, 2026-10-07): Apple Books in the Liquid Glass era — more glass, more skeuomorphism, more wow, a minimal app; the reader is isolated (text only) with a sheet before reading and a screen after it; onboarding, profile and more features; no AI slop.
Build path: code-led (the comp round was not run: the owner dismissed the process question and asked for everything at once). Research references stand in for comps: research/redesign/mobbin/*.jpg, 02_refs/*.

## Direction contract

THESIS: The story of the day is a lit physical book on a field painted by its own cover; everything else is quiet system chrome in tinted Liquid Glass. Refuses the category default of a cream editorial page with cards and kicker labels.

OWN-WORLD: Neutral system canvas (white / #F2F2F7 grouped, black / #1C1C1E dark), colour only from public-domain cover art (per-story dominant/dark/light tints); glass only on the control layer (62px capsule tab bar + separate search circle, 44px circle buttons, inset sheets, pill-stack menus) with a specular rim and Blink-only edge refraction; covers are 2:3 objects with the measured Apple Books hinge, 1px bevel, tinted contact shadow; serif large titles (ui-serif → Literata), system-ui labels; brand sage only for progress and selection.

STORY: The reader sees today's book, taps it, reads a calm sheet (title, mood, length, Pabchik's one line, author sealed), presses «Читать», reads nothing but text, then gets the guess → reveal → reaction → note → share → tomorrow sequence; the book lands on their shelf and their daily goal fills.

FIRST VIEWPORT: Today on a 390×844 phone — large serif «Сегодня» with the grey date under it, ring + avatar circles top-right; the book of the day at ~58% width on a full-bleed band tinted from its cover, title and one meta line under it, a white «Читать · 6 мин» capsule above the floating glass tab bar; the next band («Эта неделя») peeks below the fold.

FORM: Apple Books 2026 product language (owner-pinned, no concept-seed roll; pinned direction beats the roll). Signature move: the cover morphs book → sheet → full-screen page via shared view transitions; secondary: frosted author label that de-blurs with a foil sweep at the reveal.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
