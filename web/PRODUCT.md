# Product

<!-- impeccable:product-schema 1 -->

<!-- Init interview round was dismissed by the owner on 2026-10-07 with "сразу всё по максимуму делай"; facts below are taken from the repository, research/ and the owner's chat brief. Lines marked (inferred) were not confirmed in an interview. -->

## Platform

web

## Users
Russian-speaking adults who used to read and want a small daily literary habit that fits a commute, a lunch break or bedtime: one complete story, 3–20 minutes, mostly on a phone (Android Chrome, iOS Safari, installed PWA). Arrive from VK posts and shared story links. (inferred from research/13_synthetic_research.md)

## Product Purpose
FantPub gives one finished short story per day: classic, public-domain, many in new FantPub translations. Success is a reader who opens today's story, reads it to the end, comes back tomorrow, and sends a story to a friend.

## Positioning
"Странная классика": every day one complete story with a turn. The story is read blind — author and year stay sealed until the end and the reader guesses who wrote it. No other Russian daily-reading product does blind reading.

## Operating Context
- Daily issue: issue 1 = 2026-09-27, a new issue opens at 00:00 MSK; past issues stay open forever, future ones are 404 until their date.
- Reading happens in one sitting on a phone; resume by scroll position.
- Distribution: VK public (vk.ru/fantpub), shared links with spoiler-free previews, OG/quote cards.
- No accounts: everything personal lives in the browser; a transfer key moves it between devices.

## Capabilities and Constraints
- Next.js 16 App Router on Vercel, ISR + daily cron; content is markdown in content/stories with authors.json.
- Features that must stay reachable: today's story, blind reading + author guess, reactions, Pabchik's note and facts after the ending, archive (list + calendar), personal shelf, reader settings (theme, font, size, spacing), sharing (link riddle, quote card), PWA offline, transfer key.
- Shared reaction counts need Upstash Redis (not connected yet); until then reactions stay local.
- Public-domain texts only; never reproduce copyrighted texts. Images must be public domain / CC0 or own work; no AI-generated "нейрослоп".
- *.vercel.app is unreliable from Russia; a custom domain is an open owner decision.

## Brand Commitments
- Name FantPub; mascot Пабчик, a house-spirit with round glasses (raster poses in public/pabchik/), voice on «вы», dry humour, never more than one line before the story.
- Owner's binding visual brief (2026-10-07): look and feel of Apple Books in the Liquid Glass era — more glass, more skeuomorphism, more "wow", a more minimal app; the reading mode is isolated (text only), and everything else moves into a sheet before reading and a screen after it, as Apple Books does. Avoid anything that reads as AI-generated.
- Owner asked for "всё по максимуму": onboarding, profile and more features.

## Evidence on Hand
- 24 stories with hooks, moods, Pabchik notes and facts: content/stories/*.md.
- Research reports: ../research/*.md and ../research/redesign/*.md.
- Pabchik poses: public/pabchik/*.webp.
- No real testimonials, reader counts or press exist; do not invent them.

## Product Principles
1. One story a day, finished in one sitting; nothing competes with the text while reading.
2. The surprise is the product: never spoil the author or the ending anywhere before the last line.
3. Nothing burns: the archive stays open, progress is never lost, no guilt mechanics.
4. Private by default: no account required; personal data stays on the device.
5. Every share is spoiler-free and works as an invitation.

## Accessibility & Inclusion
WCAG AA contrast on every surface including glass; respect prefers-reduced-motion and prefers-reduced-transparency; reader text size and spacing adjustable; full keyboard and screen-reader support for sheets and the tab bar.
