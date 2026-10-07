# 01 — Mobbin: Apple Books in the Liquid Glass era and what to take for FantPub

Date: 2026-10-07. Sources: Mobbin MCP (27 screen searches + 2 flow searches, iOS), 25 key screenshots saved in `research/redesign/mobbin/` (Mobbin's image links expire after 30 days), and pixel measurements taken from the full-res 1179 px captures.

**How measurements work.** The captures are 1179 px wide, which is a 393 pt iPhone at @3x. **All sizes below are in pt (= CSS px at 393 px viewport)** unless marked otherwise. Hex colours were sampled from the pixels.

---

## 0. Context check (live sources)

- **iOS 27 is current.** It started rolling out **14 Sep 2026** ([iPhone in Canada](https://www.iphoneincanada.ca/2026/09/09/apple-confirms-ios-27-release-date/), [Khaleej Times](https://www.khaleejtimes.com/tech/ios-27-uae-release-date-time-eligible-iphones-new-features)).
- **Liquid Glass stays in iOS 27.** iOS 27 refines it rather than replacing it:
  - it adds a system **translucency slider** ("ultra clear" ↔ "fully tinted");
  - glass now "diffuses complex content behind it much more effectively" ([BGR](https://www.bgr.com/2191219/ios-27-liquid-glass-fix-customization/), [heise](https://heise.de/-11212319)).
  - **What this means for us:** current Apple glass is *more frosted and more tinted* than the iOS 26 beta look. Don't copy the ultra-clear "liquid" demos. Copy the frosted, tinted, rim-lit look.
- **The Apple Books captures on Mobbin are the Liquid Glass design.** That means floating capsule tab bar, separate search circle, glass buttons and pill menus. Mobbin doesn't show the OS build. These screens match iOS 26.x, and nothing I found says iOS 27 changed the Books layout. One AI-summarised search claimed iOS 27 Books adds "Reading Goals coaching". **Unverified, so ignore it.**
- **Not on Mobbin:** Kindle, Libby, Storytel, Bookmate / Yandex Книги, Literal (each searched; results fell back to other apps).
  - Substitutes: Matter, Fable, Goodreads, Blinkist and Brink (a 2026 podcast app with the most skeuo-glass ideas).

---

## 1. Search log

`output_destination=doc`, the same `task_intent` on every call.

| # | Tool | Query (short) | Useful hits |
|---|---|---|---|
| 1 | screens | Apple Books home, Continue, glass tab bar | Home, Library, series, collapsed bar |
| 2 | screens | Apple Books book detail, colour bg | Detail sheet, pager, glass menus, HUD |
| 3 | screens | Apple Books reader controls after tap | Pill menu, scrubber, page curl, themes |
| 4 | flows | Apple Books open → read → finish | Home flow, reading streak, end-of-sample card |
| 5 | screens | Apple Books finished book, rating | "Finished / Tap to Rate" in Continue card |
| 6 | screens | Apple Music home, mini player + tab bar | Bottom accessory, collapse behaviour |
| 7 | screens | Apple Music now playing, artwork bg | Mesh bg, emoji reaction picker |
| 8 | screens | Apple Podcasts show page, tinted header | Artwork-bleed header |
| 9 | screens | Apple TV hero + glass tab bar | Full-bleed hero, page dots |
| 10 | screens | Apple News Today, date header | Title + grey date header, glass chips |
| 11 | screens | Kindle home (not found) | Blinkist glass, Fable, slop examples |
| 12 | screens | Libby shelf (not found) | Goodreads glass tab bar, Fable grid |
| 13 | screens | Readwise/Matter reading view | Matter glass toolbars, settings sheet |
| 14 | screens | Fable book page | Mood chips, streak card |
| 15 | screens | Storytel home (not found) | **Brink** "Continue Listening", Calm |
| 16 | screens | Yandex Books/Bookmate (not found) | Matter Discover bleed cards, Polarsteps 3D book |
| 17 | screens | Goodreads book detail | Blurred-cover header |
| 18 | screens | DailyArt painting of the day | TODAY pill, likes pill |
| 19 | screens | Daily puzzle done + countdown | Apple News Puzzles, LinkedIn "See you tomorrow" |
| 20 | screens | Liquid glass bottom sheet | Inset sheets, Opal "Hold to Start" |
| 21 | screens | 3D hardcover object | **Apple Books open-book zoom**, Retro, Polarsteps |
| 22 | screens | Apple Books search | Bottom search field, list covers |
| 23 | screens | Literal (not found) | Tolan serif "First impressions" |
| 24 | screens | Apple Invites full-bleed | Invites glass cards, Moonlitt (slop) |
| 25 | screens | Frosted "tap to reveal" | **CLEAR** frosted card, **Once** "Reveals in 4d 6h" |
| 26 | screens | Share quote card | Fable quote card, Lovi (slop) |
| 27 | flows | Apple Books customise theme | Font list, line spacing 1.16, justify |
| 28 | screens | Calendar with cover per day | BeReal, Hypelist, Alta |
| 29 | screens | Brink glass folders | **Glass pocket with fanned covers** |

---

## 2. Apple Books, screen by screen

### 2.1 Home (`01`, `02`, `14`)

- **Large title "Home".** New York Bold (serif), ≈34–36 pt, x = 32 pt.
  - Top right: two 44 pt circles. The left one is a reading-goal **ring** (blue arc + minutes); the right one is the avatar.
- **Side margin is 32 pt**, not 16. This is the single biggest reason it looks calm.
- **Section headers** ("Continue", "Want to Read ›") use New York Bold ≈22–24 pt. Subtitles are SF 17 pt grey (#8E8E93).
- **"Continue" card:**
  - 242 × 79 pt (62% of width), radius ≈10 pt.
  - Background is the **cover's dominant colour, darkened** (#7A5244 for a salmon cover), with a faint diagonal sheen.
  - Contents: a 38 × 60 pt cover thumbnail with its own shadow, then three lines of white SF text (title 17 semibold; author 17 at ~85% opacity; "Book · 1%" at ~65%), then "•••".
  - After finishing, the third line becomes "✓ Finished" and a row **"Tap to Rate ★★★★★"** appears *inside the same card*.
- **Shelves are bands, not cards.**
  - Each section sits on a full-width band with a vertical gradient: **#FFFFFF at the top → #F0F0F0 at the bottom over ≈180 pt**.
  - The next band starts with a hard edge back to white. It reads as shelf depth.
  - There are no dividers, borders or cards.
- **Shelf covers:**
  - 155 × 243 pt (39.5% of the 393 width), 17 pt gap; the third cover peeks at the right edge.
  - Under each cover: an outlined "GET" pill (11 pt bold, 1.5 pt black stroke) and "•••".
- **Reading Goals block** (bottom of Home):
  - Semicircle gauge, blue (#3E95D6) on grey track.
  - "Today's Reading" in serif 20, then a **huge serif numeral "1:34"** (≈64 pt New York) and "of your 2-minute goal ›".
  - Black capsule button "Keep Reading / Pride and Prejudice" (two lines, 50 pt tall, full width minus 32 pt margins).
  - Streak row: 7 day circles **S M T W T F S** (done days filled blue, joined by a bar), "Your reading streak is **2 days**", and "New Record" in blue. No flames, no shaming.
- **"More to Explore" cards:** white, radius ≈13 pt, label on the left; a **fan of 3 overlapping covers** bleeds off the right edge.

### 2.2 The cover object: the skeuomorphic part (measured in `01` and `12`)

| Property | Measured |
|---|---|
| Aspect | 1 : 1.56 (shelf), 1 : 1.53 (open zoom) — close to 2:3 |
| Corners | ≈1 pt on the spine side, ≈2 pt on the fore-edge. Not rounded cards |
| Hinge / spine shading (left edge) | 1 pt dark edge → 1 pt highlight → shadow groove at ~3–4% of cover width → second highlight at ~5% → flat. Shelf cover: groove at 4–5 pt. Open zoom (324 pt cover): groove at ~13 pt |
| Top bevel | 1 px lighter line on the top edge |
| Light falloff | Cover gets ≈8% darker from top to bottom (#4D55F5 → #3740F3 on the blue cover) |
| Contact shadow | Below the cover, ≈25–27 pt soft shadow **tinted with the cover hue** (#A9AABE right under a blue cover). Side shadow is faint (≈6 pt) |
| On a coloured bg | Shadow is the bg colour ~10% darker (#80412F under the cover on #944026 bg), ≈20 pt |
| White covers | Get a 1 px #D9D9D9 outline so they don't melt into the white band |
| Page block | Not visible from the front. The object reads as a hardcover only through hinge, bevel and shadow |

The cover art itself is **flat and graphic**. Apple Books Classics covers are one bold colour field, one cut-out B/W photo or engraving, and a grotesk title (Helvetica-like bold, top left).

**All the realism is in the lighting of the object, none of it is in surface texture.** This is the exact opposite of FantPub's current cloth + tiled-motif covers.

### 2.3 Book detail sheet (`05`, `06`, `07`, `08`)

- **Presentation:**
  - Opens as a **card sheet**: ≈50 pt top gap, corner radius ≈38 pt, underlying screen dimmed to ~40%.
  - The sheet is a **horizontal pager.** Slivers of the neighbouring books' sheets (orange, grey) show at the left and right edges in `05`. You swipe to the next book.
- **Background:**
  - The cover's dominant colour as a vertical gradient: **#A3482D at the top → #833821 at the bottom** (same hue, ~20% darker by the end).
  - Below the colour block, the sheet turns plain white for "From the Publisher" (New York Bold 22) and grey SF 17 body text.
- **Cover:**
  - ≈50% of the width (≈196–202 pt), centred, with the hinge shading from 2.2.
  - The sheet's top bleeds under the status bar.
- **Glass buttons** (44 pt): a ✕ circle at top-left, and a grouped capsule **[+ | •••]** at top-right (99 × 44 pt).
  - They are **tinted with the light version of the cover colour** (#F2B8A0 on salmon) and are not grey.
- **Text block**, centred, white:
  - Kicker "APPLE BOOKS CLASSICS ›": SF 13 semibold caps, tracking ≈+1.5 pt, 2 pt underline.
  - Title: New York Bold ≈24–26 pt.
  - Author: SF 20 with "›".
  - Meta: "★ 3.5 (1.2K) · Fiction & Literature", SF 15 at 80% opacity.
- **Action card:**
  - 328 × ~128 pt, radius ≈18 pt, fill = white at ~10% over the bg (#A45640 on #8E3E25).
  - Inside: "Book ⓘ" (SF 17 semibold) and "January 1813 · 490 Pages" (15 pt).
  - Then the primary button: **white capsule, 49–50 pt tall, black "Read" in 17 semibold**.
  - When there are two actions: "Sample" (glass, white text) + "Get" (white). The pair takes 50/50.
- **Menus:**
  - "•••" opens a **dark-tinted glass popover** that picks up the bg colour.
  - First row: 2 large icon actions (Share, Want to Read). Then list items with 17 pt labels and SF Symbols. Destructive items are red.
- **HUD confirmation** ("Suggest More", "Added"):
  - Centred frosted square ≈190 × 190 pt, radius ≈24 pt.
  - Contents: big line icon, serif title ("Added"), one 15 pt line, and an optional "GOT IT".

### 2.4 Series page (`03`)

- **Same colour-bg treatment** as the detail sheet.
- **Fanned stack of 5 covers:**
  - Centre cover ≈30% of width, the others offset ±40 pt and scaled ~90% / 80%.
  - Each cover keeps its hinge shading and drop shadow.
- **Text:** serif title "Apple Books Classics", then "Multiple Authors", then "Series · 48 Books" in white.
- **Button:** a glass capsule "Get a Free Book / The Art of War" (two lines).
- **When scrolled,** the header collapses into a **tinted glass capsule in the Dynamic-Island area** showing the button label. The bottom bar becomes ⌂ circle + search field + ✕ circle.

### 2.5 Library (`04`)

- **Large title "Library",** with two 44 pt glass circles (sort, •••) at top right.
- **Grid:** 2 columns of ≈155 pt hardcover objects; status pills (GET / SAMPLE in red) and "•••" under each.
- **Series** are shown as **two physically stacked covers** (back one offset −14 pt / −8 pt) with a "48 books" caption.
- **Empty state:** "Library is Empty" in serif grey 22 pt + one 15 pt line. Nothing else.

### 2.6 Reader (`09`, `10`, `12`, and the "Reading a book" flow)

- **Idle chrome is three quiet text elements:**
  - Top centre: "4 pages left in chapter" (SF 15, #8E8E93, y ≈ 89 pt).
  - Bottom centre: "1 of 622" (SF 15 grey).
  - Bottom right: a glass menu button (≈44 pt).
  - On tap, a ✕ glass circle appears at top right. A "↺ 22" return-to-page chip appears at top left after jumps.
- **Text column:**
  - Left margin ≈54 pt, right ≈42 pt (≈297 pt measure on 393). Justified + hyphenated, first-line indent ≈29 pt.
  - Body ≈16–17 pt serif, line pitch ≈19 pt. The default line spacing slider reads **1.16**.
  - **Don't copy 1.16 for Cyrillic on the web: use 1.5–1.6.**
- **Chapter opener:** serif Bold ≈30 pt, centred, with a thin rule + knot ornament (≈105 pt wide) below.
- **Page turn:** a **realistic page curl**, with the mirrored text of the back of the page showing through. This is the one place Apple still does pure skeuomorphism.
- **Scrubber:** a vertical glass slider on the right edge, with a glass tooltip "Chapter 20 / Page 143" to its left.
- **Opening transition (`12`):**
  - The cover zooms to ≈82% of the width (324 pt), centred on a white→#F2F2F0 bg, with full hinge shading and right-side shadow.
  - Then it gives way to page 1.
  - First-run tip bubble: "Choose a theme, page turn animation and more…".
- **End of sample:** a floating glass card above the page number with mini cover, title, author and a black "GET" capsule.

### 2.7 Reader menu: a pill stack, not a sheet (`09`)

- The menu is anchored to the bottom-right button and grows upward.
- **Pills:** **273 pt wide (69.5%), 17 pt from the right edge, 46 pt tall, 6 pt gaps.** Label at left (SF 17 regular), SF Symbol at right.
  - Pill 1 "Contents · 0%" is **dark** (#3A3A3C at ~90% opacity, white text). It is the primary pill and doubles as the progress readout.
  - Pills 2–4 ("Bookmarks & Highlights 1", "Search Book", "Themes & Settings Aa") are light glass (#E9E9EB-ish, translucent).
  - Bottom row: 4 glass capsules, each 64 × 46 pt with ≈4 pt gaps: share, rotation lock, scroll/line guide, bookmark. The bookmark turns **solid red** when active.
- The page behind gets a soft white→grey scrim from the bottom.

### 2.8 Themes & Settings sheet (`11`, plus the customise flow)

- **Sheet:** bottom sheet, bottom corners follow the device radius, title "Themes & Settings" (SF 20 semibold) + ✕ circle.
- **Row 1:**
  - A segmented capsule **[ A | A ]** for size (≈178 × 36 pt).
  - A capsule with two toggles: page style and appearance. The appearance one opens a glass popover: Light / Dark / Match Device / Match Surroundings.
- **Row 2:** brightness slider with a **glass capsule thumb ≈36 × 24 pt**.
- **Theme grid:**
  - **3 × 2 tiles, 110 × 92 pt, 11 pt gap, radius ≈20 pt.**
  - Each tile shows "Aa" (≈34 pt) plus the theme name, rendered **in that theme's own font and colours**: Original, Quiet, Paper, Bold, Calm (sepia #E9DFC6), Focus.
  - Selected tile: 3 pt outline (black in light mode, white in dark).
- **"⚙ Customise" capsule:** full width, 47 pt, fill = white at 12%.
- **Customise screen:**
  - Live preview paragraph on top.
  - Font list: Original, Athelas, Avenir Next, Canela, Charter, Georgia, Iowan, …
  - Bold text toggle, then sliders for line spacing (1.16), character spacing, word spacing and margins, plus "Justify Text".

### 2.9 Search (`22` series)

- **The search field lives at the bottom** (iOS 26 pattern): ⌂ circle + capsule field + ✕ circle, 48 pt tall.
- **Results:** 44 pt cover thumbnails (still shaded books) and a grey "GET" capsule.
- **Sections:** "Recent Searches", "Recently Viewed", "Trending" with serif headers.

---

## 3. The Liquid Glass system across Apple apps

### 3.1 Tab bar (Books `01`, Music `15`/`16`, TV `19`, News `20`, Podcasts `18`)

- **Expanded state:**
  - Floating capsule **281 × 62 pt, 21 pt from the left and bottom edges**.
  - **A separate 62 pt glass circle** for search, 8 pt to the right.
  - The selected tab has an **inner grey pill** (≈74–96 × 54 pt, 4 pt inset). Its icon + label take the app accent: red in Music and News, black in Books, blue in TV.
  - Icons ≈26 pt; labels SF 10 semibold.
- **Glass recipe as rendered:**
  - Fill is ~75% white (light mode).
  - **Thick white rim highlight** (2–3 px @3x) is brighter on the top-left.
  - Large soft shadow.
  - Visible **lensing:** content under the search circle is magnified and bent at the edge. Content colour bleeds through: a yellow cover tints the bar in `01`.
- **On scroll down (`02`, `16`), the bar minimises:**
  - It becomes a **48 pt circle with only the current tab's icon** on the left and a 48 pt search circle on the right.
  - Music puts the mini player **between them** as a 223 × 48 pt capsule.
- **Mini player (Music, Podcasts):**
  - Separate capsule **351 × 48 pt** sitting 8 pt above the tab bar.
  - Contents: 30 pt artwork (radius 6 pt), two lines (SF 13 grey source + 15 semibold title), play/next glyphs.

### 3.2 Top of screen

- **No nav bar background.** Content scrolls under the status bar with a soft **scroll-edge blur/fade** (≈60 pt).
- **Back and actions are floating 44 pt glass circles** (‹, •••) or grouped capsules (Matter: [▶ ⇪ 🔖 •••]).

### 3.3 Colour pulled from content

- **Podcasts show page (`18`):**
  - The artwork is full-bleed at the top. Its bottom edge **melts into the sampled dominant colour** (a yellow field), which continues behind the text.
  - Primary button: a dark capsule "▶ Latest Episode", 50 pt.
  - The glass buttons turn yellow.
- **Apple TV (`19`):**
  - Full-bleed hero ≈75% of the screen height, fading to black. Large title "Home" white over the image.
  - Glass meta pill "Season Finale", white "▶ Play" capsule + glass "+" circle.
  - **Page dots:** the active dot is an elongated pill.
- **Music Now Playing (`17`):**
  - Background is a muted **mesh gradient sampled from the artwork**. Artwork ≈87% of width, radius ≈10 pt, deep shadow.
  - **Reaction picker:** a glass capsule with 6 emoji (👍 ❤️ 🎉 🔥 👎 💔 +). The chosen one floats up the screen in small bursts.
  - This is the best reference for FantPub reactions.
- **Goodreads:** blurred, enlarged cover as the header bg behind the sharp cover.

### 3.4 Header with a date (Apple News `20`)

- **Two-tone large title:** "● News" in black + **"April 6" in grey (#8E8E93)** on a second line, same 34 pt bold.
- Under it: a row of glass category chips (icon + label, 32 pt tall).
- **Maps directly to "Рассказ дня / 7 октября".**

### 3.5 Sheets (`20` series: Jomo, Opal, Craft, ChatGPT)

- **Half-height sheets float ≈8 pt inset** from the screen edges, with corners following the device radius (~40 pt) and a 36 × 5 grabber.
- They are translucent: the content behind stays visible, blurred.
- **Opal "Hold to Start":** a glowing glass capsule that confirms on press-and-hold. Good for a deliberate "open today's story" gesture.

---

## 4. Reading and daily apps: what to take and what to avoid

| App | Screen | Take |
|---|---|---|
| **Brink** (2026) | `21`, `22` | **Frosted glass pocket with 3 fanned covers tucked in.** Folder tile ≈170 pt, radius ≈16 pt, back panel in colour, front pocket heavy blur + wave-shaped top edge + white rim. The best "glass + skeuomorphism + wow" find. Also: the whole app is one big rounded sheet over a sky photo with "Good afternoon, Alex / You have **2** new episodes", "Continue Listening" card tinted from artwork, a white "▶ Playing · 18 min left" capsule, and an "**Expected releases tomorrow**" row. |
| **CLEAR** | `23` | Frosted glass card hiding a document + outlined glass capsule "Show Details 👁". The pattern for the **blind author/title reveal**. |
| **Once** | — | "**Reveals in 4d 6h**": blurred content + countdown. Use for the tomorrow slot. |
| **Apple News Puzzles** | `24` | Done screen: a **skeuomorphic rosette ribbon** illustration, "Brilliant Work!", date card, then Done (accent capsule) + 2 secondary tinted capsules (More Puzzles, Share). A model for the end-of-story screen. |
| **LinkedIn Wend** | — | "See you tomorrow!" + "41% of new players couldn't solve this". The same stat-reaction mechanic as ours ("62% не ожидали финала"). |
| **Matter** | `25` | Liquid Glass reader: top ‹ circle + grouped capsule [▶ ⇪ 🔖 •••], bottom "More like this" capsule + [🗑 ▢] group. Settings sheet inset by 8 pt, radius ≈32 pt, theme chips. Discover cards: the artwork bleeds into a sampled colour with white text over it. |
| **Fable** | — | Mood chips under the cover on the detail page ("Moving", "Thought-provoking"). Quote share card: solid book-colour card, serif quote, mini cover bottom-right. Pre-glass styling, so **don't** copy the chrome. |
| **DailyArt** | — | Artwork in a radius ≈20 pt card at the top, white sheet overlapping it with a "TODAY" pill, "1070 ♥" likes pill and ⇪ circle, condensed serif title ≈28 pt. Still a pre-glass tab bar. |
| **Goodreads, Blinkist** | — | Both already adopted the glass capsule tab bar with 4–5 tabs. With 5 tabs the capsule is cramped. **Keep FantPub at 2–3.** |
| **Polarsteps, Retro** | — | Real 3D book objects (visible page block, glossy spine highlight). Too literal for a cover thumbnail; fine for one hero moment. |
| **BeReal, Hypelist** | — | Calendar archives: glass segmented [Memories / Calendar], a month switcher capsule "‹ April 2026 ›", cover thumbnails in day cells. |

**AI-slop markers seen on Mobbin (avoid):**
- **Painterly AI illustrations** as covers (Life Reset, Moonlitt's glowing moon and forest).
- **Purple/pink gradient cards with glow** (Lovi "Share affirmation").
- **Glowing star blobs** on starfield bgs (Tolan).
- **Generic outlined-icon tab bars with a blue + FAB** (Speechify).

Apple Books Classics and DailyArt look premium because they use **real public-domain photos and engravings** with bold flat colour.

---

## 5. What makes it feel like Apple Books: 15 buildable traits

1. **Books are lit objects, not cards.**
   - Corners `1px 2px 2px 1px`.
   - Hinge gradient on the left 0–6% of width (dark 1 px, highlight, groove at 3–4%, highlight at 5%).
   - 1 px top bevel, an 8% top→bottom light falloff overlay, and a cover-tinted contact shadow ≈16% of cover width, offset down.
   - No texture, no grain on the cover surface.
2. **Flat graphic cover art.** One colour field, one PD engraving or photo cut-out, a bold grotesk title top-left. Realism lives only in trait 1.
3. **Colour sampled from the cover drives the screen.**
   - Detail/story bg = dominant colour as `linear-gradient(#base 0%, darken(#base, 20%) 100%)`.
   - The Continue card is the dominant colour darkened ~35%.
   - Glass buttons are tinted with the light version (≈85% L).
   - **Precompute at build time** into story frontmatter (`coverColor`, `coverColorDark`, `coverColorLight`).
4. **Serif display + SF-style UI, few sizes.**
   - Serif Bold 34 (large title), 22 (section), 24–26 (book title), plus a 64 serif numeral for one hero stat.
   - Sans 17 / 15 / 13 / 10.
   - Grey secondary = #8E8E93 (light) / #98989D (dark).
5. **Floating glass capsule tab bar** (62 pt tall, 21 pt from the edges, inner selected pill) **with a separate 62 pt circle**. It collapses to 48 pt circles on scroll-down and expands on scroll-up.
6. **No nav bars.** 44 pt glass circles and grouped capsules float at the top corners. Content scrolls under the status bar with a 60 pt edge blur.
7. **Wide 32 pt page margins.** Shelf covers at ≈39% of width with a 17 pt gap and a peeking third cover. The shown cover sizes go **39% → 50% → 82%** (shelf, detail, opening).
8. **Shelf bands instead of dividers:** full-width sections with `linear-gradient(#fff, #f0f0f0)` over ≈180 pt and a hard top edge.
9. **Details open as card sheets:** 50 pt top gap, radius 38 pt, screen behind dimmed. **Swipe sideways to the neighbouring item.**
10. **One primary action per screen,** as a 50 pt full-width capsule: white on colour, black on white. It sits inside a translucent action card (radius 18 pt, white at 10%) with one meta line above it.
11. **Reader chrome = three grey text items** ("осталось ~6 мин" top centre, "34%" bottom centre, menu button bottom right) + a ✕ circle on tap. Never a toolbar.
12. **Menus are pill stacks that grow from their button:** 46 pt pills, 6 pt gaps, 70% width, right-aligned, primary pill dark, last row of 46 pt icon capsules. They are not modal sheets.
13. **Theme tiles show "Aa" in the real font and colour of each theme.** 110 × 92 pt, radius 20, 3 pt outline when selected. One "Настроить" capsule below.
14. **One analog motion per surface:**
    - The page curl (Books) or the cover → page zoom when opening.
    - The fanned cover stack for collections.
    - Floating reaction bursts (Music).
    - Everything else is a plain spring.
15. **Calm progress.** Ring + week dots S–S + "серия 2 дня · рекорд". Celebration is a frosted HUD square (icon + serif word) or an inline "Оценить ★★★★★" in the Continue card. No confetti, no flames, no loss messaging.

---

## 6. Recommended information architecture for a minimal FantPub

### 6.1 Navigation

- **Glass capsule with 2 tabs: [Сегодня | Архив].** No search circle: there are 24 stories, and search would leak blind titles.
- **Top-right of "Сегодня":** a 44 pt glass **week ring** (stories read this week / 7). It opens the **«Полка» sheet.** This mirrors Apple Books' goal ring + avatar and removes the shelf as a separate page.
- **The reader and the story sheet hide the tab bar.**

### 6.2 Screens

1. **Сегодня** (the ritual, one object)
   - Large title "Сегодня" + grey date line "7 октября" (Apple News).
   - **Hero:** today's book object at ≈62% width (≈244 pt), centred on a band coloured from the cover.
   - **First visit of the day:**
     - The book sits in a **frosted glass pocket/envelope** (Brink pocket + CLEAR frosting).
     - Tap or hold-to-open (Opal) plays a ≤1.2 s unwrap → cover zoom.
     - Every later visit shows the book directly.
   - Meta line "Рассказ · ~8 мин · 1907", then a white/black "Читать" capsule inside the action card.
   - **If in progress:** a cover-tinted Continue card ("34% · осталось 5 мин"). After finishing, the same card shows "Оценить" with reactions inline.
   - **"Эта неделя":** a horizontal shelf of the last 6 covers (96 pt objects). The 7th slot is a frosted "Завтра · 07:00" with a countdown (Once).
   - That's all. Footer: one line about public domain.
2. **Story sheet** (from any cover; also the archive's item page and SEO landing)
   - Colour bg from the cover, cover at 50%.
   - Kicker "РАССКАЗ ДНЯ · 7 ОКТЯБРЯ" (13 pt caps, +1.5 tracking).
   - Title in serif 26. With blind mode on, the **author is a frosted chip "Автор скрыт"** (CLEAR).
   - Meta line, then the action card with "Читать".
   - White lower part: a 2-line teaser and mood chips (Fable).
   - **Swipe left/right moves between days** (Apple Books pager).
3. **Reader**
   - Paged or scroll, serif, 3 themes.
   - Chrome per trait 11.
   - Menu pill stack: ["Тема и шрифт Aa" (dark primary), "Поделиться цитатой"] + an icon row [⇪, 🔖, ✕].
   - Opening: cover → page zoom (≈82% cover moment).
4. **Финал** (a sheet that rises over the last page, in sequence)
   - a) **Guess → reveal:** a frosted card hides author + title; "Показать" or hold to reveal.
   - b) **Reaction capsule:** 3–5 glyphs with a burst animation, then one stat line ("62% не ожидали финала").
   - c) **Pabchik note:** one card, serif, ≤4 lines, a small drawn mascot at the corner.
   - d) **Quote → share card** (Fable style: solid cover colour, serif quote, mini cover).
   - e) **"Завтра в 07:00" + "Напомнить".**
   - Modelled on the Apple News Puzzles done screen: one primary + two secondary capsules.
5. **Архив**
   - Large title "Архив" + a glass segmented control **[Обложки | Календарь]**.
   - **Обложки:** an Apple Books Library 2-column grid of book objects grouped by month. **Months collapse into Brink-style glass pockets** with 3 fanned covers when zoomed out (the wow moment of this tab).
   - **Календарь:** a month grid with a cover thumbnail in each day cell and a "‹ Октябрь 2026 ›" glass capsule (Hypelist/BeReal). Unread blind days show a frosted cover.
   - A "Прочитанные" filter chip replaces the separate shelf page.
6. **Полка sheet** (from the ring)
   - Week dots S–S, "серия N дней", a row of read covers, the count of reactions given.
   - No account, local only.

### 6.3 What to cut from the current build

- **Cloth texture, tiled SVG motifs, grain and the wax seal on covers.** Replace with flat cover art + object lighting (traits 1–2).
- **Every multi-paragraph text block on the home screen.** Keep one meta line + one button.
- **Pabchik on home.** Keep him in onboarding (one bubble) and the finale (one note).
- **The standalone shelf page and the advent calendar as a separate route.** They become the ring sheet and an archive view mode.
- **Any toolbar in the reader.**
- **Decorative frames/ornaments around UI.** Keep one ornament: the knot rule under the story title in the reader.

---

## 7. Web build notes (Next.js / CSS Modules)

- **Glass on the web:**
  - `backdrop-filter: blur(20px) saturate(180%)` works in Safari (prefixed and unprefixed), Chrome and Firefox.
  - The SVG displacement "refraction" (`backdrop-filter: url(#lens)`) is Chromium-only. Treat it as progressive enhancement, never required.
  - **Keep ≤3 live backdrop-filter layers on screen** for mid-range Android. Don't animate blur radius; animate `transform` / `opacity`.
- **Base glass token** (light; for dark swap the base to `rgb(40 40 44 / .62)` and the rim to `.18`):

```css
.glass {
  background: color-mix(in oklab, var(--tint, #fff) 72%, transparent);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 999px;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .9),      /* top rim */
    inset 0 0 0 1px rgb(255 255 255 / .45),   /* full rim */
    0 1px 2px rgb(0 0 0 / .06),
    0 10px 30px rgb(0 0 0 / .12);
}
```

- **Book object:**

```css
.book { aspect-ratio: 2/3; border-radius: 1px 2px 2px 1px; position: relative;
  background: var(--cover-img) center/cover;
  box-shadow: 0 1px 1px rgb(0 0 0 / .10),
              0 14px 24px -8px color-mix(in oklab, var(--cover-color) 55%, #000 25%); }
.book::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background:
    linear-gradient(90deg, rgb(0 0 0/.28) 0 .7%, rgb(255 255 255/.30) 1.4%, transparent 2.4%,
                    rgb(0 0 0/.18) 3.4%, rgb(255 255 255/.22) 4.8%, transparent 6.5%),
    linear-gradient(180deg, rgb(255 255 255/.14) 0, transparent 1.2%, transparent 40%, rgb(0 0 0/.08) 100%); }
```

- **Fonts:**
  - On Apple devices, `font-family: ui-serif` resolves to **New York** (Cyrillic included) at zero download cost.
  - Android Chrome doesn't support `ui-serif`, so give it a Cyrillic webfont fallback (see `research/07_fonts.md`), e.g. `ui-serif, "Literata", Georgia, serif`.
  - UI: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` gives SF Pro on iOS and Roboto on Android.
- **Motion:** use View Transitions for cover → story sheet → reader (the morphing shared element is what makes it feel native). Fall back to a crossfade under `prefers-reduced-motion`.
- **Legibility over glass:** iOS 27 users can push system glass toward "tinted". Ship our glass at ≥70% fill so text on it stays readable.

---

## 8. Image URLs to look at

Local copies are in `/Users/forkss/FantPub/research/redesign/mobbin/NN-*.jpg` (the numbers below match). The `image_url` short links expire about 30 days after 2026-10-07.

| # | What | Mobbin page | Image |
|---|---|---|---|
| 01 | AB Home: Continue card, shelf bands, glass tab bar | https://mobbin.com/screens/ef25171d-f4a6-43ed-a0a2-375e835230f8 | https://mobbin.com/api/mcp/short/X5zCLFxE |
| 02 | AB Home scrolled: tab bar collapsed to 2 circles, Reading Goals | https://mobbin.com/screens/15fd505b-ceb3-4b88-b4e2-4e9ec3bd4a07 | https://mobbin.com/api/mcp/short/vdy2CV09 |
| 03 | AB series: colour bg + fanned 5-cover stack | https://mobbin.com/screens/a20dc904-9649-4cc2-b398-b9226311c3d6 | https://mobbin.com/api/mcp/short/ESW4tGd3 |
| 04 | AB Library grid, stacked series | https://mobbin.com/screens/fb8d6cde-a349-4b0b-a1d5-4fbbc3fce77f | https://mobbin.com/api/mcp/short/NRVmE2MX |
| 05 | AB detail sheet as horizontal pager (neighbour slivers) | https://mobbin.com/screens/6f9a2ea1-6719-4f93-a59f-dc69c34a8bb6 | https://mobbin.com/api/mcp/short/arck2Ymv |
| 06 | AB detail: cover colour bg, action card, white "Read" | https://mobbin.com/screens/66c484d9-d6eb-4684-bbd1-27019d9875f8 | https://mobbin.com/api/mcp/short/eWTIOOpX |
| 07 | AB detail presented as a card over Home | https://mobbin.com/screens/c1940f98-8a2c-474c-b2a1-f829df297bd8 | https://mobbin.com/api/mcp/short/EGfKlLNs |
| 08 | AB tinted glass context menu | https://mobbin.com/screens/afdff270-7cfc-41eb-b915-aeabe396a3d1 | https://mobbin.com/api/mcp/short/eKY6WaU5 |
| 09 | AB reader: pill-stack menu | https://mobbin.com/screens/deb26c2b-9819-41c6-8d6a-bb53b14ed2c4 | https://mobbin.com/api/mcp/short/muImNKOR |
| 10 | AB page curl | https://mobbin.com/screens/23aec3ab-a07f-4d5d-9c18-cdb4c09490f7 | https://mobbin.com/api/mcp/short/f71UJ1uz |
| 11 | AB Themes & Settings (dark), "Aa" tiles | https://mobbin.com/screens/e934326b-c637-4937-9a5f-6b05c3cc0a08 | https://mobbin.com/api/mcp/short/0bslud1V |
| 12 | AB open-book cover zoom (hinge shading, 82% width) | https://mobbin.com/screens/142bafd9-d52c-400d-ab62-1feac4016f58 | https://mobbin.com/api/mcp/short/rjNv5TnP |
| 13 | AB Continue card after finishing: "Tap to Rate" | https://mobbin.com/screens/342481e0-86a5-43a9-82db-44743f985dd8 | https://mobbin.com/api/mcp/short/YhWPUhqm |
| 14 | AB Reading Goal gauge + "Keep Reading" | https://mobbin.com/screens/00e87b5b-d9f8-43a1-8274-6b0ac438a2eb | https://mobbin.com/api/mcp/short/YVOaEoXy |
| 15 | Music: mini player capsule above tab bar | https://mobbin.com/screens/2c60ded1-770d-4748-b7d8-1c8bf29580d7 | https://mobbin.com/api/mcp/short/jIXlB2CL |
| 16 | Music: collapsed bar, inline player, lensing | https://mobbin.com/screens/3d34a415-571a-48ec-a251-794b75407811 | https://mobbin.com/api/mcp/short/3qMx7QhN |
| 17 | Music Now Playing: emoji reaction capsule | https://mobbin.com/screens/b166b10a-4ed4-4ed1-8a8a-1446dad381a9 | https://mobbin.com/api/mcp/short/6QUIZqnZ |
| 18 | Podcasts: artwork bleeding into sampled colour | https://mobbin.com/screens/ee2d5196-f097-45b7-86fa-307350567922 | https://mobbin.com/api/mcp/short/6RtQrTrj |
| 19 | Apple TV full-bleed hero + glass | https://mobbin.com/screens/de782436-595d-4d13-ba0e-6d0624cffe44 | https://mobbin.com/api/mcp/short/UPSZoppZ |
| 20 | Apple News title + grey date header | https://mobbin.com/screens/2450aa3b-98e8-45ed-a7bc-afb38e478b73 | https://mobbin.com/api/mcp/short/rkbzkbr7 |
| 21 | Brink: frosted glass pockets with fanned covers | https://mobbin.com/screens/0d19107c-4e2c-4a60-a0cb-9af016a4a9b9 | https://mobbin.com/api/mcp/short/L1Vccdoe |
| 22 | Brink: app sheet over sky photo, "tomorrow" row | https://mobbin.com/screens/11afee43-c813-49db-94ad-24a7c7faaeda | https://mobbin.com/api/mcp/short/RYOCoeBV |
| 23 | CLEAR: frosted card + "Show Details" reveal | https://mobbin.com/screens/3c9f89d5-8e16-4f77-8cdd-1fe3f9f07907 | https://mobbin.com/api/mcp/short/mAWJbbXz |
| 24 | Apple News Puzzles: done screen with rosette | https://mobbin.com/screens/9d6d2b9e-e1dc-4cd6-8b0e-8c15b51e7727 | https://mobbin.com/api/mcp/short/cnRRYGZW |
| 25 | Matter: Liquid Glass reader toolbars | https://mobbin.com/screens/86597b2d-a776-4b91-9903-55960c7e3012 | https://mobbin.com/api/mcp/short/2WKtTY2l |

Relevant flows:
- Apple Books "Home": https://mobbin.com/flows/b09cc46a-453e-4a0b-8c88-b00eb8108ae2 (includes the streak week-dots screen)
- "Reading a sample": https://mobbin.com/flows/f12e0c84-531c-49dd-be84-edeea05d53ec (end-of-sample glass card)
- "Customizing text": https://mobbin.com/flows/e737766b-6ad6-4960-9b1e-6825fd266d79

## 9. Sources (non-Mobbin)

- [iPhone in Canada: iOS 27 release date](https://www.iphoneincanada.ca/2026/09/09/apple-confirms-ios-27-release-date/)
- [Khaleej Times: iOS 27 release](https://www.khaleejtimes.com/tech/ios-27-uae-release-date-time-eligible-iphones-new-features)
- [BGR: iOS 27 Liquid Glass translucency slider](https://www.bgr.com/2191219/ios-27-liquid-glass-fix-customization/)
- [heise: iOS 27, no major Liquid Glass changes](https://heise.de/-11212319)
- [Thurrott: iOS 26 beta 3 tones down Liquid Glass](https://www.thurrott.com/apple/323084/ios-26-beta-3-tones-down-liquid-glass-redesign)

---

## 10. Summary (most actionable)

1. Apple Books' realism lives in **object lighting**, not texture: hinge groove at 3–4% of cover width, a 1 px top bevel, an 8% light falloff and a cover-tinted contact shadow. Drop the cloth, grain and seal; keep the covers flat and graphic.
2. **Cover colour drives each screen:** the story sheet bg is the dominant colour as a gradient (#A3482D → #833821), the Continue card is a darker version, and the glass buttons a lighter one. Precompute the three colours per story at build time.
3. The tab bar is a **floating glass capsule** (281 × 62 pt, 21 pt insets, inner selected pill) plus a separate circle. It collapses to 48 pt circles on scroll. FantPub needs only **[Сегодня | Архив]**.
4. There are **no nav bars**: 44 pt glass circles and grouped capsules float at the corners, and content scrolls under the status bar with an edge blur.
5. Home uses **32 pt margins**, **shelf bands** (#fff → #f0f0f0 gradient, hard edge) and covers at 39% of width; the detail sheet uses 50% and the opening transition 82%.
6. A story opens as a **card sheet** (50 pt gap, 38 pt radius) that **swipes sideways between days**, with one white 50 pt "Читать" capsule inside a translucent action card.
7. Reader chrome is **three grey text items + a menu button**. The menu is a **pill stack** (46 pt pills, 6 pt gaps, 70% width, dark primary pill), and themes are "Aa" tiles in their real fonts (110 × 92 pt, radius 20).
8. The wow moments to build: the **frosted glass pocket** around today's book (Brink + CLEAR, hold-to-open), the **cover → page zoom**, **fanned cover stacks** for archive months, and **reaction bursts** from a glass emoji capsule (Apple Music).
9. Keep progress calm: a week ring top-right opens a «Полка» sheet with S–S dots and "серия N дней". "Оценить" sits inside the Continue card. A frosted HUD replaces confetti.
10. iOS 27 (out since 14 Sep 2026) keeps Liquid Glass but makes it more frosted and tinted, so ship glass at ≥70% fill with a white rim. Treat SVG refraction as Chromium-only decoration, and use real PD engravings, never AI art or purple glow gradients.
