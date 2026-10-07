# 06: Audit of the current FantPub UI against the redesign brief

Date: 2026-10-07. Auditor: Claude (subagent). Scope: production https://fantpub.vercel.app at commit `a67456e`. Code read: `web/src/app/**/page.tsx`, `web/src/components/*.tsx`, `web/src/components/reader/*.tsx`, `web/src/app/globals.css`, plus CSS modules where I needed numbers.

Brief (owner, verbatim): «Мне не нравится, сделай редизайн, больше стекла, больше скевоморфизма, больше вау, больше похожести на Apple Books. Сделай также более минималистичную эпку… делай круто без нейрослопа.»

**Evidence.** The screenshot folder named in the task (`…/scratchpad/report/shots/`) was empty, so I re-captured production with the repo's own script (`tools/shots/final-shots.mjs`, `ritual-shot.mjs`) plus an extra scroll-capture script:
- `/private/tmp/claude-501/-Users-forkss-FantPub/c45b40ca-9f56-4e1a-a0be-c4513e876524/scratchpad/report/shots/*.jpg`: 01-home, 03-reader, 04-guess, 05-note, 06-calendar, 07-shelf, 08-night, 09-og, 12-desktop, ritual-350/700/1100/1450
- `…/scratchpad/report/shots2/sheet-*.jpg`: full scroll of home (first visit), archive, shelf + settings sheet, end-of-story, about + authors
- Apple Books reference set: `research/mobbin/01,06,10,11,14,31-*_ab_*.jpg`, combined in `…/scratchpad/report/ab-sheet.jpg`

**Current-platform facts (checked live).** iOS 27 shipped on 2026-09-14 ([geeky-gadgets](https://www.geeky-gadgets.com/ios-27-final-details/)). It keeps Liquid Glass and adds a system translucency slider that runs from "ultra clear" to "fully tinted" (Settings → Appearance → Liquid Glass), plus stronger diffusion and depth behind glass ([BGR](https://www.bgr.com/2191219/ios-27-liquid-glass-fix-customization/), [heise](https://heise.de/-11212319)). I found no report of an Apple Books redesign in iOS 27, so the Apple Books reference here is the iOS 26 Liquid Glass UI in the Mobbin captures. Design consequence: many iOS users now run *tinted* glass. Our glass must stay legible at high opacity, and translucency cannot carry meaning.

---

## 0. Verdict in one screen

The product logic is right. The skin and the density are wrong for this brief.

- **The app explains itself instead of showing.** The Home screen has 240 words of UI copy before the user does anything. The story page carries **356 words of chrome around a 1,075-word story**, about 33% overhead. There are 11 blocks after «Конец». Apple Books puts zero words of explanation on Home and 4 words of chrome in the reader ("4 pages left in chapter").
- **The material is paper and cards, not glass and objects.** The only translucent surface is a "vellum" pill (`blur(18px) saturate(1.3)` plus a noise overlay) sitting over flat cream. With nothing behind it to refract, it reads as frosted plastic. Everything else is an opaque raised card: 66 `box-shadow` declarations.
- **The skeuomorphism is in the wrong place.** It lives in *textures* (grain, tiled SVG cloth, kraft, dashed tear-offs, rubber stamps, a window-shadow "gobo") rather than in *objects* (a book with thickness, page edges, gloss, real light). At thumbnail size the tiled cloth covers turn into noise (calendar, archive).
- **The primary CTA is hidden.** At 390×844 the button «Сломать печать» sits at y=803–855 and the floating tab bar at y=774–830 covers it. At 375×667 the button is entirely below the fold. Users only find the book-tap by reading the mono hint «НАЖМИТЕ НА ПЕЧАТЬ».
- **The typography is a 2023 indie/editorial kit,** the most recognisable "AI-slop" signature. It uses 3–5 families per page, uppercase letter-spaced mono kickers (14 uppercase rules), Lora italic bylines, **47 distinct font-size values** in CSS, and **28 font/size combinations on Home alone**. Apple uses one UI family, one serif and about 6 text styles.
- **The best mechanics** (seal → book opens → blind read → guess → reveal → book lands on your shelf) are present but staged as separate cards and hard cuts. The wow has to come from *continuity*: one object travelling from Home into the reader and back onto the shelf.

---

## 1. Measurements (production, 390×844, iPhone-class)

| Page | Scroll height | UI words (story text excluded) | Font family/size combos | Interactive elements above fold | Shadowed cards ≥12px radius |
|---|---|---|---|---|---|
| `/` Today (first visit) | 2194px = 2.6 screens | 240 | **28** | 3 in `<main>`: logo, book, CTA (the CTA sits under the nav) | 2 |
| `/arhiv` | 2258px | 207 | 17 | **21** (search + 9 chips + 3-way toggle + nav) | 0 |
| `/polka` | 1358px | 100 | 14 | 3 | 5 |
| `/o-proekte` | 2544px | 316 | 7 | 1 | 4 |
| `/rasskaz/otkrytoe-okno` | 9649px | **356** | 23 | 1 | 6 |

Codebase-wide: 47 unique `font-size` values, 62 hex colours, 4 font families (Lora, Onest, IBM Plex Mono, Literata) plus Old Standard TT as a reading option, 11 cloth palettes, 10 italic rules.

Hero timing: seal break 0–420ms → book turns front 420–940ms → cover opens 940–1760ms → `router.push` at **1760ms** → the reader appears as a hard swap. The reader's `view-transition-name: story-cover` has no partner on Home, so the book does not travel.

---

## 2. Per-screen inventory

Legend: **KEEP** = product truth or function that stays visible. **MERGE** = combine with another element. **CUT** = remove from the UI (the content may live elsewhere). **MOVE** = into a sheet, menu, toast or another screen.

### 2.0 Global chrome (every page)

| Element | Source | Verdict | Why / target |
|---|---|---|---|
| Masthead: glasses logo 40px + «FantPub» + mono descriptor «РАССКАЗ НА КАЖДЫЙ ДЕНЬ» + weekday on the right | `Masthead.tsx` on `/`, `/arhiv`, `/polka`, `/o-proekte`, `/avtory`, `/avtor` | **CUT** from tabs | Apple tabs open on a large title, not a logo bar. It costs about 90px on every screen. ⚠ The code comment cites 168-ФЗ: the Russian descriptor must accompany the Latin wordmark wherever the wordmark is shown. Keep wordmark+descriptor only on the PWA splash/icon, OG cards, About and the Settings sheet header. |
| Floating bottom nav: 3 text+icon pills, vellum blur, black active capsule, `--fp-nav-h: 64px` | `BottomNav.tsx` | **KEEP** function, restyle | Becomes a Liquid Glass tab bar: icon over a small label, tinted active icon instead of a black slab, collapses on scroll down and expands on scroll up. It must never overlap a primary CTA (see §4.7). |
| Footer: О проекте · Авторы · Права и переводы · ВКонтакте + legal line «…Пабчик живёт за корешками» | `SiteFooter.tsx` on 4 pages | **CUT** from tabs → **MOVE** to the Settings sheet "О проекте" group | For crawlability, keep `/avtory` reachable from Archive (author filter/search) and keep `sitemap.ts`. The legal line goes to About and the colophon. |
| Paper grain overlay (`body::before` feTurbulence, multiply) | `globals.css` | **CUT** | Main cause of the "warm cream paper" look the owner rejected. It also dirties glass. |
| Page enter/exit transitions (`<ViewTransition enter="page-in">`) | `PageTransition.tsx` | **KEEP** mechanism | Re-time it, and add *named* shared elements (§5). |
| Boot script: theme/font/size before paint, blind mask, title masking | `layout.tsx` | **KEEP** | Good engineering. Update `theme-color` values to the new canvas. |

### 2.1 Today `/`

| # | Element | Verdict | Note |
|---|---|---|---|
| 1 | Weekday «СРЕДА» (mono, top right) | **MERGE** → #8 | One eyebrow line: «Среда, 7 октября · № 11». |
| 2 | Spotlight: radial glow in the cloth colour behind the book | **KEEP idea, rescale** | Apple Books' book page tints the *whole* background with the cover's colour (ref `01-home_ab_book_detail_color_bg`). Make the full-bleed canvas the cover colour, with a dark-to-light vertical gradient, instead of a glow on cream. |
| 3 | Gobo: blurred window-frame shadow over the stage | **CUT** | On screenshots it reads as grey smudges or a rendering bug (01-home, 12-desktop). |
| 4 | Book3D, 208px: tiled-motif cloth, spine text, paper title label «№ 11 / Открытое окно / ✦» | **KEEP object, redesign the cover** | The object is the hero. The wallpaper pattern is the problem (§4.5). |
| 5 | Sage ribbon band across the cover | **KEEP (restyle)** | The ribbon is what the seal holds. Thinner, satin, with a specular highlight. |
| 6 | Wax seal, 92px, ring text «FANTPUB · ВЫПУСК № 11 · РАССКАЗ ДНЯ» + glasses | **KEEP** | The single tappable object. Ring text is unreadable at 92px → **CUT** it to glasses + №. |
| 7 | Ledge (shelf line under the book) and hint «НАЖМИТЕ НА ПЕЧАТЬ» | **CUT** both | Replace the ledge with a soft contact shadow. Replace the text with a 2.4s idle glint/pulse on the seal and a first-visit coach mark (#15). |
| 8 | Kicker «ВЫПУСК № 11 · 7 ОКТЯБРЯ» (mono caps) | **MERGE** with #1 | Sentence case, 13–15px UI font, secondary colour. |
| 9 | H1 title (Lora 500) | **KEEP** | SEO/a11y anchor. Restyle it in the new display serif. |
| 10 | Byline «● Автор и год — под печатью» (italic) | **KEEP function, shorten** | A *redacted bar*: a blurred/frosted capsule the width of a name plus «?». This shows the secret instead of saying it. |
| 11 | Tags ЮМОР · 6 МИН · 12+ (three bordered mono chips) | **MERGE** | One metadata line «Юмор · 6 мин · 12+», the Apple "★ 3.5 · Fiction & Literature" pattern. |
| 12 | Pabchik hook card: avatar + «ПАБЧИК» label + 4-line italic hook | **MERGE** | Keep the hook *text* as a 2-line deck under the title. Cut the card, avatar and label. Pabchik's voice belongs after the story (note). |
| 13 | Primary CTA «Сломать печать · 6 мин» (black pill 52px) | **KEEP, fix placement** | Sticky above the tab bar, or in the first viewport under the deck. One tinted glass button. Labels change by state (Сломать печать / Продолжить · ещё 3 мин / Перечитать), as now. |
| 14 | «Другой на сегодня: «Тост», 7 мин» link | **CUT** | The week row (#17) covers it. |
| 15 | IntroCard (first visit): Pabchik 92px + h2 + 41-word paragraph + «Понятно, показывайте» + × | **MOVE** | Becomes a one-line coach mark pointing at the seal: «Сломайте печать. Автора узнаете в конце». The full explanation goes to About. |
| 16 | Tomorrow dashed card «Завтра: смешное, 11 мин · через 04:39:19» | **MERGE** → #17 | The last slot of the week row is a sealed parcel with a live countdown. Same in the archive grid and calendar, so the "tomorrow" copy shows in one place instead of three. |
| 17 | «Полка недели» h2 + «прочитано 0 из 7» + 7 spines + ledge + «Весь архив →» | **MERGE / restyle** | Becomes "Эта неделя", a horizontal row of 7 small front covers (Apple "Continue"/"Want to Read" carousel), read = check, in-progress = progress hairline, last = tomorrow's parcel. Drop the counter and the arrow link (the Archive tab exists). |
| 18 | Rules list (3 numbered bold statements) | **CUT** → About | |
| 19 | Footer | **CUT** | See 2.0. |

Target Today: eyebrow + book (≈55% of the viewport) + title + 1 meta line + 2-line deck + 1 CTA, all in the first 844px, with the week row below. About 35 words instead of 240.

### 2.2 Ritual (tap seal → reader)

| Element | Verdict | Note |
|---|---|---|
| Vibrate 14ms, seal "broken" state, ribbon falls | **KEEP** | `navigator.vibrate` is a no-op on iOS Safari. Do not rely on haptics for meaning. |
| Book turns to front (rest pose 26° Y → 0°) | **KEEP, shorten** | 520ms → ≤350ms, in parallel with the seal, not after it. |
| Cover opens 158°, revealing the title page «FANTPUB · № 11 / title / автор под печатью / ✦ / 7 октября · 6 мин» | **KEEP** | The title page duplicates the reader header → make it *become* the reader header (§5.1). |
| Navigation fires at 1760ms, then a hard swap to a small 3D thumbnail at the top of the reader | **CUT the swap** | Replace it with a shared-element transition. Story text visible by ≤900ms. |
| Pointer-tilt on the book (`--tx/--ty`, ±8°/±12°) | **KEEP** | Add `DeviceOrientation` on Android only. iOS requires a permission prompt, not worth it. |
| Reduced-motion path skips everything | **KEEP** | |

### 2.3 Reader `/rasskaz/[slug]` (above and inside the text)

| Element | Verdict | Note |
|---|---|---|
| Top progress hairline (sage) | **MERGE** into the bar | Apple shows progress as text ("4 pages left"), not a bar. |
| Floating vellum bar: ‹ back, title after 260px, «ЕЩЁ 6 МИН», black «Aa» circle | **KEEP functions, restyle** | Apple Books reader (ref 10/11): one glass ✕ circle top-right, grey "N pages left" top-centre, page count and one glass menu button at the bottom. For us: glass ‹ top-left, grey «ещё 6 мин» top-centre, glass «Aa» bottom-right. All hide on scroll down (already). |
| Header: compact cover thumb (3D) | **KEEP only as the transition target** | It is where the book lands. Otherwise **CUT**. |
| Kicker «№ 11 · 7 ОКТЯБРЯ · ЮМОР» + meta «6 МИН · 1 075 СЛОВ · 12+» | **MERGE** into 1 line, **CUT** the word count | |
| Sealed byline «●●●●●● ●●●●● автор и год под печатью — узнаете в конце» (2 lines) | **KEEP, shorten** | Same redacted capsule as Today. 0 words. |
| Pabchik hook card (second time; already seen on Today) | **MERGE** | Plain italic deck under the title. Keep it for SEO landings from VK/search. Remove avatar/card. |
| Story text: Literata 19px / 1.58, hyphenation, drop cap (sage in night theme), epigraphs, scene breaks | **KEEP** | Best part of the product. Drop cap in ink colour, not sage. |
| Quote share: select 12–260 chars → popover → 1080×1350 card | **KEEP** | Restyle the popover as a glass callout. |
| Resume toast «Продолжить с места?» + sage pill | **MERGE** | Auto-resume silently (Apple behaviour) plus a 3s glass toast «Продолжено · В начало». |
| «Конец» with rules + rotated rubber stamp «ПРОЧИТАНО · № 11» | **KEEP the moment** | The stamp is good *object* skeuomorphism. It triggers the "book flies to shelf" beat (§5.4). |

### 2.4 End of story (`EndOfStory.tsx`, `Colophon.tsx`, page tail): 11 blocks now

| # | Element | Verdict | Note |
|---|---|---|---|
| 1 | Guess card: kicker «ПЕЧАТЬ ЕЩЁ ЦЕЛА», h2 «Кто написал этот рассказ?», 3 option buttons (beige boxes 84px), «Просто покажите» | **KEEP (core)**, restage | A full-width moment, not a card in a stack (§5.2). 3 glass options and one quiet text button «Не знаю, покажите». |
| 2 | Reveal card: broken-seal icon, «ВЫ УГАДАЛИ», «Автор — Всеволод Гаршин, 1882», years | **KEEP (payoff)** | The author's name gets *stamped onto the cover label*: the same object again. Share button lives here. |
| 3 | Reactions: h2 «Как вам финал?» + 2×2 boxes with glyph circles + status sentence | **MERGE** | One row of 4 glass glyph buttons (tapback style) with labels on press. **CUT** «Реакция сохранена на вашей полке. Общий счётчик читателей включим совсем скоро.»: it leaks dev status into the product. Show % only once ≥ threshold. |
| 4 | Pabchik note: dashed tear-off top, «ЗАПИСКА ПАБЧИКА · № 11», ~70 words, «Ещё 3 факта ↓», signature avatar + «Пабчик ДОМОВОЙ FANTPUB» | **KEEP note**, **MOVE facts** to a sheet, **MERGE** signature | The note is product truth. One 28px avatar in the note header, no footer signature, no dashed edge. |
| 5 | Share: h3 «Поделиться без спойлеров», 4 pills (Загадка для друга / Ссылка / ВКонтакте / Карточка) + explanation | **MERGE** into one «Поделиться» button | Opens the native share sheet with the `?z=1` riddle URL. Desktop gets a glass popover with the 4 options. Cut the explanation sentence. |
| 6 | «На сегодня всё» + sleeping Pabchik 96px + countdown text | **MERGE** with #7 | One "Next" block: tomorrow's parcel with countdown (today only) + one suggestion. |
| 7 | «ЕЩЁ ОДИН НА 3 МИН / Перед законом →» black card | **KEEP 1** | Apple "Up Next" pattern. Show it as a cover, not a black slab. |
| 8 | «На вашей полке 1 книга →» | **CUT** | Replaced by the book-to-shelf animation + tab badge. |
| 9 | InstallHint (after 3 reads) | **MOVE** | One-time glass toast/sheet, triggered on the 3rd «Конец», not inline. |
| 10 | Colophon «ВЫХОДНЫЕ ДАННЫЕ» (5-row dl: выпуск, автор, текст/перевод, источник, права) | **MOVE** | «Об издании» disclosure row → sheet. Keep it in the DOM for SEO and rights proof. |
| 11 | «Похожее по настроению» (3 list cards) + prev/next pager (№ 7 ← / № 9 →) | **MERGE** with #7 / **CUT** pager | One horizontal row of 3 covers. The pager is redundant with the archive and the sitemap. |

Target: 4 beats after «Конец»: **Guess → Reveal (+share) → Reaction row → Note**, then one "Next" row. About 120 UI words instead of 356.

### 2.5 Reading settings sheet (`SettingsSheet.tsx`, native `<dialog>`)

| Element | Verdict | Note |
|---|---|---|
| Grip + h2 «Настройки чтения» | **KEEP grip, CUT h2** | Apple's sheet title is a small "Themes & Settings". |
| Theme: 4 swatches Авто/Бумага/Сумерки/Ночь | **MERGE** with Font | Apple Books (ref 14) uses 6 *theme tiles*, each an «Aa» rendered in its font on its paper (Original, Quiet, Paper, Bold, Calm, Focus). For us: 4–6 tiles = font × paper bundles, e.g. «Книга» (Literata/light), «Классика» (Old Standard/warm), «Чистый» (Onest/white), «Ночь» (Literata/graphite). «Авто» becomes a small toggle "Как в системе". |
| Font: 3 rows with descriptions («Литерата — шрифт Google Play Книг», «как печатали при Чехове и Грине», «чисто, как в мессенджере») | **MERGE** into tiles, **CUT** descriptions | Naming a competitor in our own UI is odd. |
| Size: A − 5 dots + A | **KEEP** | Apple-style segmented "A | A" with live preview behind the sheet. |
| Toggle «Воздух между строк» + subtitle | **MOVE** → "Настроить" sub-panel | Apple's "Customise". |
| Toggle «Слепое чтение» + subtitle | **MOVE** → app Settings (Полка ⚙︎) | A product rule, not typography. |
| «Готово» black 52px button | **CUT** | Swipe down / tap outside / glass ✕ (`closedby="any"` already works). |

### 2.6 Archive `/arhiv`

| Element | Verdict | Note |
|---|---|---|
| Masthead | **CUT** | |
| H1 «Архив» + lead «11 выпусков, и все открыты. Целая печать на корешке значит…» | **KEEP h1 as Large Title (34/41 bold)**, **CUT** lead | |
| Search field «Название, автор, настроение» | **KEEP**, **MOVE** under the large title as a glass field revealed on pull-down | No separate search tab until ≥60 issues (then the iOS 26 detached-search circle in the tab bar). |
| Genre chip row (Все жанры + N) + length row (Любая длина / до 5 / 5–10 / 10+ / Непрочитанные): 9+ chips, 2 rows, the second overflows | **MOVE** into one glass «Фильтр» menu button (top-right) | Apple Library uses a pull-down menu. Show an active-filter token under the title only when a filter is set. |
| Count «11 ВЫПУСКОВ · ПРОЧИТАНО 7» | **CUT** | It moves to the Shelf stats line. |
| 3-way segmented Обложки / Календарь / Список | **MERGE** to 2: **Сетка / Календарь** | «Список» goes into the filter menu as "Вид: список". |
| Tomorrow card (kraft parcel + «ВЫПУСК № 12 · ЗАПЕЧАТАН» + «Завтра: смешное, 11 мин» + countdown) | **MERGE** | First cell of the grid = sealed parcel with countdown. |
| Month headers (Lora 30px) | **KEEP** | Title-2 style, sentence case. |
| 3-col cover grid: tiled cloth + paper label with № and title, bookmark ribbon (read) / sage dot (unread), caption title + «автор · N мин» | **KEEP grid**, redesign covers + status | Read = small check. In progress = "34%" under the cover (Apple shows "99%"). New/unread = tiny accent dot. Today's caption keeps «автор под печатью». |
| Empty state (Pabchik searching + sentence + «Сбросить фильтры») | **KEEP, shorten** | «Ничего не нашлось» + button. |
| Calendar: month title, Mon–Sun header, past days = mini covers with day chip, today = sage ring, future days = **20 identical kraft parcels** with string and sage dot, read bookmarks | **KEEP (advent = product truth)**, **simplify future** | 20 parcels are visual noise. Future days become frosted tiles (a blurred hint of the cover colour, the Lapse "develops in blur" idea, ref 24). Only *tomorrow* is a parcel with a timer. Day numbers go in a plain corner, not chips. |
| Footer | **CUT** | |

### 2.7 Shelf `/polka`

| Element | Verdict | Note |
|---|---|---|
| Masthead | **CUT** | |
| H1 «Ваша полка» + lead «Всё хранится в этом браузере. Без регистрации, ничего не сгорает.» | **KEEP** large title «Полка», **MOVE** lead into Settings → "Данные" footnote | |
| 3 stat cards (7 рассказов / 50 минут / 6 за неделю) | **MERGE** | One subtitle line «7 рассказов · 50 мин · угадано 2 из 3». Optional: Apple Books "Reading Goals" ring for the week (ref 34), the only data-viz allowed. |
| Wooden ledge with spines (8 per row), bookmark, № | **KEEP, upgrade (hero of the tab)** | The skeuomorphism the owner asks for: a real shelf with depth, back panel, light from above, spines with cloth texture, gilt titles, varied heights/thickness by minutes. Tap a spine → it slides out and turns to its cover (§5.4). |
| «Ваш читательский почерк» card (угадали N из M, reaction counts) | **MERGE** guesses into the stat line, **CUT** reaction counts | |
| InstallHint | **MOVE** | See 2.4 #9. |
| «Настройки» card (summary sentence + «Изменить») | **MOVE** | Glass ⚙︎ circle top-right of Полка → Settings sheet. |
| «Ключ от полки» card (explanation + «Скопировать ключ») | **MOVE** | Settings → «Перенести на другое устройство». |
| Import alert (when `#key=` is in the URL) | **KEEP** | System-style centered alert. |
| «Очистить полку» | **MOVE** | Settings, last row, destructive red. |
| Empty state (sleeping Pabchik 150px + sentence + «К рассказу дня») | **KEEP, shorten** | An empty shelf *is* the illustration: an empty lit shelf + one line. Pabchik 64px peeking from the side. |
| Footer | **CUT** | |

### 2.8 Secondary pages and assets

| Page / asset | Verdict | Note |
|---|---|---|
| `/o-proekte`: Pabchik hero, h1 «Дом историй, открытый для всех», lead, 4 roman-numeral cards (I Как это устроено, II Кто такой Пабчик, III Права и переводы, IV Немного истории), 2 CTAs, footer | **KEEP route (SEO/legal)**; **MOVE** in-app presentation to a sheet from Settings | Use App Router *intercepting routes* (`@sheet/(.)o-proekte`) so an in-app tap opens a sheet while a direct hit renders the full page. Plain grouped text, no cards. Cut «Немного истории» to 1 line. |
| `/avtory` (name + years + «1 РАССКАЗ» mono) | **KEEP route**; reach it from the Archive filter "Авторы" | Apple author list style: name + count, chevron. |
| `/avtor/[slug]` (kicker, name, bio, story cards) | **KEEP** | Apple author page = cover grid (ref 31). ⚠ Watch blind reading: today's sealed story must not appear here unmasked. |
| 404 / error | **KEEP** | Pabchik + 1 line + 1 button. |
| OG image 1200×630 (`opengraph-image.tsx`): cloth book + seal, «FANTPUB · ВЫПУСК № 11», title, «Рассказ на 6 мин. Угадаете автора?», logo + descriptor | **KEEP layout and riddle copy** | Re-render with the new cover and a cover-tinted background. The riddle line is the best copy in the product. |
| Share card `/rasskaz/[slug]/karta` and quote card 1080×1350 | **KEEP** | Same restyle. |
| Pabchik illustrations (12 poses, webp) | **KEEP 3–4 poses** (note avatar, empty states, 404, coach mark) | He currently appears 4× on a story page (hook avatar, note, signature, sleeping). The sticker look of generated poses is an "AI mascot" risk. Smaller and rarer is better. |
| PWA manifest / `themeColor #f6f2e7` | **KEEP**, update colours | |

---

## 3. Information architecture

### 3.1 Current

```
Tab pill (floating, text+icon): Сегодня (/) · Архив (/arhiv, also /avtor/*) · Полка (/polka)   [hidden in reader]
Footer on 4 pages: О проекте · Авторы · Права и переводы (#prava) · ВКонтакте
/ ............ book + seal, hook card, CTA, alt link, intro card, tomorrow, week spines, rules, footer
/rasskaz/x ... bar(‹, Aa) · header(thumb, kicker, h1, sealed byline, meta, hook card) · text ·
               Конец · guess · reveal · reactions · note+facts · share×4 · tomorrow · next · shelf link ·
               install hint · colophon · similar×3 · pager
/arhiv ....... search · genre chips · length chips · count · Обложки|Календарь|Список · tomorrow · grid/calendar/list
/polka ....... stats×3 · spines · почерк · install hint · settings card(→sheet) · key card · reset
Settings sheet: reachable from reader «Aa» AND shelf card (two entries, one sheet mixing typography + product rule)
"Tomorrow" shown in 3 places · Pabchik on 4 surfaces per story · share in 4 buttons
```

### 3.2 Proposed (minimal, Apple Books-like): 3 tabs, no separate search tab yet

```
Liquid Glass tab bar (3 icons + 10–11px labels, collapses on scroll):  Сегодня · Архив · Полка
                                                                    (+ detached 🔍 circle when catalogue ≥ 60 issues)

СЕГОДНЯ  (no large title; the book IS the title)
  eyebrow «Среда, 7 октября · № 11»
  Book (cover-tinted full-bleed canvas) + seal
  H1 · «Юмор · 6 мин · 12+» · 2-line deck · [Сломать печать]
  «Эта неделя» row: 6 past covers + tomorrow's sealed parcel with countdown

READER (pushed full-screen, tab bar hidden)
  glass ‹ · «ещё 6 мин» · glass Aa (→ Appearance sheet: theme tiles + size; «Настроить» → leading)
  text … Конец(stamp) → GUESS moment → REVEAL (+ Поделиться) → reaction row → Pabchik note (Факты → sheet)
  → «Дальше»: tomorrow parcel (today only) + 1 next cover   ·   «Об издании» row → colophon sheet

АРХИВ   Large title · pull-down glass search · ⚙︎ Фильтр menu (жанр, длина, непрочитанные, авторы, вид: список)
        segmented Сетка | Календарь · first cell = tomorrow parcel · month sections

ПОЛКА   Large title · «7 рассказов · 50 мин · угадано 2 из 3» · the real shelf · glass ⚙︎ (top-right)
        → SETTINGS sheet: Чтение (same tiles) · Слепое чтение · Перенести полку (key) · На экран «Домой» ·
          О проекте · Авторы · Права и переводы · ВКонтакте · Очистить полку (red)
```

**Screens that become sheets:** reading appearance, app settings (incl. key, reset, install), facts, colophon «Об издании», share (desktop only; mobile = native sheet), About/Rights/Authors (intercepting routes keep the SEO pages), first-visit coach mark (popover), install prompt (one-time toast), import shelf (alert).

**Function coverage check:** daily issue ✓ (Today) · countdown ✓ (week row, archive first cell, end of story) · blind reading ✓ (redacted byline, guess, reveal; toggle in Settings) · archive list ✓ (filter menu "вид: список") + calendar ✓ · shelf ✓ + key transfer ✓ + reset ✓ · reader settings ✓ (3 papers, 3 fonts, 5 sizes, leading) · reactions ✓ · Pabchik note + facts ✓ · sharing ✓ (riddle link default, plain link, VK, card, quote) · colophon/rights ✓ · author pages ✓ · PWA install ✓. Nothing is lost. The changes: 3 "tomorrow" surfaces become 1 component, 2 settings entries become 2 sheets with a clear split (typography in the reader, product rules on the shelf), 11 end blocks become 5.

**Why not 2 tabs (fold Полка into Архив as a segment)?** The shelf is the strongest skeuomorphic object and the retention loop ("my books"). Apple keeps Library separate from Home/Store for the same reason. Three tabs is also the floor for a glass tab bar to look intentional.

---

## 4. Why it does not feel like Apple Books (specific problems)

### 4.1 Density
- Home runs 2.6 screens. Apple Books Home is sections of carousels with zero explanatory text.
- The story page has 11 post-story blocks. Apple ends a book with one "Finished" card + rating + "Up Next".
- Archive has 21 controls above the fold (two chip rows), where Apple Library has a title, a search field and one menu button.

### 4.2 Copy length and voice
- Explanations are everywhere: «Всё хранится в этом браузере. Без регистрации, ничего не сгорает.», «Целая печать на корешке значит, что рассказ вас ещё ждёт.», «В загадке автор спрятан — друг узнает его только в конце.», the font notes, the 41-word intro.
- Dev status leaks: «Общий счётчик читателей включим совсем скоро.»
- Too many in-jokes: «Пабчик живёт за корешками», «Пабчик снимает шляпу (которой у него нет)». One per screen at most, and only in the note.
- Rule: labels 1–3 words, at most one sentence of secondary text per screen, and every sentence must survive "would Apple write this?". Run the `sasha` skill on all Russian UI copy in the build phase.

### 4.3 Too many cards
- 66 `box-shadow` declarations. Every block is an opaque "paper-raised" card with radius 16–28px and a warm drop shadow: hook card, intro card, tomorrow card, rules card, guess card, reactions card, note card, stat cards ×3, settings card, key card.
- Apple groups content as plain sections on the canvas (large title → section header → content), or as *inset grouped lists* in Settings. Cards are rare and borderless.
- Target ≤ 1 card per screen. On the end-of-story screen only the note keeps a surface.

### 4.4 Typography
- **Families:** Lora (display), Onest (UI), IBM Plex Mono (kickers/meta), Literata (reading), Old Standard (option). Pages use 3–5 at once.
- **Mono-caps kickers** (`.mono`: uppercase, 0.04–0.1em tracking) on almost every label: «ВЫПУСК № 11», «ПАБЧИК», «ПЕЧАТЬ ЕЩЁ ЦЕЛА», «ВЫХОДНЫЕ ДАННЫЕ», «ЕЩЁ 6 МИН». This "editorial indie" signature is exactly what generative-UI output defaults to. Apple uses sentence-case footnote text in secondary grey.
- **Sizes:** 47 distinct sizes in CSS, 28 combinations on Home. Target 6–7 styles on Apple's Dynamic Type ramp: Large Title 34/41 bold, Title-2 22/28, Headline 17/22 semibold, Body 17/22, Subheadline 15/20, Footnote 13/18, Caption 11–12.
- **Recommendation:** UI = `system-ui` stack (SF Pro on iOS/macOS, Roboto on Android; both Cyrillic-complete, zero bytes). One display/reading serif with good Cyrillic for titles and text. **CUT** the mono family. **CUT** Lora italic bylines. Covered in detail by the fonts research.

### 4.5 Colour and material
- 62 hex colours. Cream `#f6f2e7` + sage `#cbdd9b` + wax `#b23a22` + gilt `#a88848` + kraft + 11 cloth palettes, all warm and all at similar mid values, so nothing pops.
- Apple Books uses a neutral system canvas (white / near-black) and lets *the cover* supply colour: the book page background is sampled from the cover (ref 01).
- **Proposal:** a neutral canvas (light `#F5F5F7`/white, dark `#000`/`#1C1C1E`), one accent (brand sage, used only for the seal, active tab and progress), cover-derived ambient colour on Today and in the reader header.
- **Glass:** the current "vellum" is a frosted blur over flat cream. It has no specular rim, no edge refraction and nothing colourful behind it, so it looks like tracing paper (which was the stated intent: «tracing paper, not glass»). Real Liquid Glass reads as glass because content scrolls *under* it and the rim catches light.
- Glass belongs only on the *control layer*: tab bar, reader buttons, sheets, menus, toasts. Never on content cards (Apple HIG: Liquid Glass is for the navigation layer floating above content). Given iOS 27's tint slider, default to fairly tinted glass (≈70–80% fill) so legibility never depends on the background.
- **Covers:** every cover is the same template (tiled SVG motif "wallpaper" + centred paper label). At 48–100px (calendar, week row, archive) the motif turns into noise and all books look alike. Apple Books covers are *art*, and the skeuomorphism lives in the 3D object. Fix: one large motif or illustration per cover, a big title in the display serif, the № small. The 3D book adds thickness (cloth-wrapped board edge), a page block with fine lines, a soft gloss sweep and a contact shadow.

### 4.6 Navigation
- Text-heavy pill nav («Сегодня / Архив / Полка» at 14px/550) with a black active capsule reads as a web nav, not iOS.
- It does not collapse on scroll, so it permanently covers the bottom 70px, including the Home CTA (measured).
- Apple: a glass capsule, icons at about 24px with small labels, the active item shown by tint plus a glass "lens" highlight, minimising on scroll down.
- The masthead repeats on every tab while Apple uses large titles. «Весь архив →» and «На вашей полке N книг →» duplicate the tab bar.

### 4.7 Layout bugs that block "minimal"
- **Hidden CTA (P0).** Measured: CTA 803–855 vs nav 774–830 at 390×844. CTA at 802 vs viewport 667 at 375×667. Fix: book height ≤ 46vh on phones, plus a sticky CTA container:
  ```css
  .cta { position: sticky; bottom: calc(var(--tabbar-h) + 12px + env(safe-area-inset-bottom)); }
  ```
- **Desktop.** The centre nav pill overlaps the tomorrow card (12-desktop). The gobo smears across both columns. The right column floats in a 1080px container with about 300px of empty margin.
- **Settings sheet on a 390px phone** fills ~100% of the height (4 theme tiles + 3 font rows + size + 2 toggles + button). Apple's appearance sheet is about 55% (detent `.medium`).

### 4.8 Motion
- The ritual blocks input for 1760ms before navigation, then hard-cuts. Apple's transitions are interruptible springs of 350–500ms with continuity of the tapped object.
- Repeated decorative idle effects (glow + gobo + tilt) compete. One idle cue (a glint on the seal every few seconds) is enough.

### 4.9 What is already good (keep and build on)
- No-flash boot script, `<dialog>` sheets with `closedby="any"`, reduced-motion paths, riddle URL `?z=1` with title masking, ISR + JSON-LD, the reading typography (Literata 19/1.58, hyphenation, epigraphs), the advent calendar idea and the spine shelf.
- `react@19.2.8`'s `<ViewTransition>` is already wired in `PageTransition.tsx`, so shared-element morphs need no new dependency.

---

## 5. The "wow": which mechanics deserve it, and how Apple would stage them

Rank by return: **(1) book → reader continuity**, **(2) blind reveal**, **(3) finished book lands on the shelf**, **(4) seal break** (shorter), **(5) calendar**. Apple's staging principles: one object, continuous; springs; interruptible; ≤500ms per beat; light and glass reacting to motion; haptic on commit (Android only for web); silent fallback under reduced motion.

### 5.1 Book opening → reader (the signature moment)
- **Today:** the book rests at 18–22° Y rotation on a cover-tinted canvas, with soft top-left light and a contact shadow. Tilt follows the pointer (and device orientation on Android).
- **Tap seal or CTA** (t=0): the seal cracks (scale 1→1.06, then 2–3 shards drop with gravity, 280ms) while the book squares up to 0° (spring, ~350ms). Under the first-visit coach mark the user should feel 1 beat, not 3.
- **t≈250ms:** the cover swings open (rotateY 0→-160°, 450ms spring, slight overshoot). The "camera" dollies in so that the title page grows to fill the viewport. The tab bar slides down and the glass reader controls fade in.
- **t≈600–900ms:** the title page *is* the reader header. Same `ViewTransition name={`issue-${slug}`}` on both sides: Home's `TitlePage` and the reader's header. The first paragraph fades up 8px. Navigation (`router.push`) should fire at **≈250ms** inside `startTransition`, not at 1760ms, so the network and render overlap with the animation.
- **Back from the reader:** the reverse morph closes the book into its place on Today (or into the shelf if finished).
- **Repeat visits** skip the seal and go straight to the open (≤450ms). Reduced motion: crossfade 200ms.

### 5.2 Blind reveal (the payoff)
- **Guess:** after «Конец» scrolls past, the page dims slightly and the *cover* reappears at 120px with its blank, frosted author label. The 3 options sit under it as glass buttons. One quiet text button: «Не знаю».
- **Answer:** the tapped option fills with tint (right) or shakes 2×6px (wrong). In both cases, 300ms later, the frosted label on the cover *de-blurs* (`filter: blur(10px)→0`, 600ms ease-out) and the author's name appears in gilt letterforms with a single specular sweep across the label (a gradient mask moving left→right, 700ms), like hot-foil stamping. The years fade in under it.
- **Then:** «Вы угадали» / «Не угадали — бывает» as a 13px caption. The reaction row and the note slide up as a group, 60ms stagger.
- **Do the same in the share card:** the riddle link lands on a cover with a frosted label. That keeps the object recognisable across Today, the guess, OG and the shelf.

### 5.3 Pabchik note
- **No wow needed.** It's content. One surface (the only card on the screen), 28px avatar, ~70 words, «Факты» → sheet. Apple would present it like "From the Publisher".

### 5.4 Finished book → shelf (retention wow)
- At «Конец» the rubber stamp «Прочитано · № 11» thumps (scale 1.4→1, 180ms, rotate -4°, Android vibrate 10ms).
- After the reveal, a tiny spine version of the book arcs into the «Полка» tab icon (≈500ms bezier path), and the icon bumps with a +1 badge. This is Apple's "add to Library" fly-to-tab pattern.
- **On Полка:** the newest spine slides in from the right and settles with a small wobble. Tapping a spine pulls it out 20px, then rotates it 90° to show the front cover (450ms), then opens it (same morph as 5.1).

### 5.5 Seal (keep, but make it smaller in time, richer in material)
- A real wax material: subsurface-ish gradient, pressed glasses emblem with inner shadow, irregular edge, a moving specular highlight tied to tilt.
- Drop the ring text. One idle glint every ~4s while unbroken.
- On break: a crack line + 2–3 shards, not a long sequence.
- Do not keep a blocking 420ms "seal first, book later" order. Run the beats in parallel.

### 5.6 Calendar (quiet wow)
- Past days are mini covers. Future days are frosted tiles (blurred cover colour, a sealed-glass feel) with no string or parcel. Tomorrow is the single kraft parcel with a live timer.
- **At 00:00 MSK while the app is open** (rare, delightful): tomorrow's tile un-frosts in place (blur 12→0, 800ms) and the Today tab gets a dot.

### 5.7 Engineering notes for staging
- Use React `<ViewTransition name>` (already used) for 5.1/5.4 shared elements. Same-document navigations in the App Router are fine.
- Keep 3D in CSS (`perspective` + `preserve-3d`), as now. No WebGL is needed for a book.
- Glass with refraction via SVG `feDisplacementMap` in `backdrop-filter: url()` is **Chromium-only**. Safari ignores `url()` in `backdrop-filter`. Plan: blur + saturate + inset specular rim (`inset 0 1px 0 rgb(255 255 255/.5)`, `inset 0 0 0 .5px rgb(255 255 255/.25)`) everywhere, and displacement as a progressive enhancement on Android Chrome only. Cap the number of simultaneous `backdrop-filter` layers at 2–3 for mid-range Android.
- `navigator.vibrate` does nothing on iOS. Never make haptics carry meaning.

---

## Appendix: the "AI-slop" tells currently present (avoid in the redesign)
1. Uppercase letter-spaced mono kickers above every heading.
2. Cream background + film grain + serif italics.
3. Every block in a rounded card with a soft warm shadow.
4. Explanatory microcopy under every control.
5. Repeating SVG pattern used as "texture" instead of one strong image.
6. Mascot sticker inserted into many surfaces.
7. Roman numerals as section markers (About).
8. Dashed borders for "special" items (tomorrow card, note tear-off).
9. Three-stat card row.
10. Emoji-like glyph circles in reaction buttons.

---

### 10-line summary (most actionable)
1. P0 bug: the Home CTA «Сломать печать» is under the tab bar at 390×844 (CTA y=803–855, nav y=774–830) and below the fold at 375×667. Make it sticky above the tab bar and cap the book at ≈46vh.
2. Cut chrome: no masthead on tabs (wordmark + 168-ФЗ descriptor only on splash/OG/About/Settings), no footer, no grain, no gobo. Large titles instead.
3. Today: 240 → ~35 UI words: eyebrow, book, H1, one meta line, 2-line deck, one CTA, then one "Эта неделя" cover row whose last slot is tomorrow's sealed parcel with countdown. That replaces 3 "tomorrow" surfaces.
4. End of story: 11 blocks → 5 (Guess → Reveal + Поделиться → 4-glyph reaction row → Pabchik note → one "Дальше" row). Colophon and facts go to sheets. Delete the dev-status copy about the reader counter.
5. IA: 3 glass tabs (Сегодня · Архив · Полка), no search tab until ≥60 issues. Archive = large title + pull-down search + one Фильтр menu + Сетка|Календарь. Shelf ⚙︎ → one Settings sheet (blind toggle, key, install, about, reset). About/Authors/Rights become intercepting-route sheets that keep their SEO pages.
6. Reader settings: copy Apple's 4–6 "Aa" theme tiles (font × paper), size A|A, «Настроить» for leading, ~55% sheet, no «Готово», no descriptions mentioning Google Play Книги.
7. Typography: drop IBM Plex Mono and the uppercase kickers, drop Lora italics. `system-ui` for UI plus one Cyrillic serif for titles/text, 6–7 styles on the Apple ramp (34/22/17/15/13/11) instead of 47 sizes.
8. Colour/material: a neutral canvas plus one sage accent, with colour coming from the cover (cover-tinted Today and reader header, as on the Apple Books book page). Glass only on controls (tab bar, reader buttons, sheets, menus), tinted ~70–80% because iOS 27 users can set "fully tinted".
9. Skeuomorphism goes into objects, not textures: covers become one strong motif per book (not tiled wallpaper), and the 3D book gains board edge, page block, gloss sweep and contact shadow. The shelf becomes a real lit shelf with spines of varying thickness.
10. Wow = continuity through `<ViewTransition name>` (already in React 19.2 here): seal crack plus cover swing (≤900ms, push at ~250ms, not 1760ms) morphs into the reader header; the guess de-blurs a frosted author label on the cover with a foil sweep; the finished book flies into the Полка tab and slides onto the shelf.
