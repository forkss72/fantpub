# 03 · Trends, autumn 2026: what is current, what is already slop

Research date: 2026-10-07. Sources were checked live: web search, Awwwards, Apple Newsroom/HIG/WebKit, Mobbin MCP, MDN browser-compat-data 8.1.4 (2026-10-01). Feature support numbers come from BCD, not from memory.
Scope: the visual and interaction trends that matter for a redesign of FantPub as an "Apple Books for one story a day" PWA (Android Chrome + iOS Safari, Russian-language).
Companion files: `03_trends_book.html` + `03_trends_book.png` are a 60-line CSS-only prototype of the "book object + tinted glass tab bar", rendered in Chromium at 393px.

---

## 0. Ground truth (October 2026)

| Fact | Detail | Source |
|---|---|---|
| Current iOS | **iOS 27**, stable since 2026-09-14. apple.com/ios says Liquid Glass now has "more uniform refraction and improved contrast", plus a system **slider from "ultraclear" to "fully tinted"**. The defaults are less transparent than in iOS 26, with darker outlines around glass. | https://www.apple.com/ios/ · https://en.wikipedia.org/wiki/Liquid_Glass |
| Apple Books right now | iOS 27.2 (beta, shipping in Oct) rearranges the reader. **X moves to the top-left**, **bookmark becomes a standalone button at the top-right**, the **"…" menu becomes a standard Liquid Glass menu at the bottom-right**, **Back moves to the bottom-left and gets larger**, and a **progress bar** is added. | https://9to5mac.com/2026/10/06/ios-27-2-gives-apple-books-new-design-updates-as-iphone-duo-nears/ |
| Apple Books anatomy (iOS 26/27, Mobbin) | Large New York serif titles ("Home", "Library"). The "Continue" card is tinted with the cover's colour. Covers are drawn as **objects**: a hinge groove about 6–8% in from the left edge, 2–3pt corner radius, and a soft drop shadow. The floating glass **capsule tab bar is ≈62pt tall**, inset ≈20pt from the sides and bottom, and the selected tab sits in an inner pill. **Search is a separate ≈62pt glass circle.** The tab bar collapses to two buttons on scroll. The book page opens as a **sheet whose background is the cover's dominant colour**, with round glass buttons. Themes & Settings is an inset glass card (Original / Quiet / Paper / Bold / Calm / Focus), and the slider thumb turns into a glass lens while you drag it. | Mobbin: [home](https://mobbin.com/screens/7df7f1cb-6b2e-4a49-afa4-b0cca15762e6), [continue card](https://mobbin.com/screens/d0fe94af-934c-4966-8935-ca0bcbbdc34b), [book sheet](https://mobbin.com/screens/3a67d33c-80dc-4a37-ba46-527b56984786), [reader menu](https://mobbin.com/screens/deb26c2b-9819-41c6-8d6a-bb53b14ed2c4), [settings](https://mobbin.com/screens/fea5dd1a-687e-4474-9647-9aac99c10b15) |
| Apple's own rule for glass | HIG quotes: "Liquid Glass forms a distinct functional layer for controls and navigation elements", "Don't use Liquid Glass in the content layer", and "Use Liquid Glass effects sparingly". Use the clear variant only over visually rich backgrounds, and over bright content add a **dark dimming layer at 35% opacity**. | https://developer.apple.com/design/human-interface-guidelines/materials |
| Usability backlash | NN/g (Oct 2025), "Liquid Glass Is Cracked, and Usability Suffers in iOS 26". iOS 27 is Apple's correction. | https://www.nngroup.com/articles/liquid-glass/ |
| Apple Design Awards 2026 (2 Jun) | **Delight & Fun went to grug**, a one-wisdom-per-sunrise app with no login, no tracking, a widget and themes. That is FantPub's mechanic. **Interaction went to Moonlitt**, with "best-in-class Liquid Glass integration". Visuals finalists include **(Not Boring) Camera**, a fully 3D skeuomorphic camera with a knurled dial, haptics and sound. The Innovation game winner, Blue Prince, was praised for "hand-scribbled notes". | https://www.apple.com/newsroom/2026/06/apple-reveals-winners-of-the-2026-apple-design-awards/ |
| Awwwards | SOTY 2025: Lando Norris (OFF+BRAND). SOTM 2026: Oryzo AI by Lusion (Apr), "turns an ordinary cork coaster into an immersive experience", i.e. material as hero. **Aardvark Book Club** was SOTD on 2026-08-30: scroll-driven 3D book reveal, #FFFFFF + #FAED8F, GSAP/Barba/Webflow. Latest SOTDs (Oct 1–7) are mostly WebGL product/illustration stories, e.g. Santioni Spirits by Active Theory, a comic-illustrated world. One blog counts immersive 3D at 61% of Q1-2026 SOTDs (unverified). | https://www.awwwards.com/annual-awards/winners · https://www.awwwards.com/sites/aardvark-book-club · https://www.awwwards.com/sites/oryzo-ai |
| Godly | godly.website now **301-redirects to recent.design** (seen today). Its top items are tactile micro-interactions: "Effort Slider", "Brain Effort Dial", "Vibe Selector". | http://recent.design |
| Figma Config 2026 (24 Jun) | Figma Motion (timeline, springs, CSS export), **Shader fills & effects**, Code Layers. Paper Shaders became Apache-2.0 open source (week of 6 Jul 2026, 30+ effects). | https://www.figma.com/blog/config-2026-recap/ · https://shaders.paper.design/ |
| Audience reality | Russia mobile OS share (Statcounter): Android 58.5% in May 2026, 66.0% in June 2026. **The majority sees Chrome, not Safari.** | https://gs.statcounter.com/os-market-share/mobile/russian-federation |
| New hardware | iPhone Duo is a book-style foldable (7.6" inner screen) announced 2026-09-09, shipping 2026-10-23. Safari iOS 27 ships `@media (device-posture)`. | https://www.opb.org/article/2026/09/09/apple-s-new-ceo-unveils-a-foldable-iphone/ |

### Web platform support that decides what is buildable (MDN BCD 8.1.4)

| Feature | Chrome Android | Safari iOS | Firefox | Use |
|---|---|---|---|---|
| `backdrop-filter` (blur/saturate) | 76 | 18 (unprefixed), prefixed earlier | 103 | glass base layer |
| SVG `url()` inside `backdrop-filter` (true refraction) | **yes** | **no** (open WebKit bug) | parses, renders nothing | Chromium-only enhancement |
| `prefers-reduced-transparency` | 118 | **no** | behind flag | solid fallback has to be the default, not the exception |
| View Transitions (same-document) | 111 | 18 | 144 | cover → reader morph |
| `view-transition-class`, cross-doc `@view-transition` | 125/126 | 18.2 | 144 / no | Next 16.3 `<ViewTransition>` works without config |
| Scroll-driven `animation-timeline` | 115 | **26** | preview | sheen and parallax with no JS |
| `linear()` easing (springs in CSS) | 113 | 17.2 | 112 | spring curves |
| `corner-shape: squircle` | 139 | no (TP only) | preview | progressive only |
| `ui-serif` / `ui-rounded` font keywords | **no** | 13.4 | no | iOS gets **New York** / SF Rounded for free |
| `navigator.vibrate` | yes | **no** | yes | haptics on Android only |
| iOS "switch checkbox" haptic hack | n/a | **patched in iOS 26.5** (worked 17.4–26.4) | n/a | do not build on it |
| `DeviceOrientationEvent.requestPermission` | 152 | 14.5 | no | gyro needs a tap plus a permission prompt |
| `dynamic-range-limit` (HDR images) | 136 | 26 | no | optional HDR "foil" |
| `@media (device-posture)` | 132 | **27** | no | half-folded "book" posture on iPhone Duo |

Checked locally: Apple's **New York** (the Apple Books title face) has full Cyrillic А–я + Ё, variable axes `opsz 12–256`, `wght 400–1000`, `GRAD`. Its licence covers Apple platforms only, so it is reachable on iOS through `font-family: ui-serif` and cannot be self-hosted for Android.

---

## 1. Why the current build reads as dated / AI-made (diagnosis in one table)

The rejected design is warm cream paper, grain, Lora serif, cloth covers with tiled SVG motifs, a wax seal and many text blocks. That stack is the #1 named AI default of 2026:

- Anthropic's own frontend-design skill lists three cliché "AI looks". **#1 is "#F4F1EA background with high-contrast serif display and terracotta accent".** #2 is "near-black with one acid-green/vermilion accent". #3 is "broadsheet: hairline rules, zero radius, dense columns" (dev.to summary, 2026-08-28: https://dev.to/skillselion/anthropics-frontend-design-skill-names-the-three-cliche-ai-looks-hex-codes-included-f29).
- The AI Cliff (2026-04-22) calls it the "Claude Design" aesthetic: Fraunces + Inter, a soft italic serif on one emphasised word, mono labels, warm amber/muted violet, card grids (https://theaicliff.substack.com/p/ai-design-already-has-a-cliche-youre).
- **"Tasteslop"** was coined by Emily Segal in May 2026 and added to Cambridge's new-words list on 2026-07-27. It means assembled signifiers of good taste with no idea underneath (https://dictionaryblog.cambridge.org/2026/07/27/new-words-27-july-2026/). Cream + serif + paper grain + seal is textbook tasteslop for a "literary" product.
- On top of that, the build uses **2010-style texture skeuomorphism** (cloth, wax, stitching-era props) where 2026 skeuomorphism is about **light and material physics**. The owner asked for "more skeuomorphism" and got the wrong kind.

Conclusion: the redesign has to leave the cream/serif family entirely, not just tune it.

---

## 2. Trends that are genuinely current, with FantPub fit

Format for each: **What**, **Examples**, **Why it works**, **FantPub**, **Risk**.

### T1. Liquid Glass, second generation: tinted, chrome-only, content-coloured
- **What:** the iOS 27 correction of Liquid Glass. It is more opaque and tinted by default, has a darker hairline outline, and stays strictly on the navigation/control layer. Content scrolls *under* the glass. "Scroll edge effects" blur and fade content where it meets a bar.
- **Examples:** Apple Books iOS 26/27 (Mobbin links above). Moonlitt, ADA 2026 Interaction winner (https://moonlitt.app). apple.com/ios (https://www.apple.com/ios/).
- **Why it works:** it is the single strongest "this feels like a current iPhone" signal. It works because it is restrained: one glass layer, with saturated content behind it.
- **FantPub:**
  - Glass appears only on (1) the floating tab capsule, (2) the round reader buttons (X top-left, bookmark top-right, "…" bottom-right, mirroring iOS 27.2), (3) the settings and Pabchik sheets.
  - Tint every glass surface with the day's cover colour (see T4).
  - Story text never sits on glass.
  - Prototype lesson (see `03_trends_book.png`): **over a flat field, glass reads as a dull translucent pill.** Glass needs something moving underneath. Let the shelf, cover art or reader text scroll beneath the bar.
- **Risk:**
  - Creative Boom lists "glassmorphism and liquid glass" among the 10 trends "creatives are so over in 2026" (https://www.creativeboom.com/insight/10-trends-creatives-are-so-over-in-2026/). The cliché is glass on cards and content, not glass on controls.
  - True refraction is Chromium-only. Safari falls back to plain blur.
  - Blur is expensive on low-end Android: cap it at about 20px and 3 glass layers per viewport, and never animate the blur radius.
  - `prefers-reduced-transparency` does not exist in Safari, so ship the solid fallback first.
  - Irony worth using: about 60% of the audience (Android Chrome) can see *more* realistic glass than iPhone users. Gate refraction by engine (UA/brands), not by `@supports`, because Firefox passes `@supports` and renders nothing.

### T2. Object skeuomorphism: one hero object, physically lit
- **What:** skeuomorphism 2026 is not leather and stitching. It is **one real-feeling 3D object** with correct light, thickness and shadow, sitting on a calm field. Controls you can grab (dials, knurling, rings). Material honesty: the object is the interface.
- **Examples:**
  - (Not Boring) Camera, ADA 2026 Visuals finalist, 100+ prototypes ([Mobbin](https://mobbin.com/screens/231d29b3-2353-400d-8926-e2fc85f9071b), https://notboring.software).
  - Sunlitt/Moonlitt: a single lit object on a flat colour field ([Mobbin](https://mobbin.com/screens/249fecee-696e-4698-9171-9741b1a3c095)).
  - Stripe Press 3D books (https://press.stripe.com).
  - Aardvark Book Club, scroll-driven 3D book, SOTD Aug 2026 (https://aardvarkbookclub.com).
  - Oryzo by Lusion, a cork coaster as hero (https://oryzo.ai).
- **Why it works:**
  - It is the opposite of AI output. AI generates flat cards and blobs; it does not generate a book with the right page-block thickness and hinge groove.
  - Apple Books itself renders covers as objects.
  - The owner's own brief asked for "book turns and opens".
- **FantPub:**
  - The home screen *is* the book of the day: ~62vw wide, rotated `rotateY(-18…-22deg)`.
  - Page block 12–16px thick, built from `repeating-linear-gradient` paper lines.
  - Hinge groove at 6–9% of the width, contact shadow plus ambient shadow, and a sheen that moves with scroll or tilt.
  - Tap to lift (spring), turn to face, then morph into the reader (T6).
  - The shelf is a row of real spines/covers, not a tile grid.
  - CSS-only is enough, with no WebGL (prototype: `03_trends_book.html`).
- **Risk:**
  - Kitsch if it spreads. Allow exactly one hero object per screen.
  - Low-end Android: 3D transforms are cheap, filters and blurs are not.
  - Text on a rotated cover must stay legible; keep the title on the front face, not the spine.

### T3. Light that moves: specular highlights driven by scroll, pointer or tilt
- **What:** iOS 26/27 glass and spatial lock-screen wallpapers react to device motion. On the web this becomes a sheen or rim light that moves across objects.
- **Examples:** Pokémon holo cards in CSS (https://poke-holo.simey.me). Apple TV poster parallax. iOS 26 Spatial Scenes.
- **Why it works:** a moving highlight is the cheapest cue that something is a physical surface rather than a picture.
- **FantPub:**
  - On phones, **drive the highlight with scroll** (`animation-timeline: view()`, Chrome 115 / Safari 26), so there is no permission prompt and no JS.
  - On desktop, drive it from the pointer.
  - Use the gyroscope only after an explicit tap. iOS needs `DeviceOrientationEvent.requestPermission()` (Safari 14.5+, Chrome 152+). Use it at most as a bonus on the opened book.
- **Risk:**
  - Permission prompts kill the ritual.
  - Constant motion breaks "minimal". Keep sheen opacity ≤ 0.3 with `soft-light` blend, and disable it under `prefers-reduced-motion`.

### T4. Content-derived colour: the cover tints the whole environment
- **What:** the UI takes its colour from the artwork. Examples: the Apple Books book sheet in the cover's colour, the tinted "Continue" card, Apple Music full-bleed art, Spotify's audiobook page.
- **Examples:** Apple Books ([Mobbin](https://mobbin.com/screens/3a67d33c-80dc-4a37-ba46-527b56984786)). Fable ([Mobbin](https://mobbin.com/screens/5ac5be78-5645-4fd5-99de-4ae02b29e788)). Spotify ([Mobbin](https://mobbin.com/screens/47c20183-d039-4f5b-9820-9c8b1be62498)).
- **Why it works:**
  - It gives the app 365 colourways without a "brand palette" that can become a cliché.
  - It makes "a new day" visible at a glance.
  - Glass looks best when the colour underneath is rich.
- **FantPub:**
  - Extract 3 colours per cover at build time (dominant, vibrant, muted) and write them to story frontmatter.
  - Map them to `--day`, `--day-ink`, `--day-glass`.
  - Use them for the home field (two-stop radial gradient, **not** mesh blobs), glass tint, progress bar, share card and OG image.
  - Chrome UI stays neutral (white/black glass).
- **Risk:**
  - Contrast on extreme covers. Clamp the computed colour's lightness in OKLCH (L 0.35–0.55 for the field) and test against WCAG.
  - Story text pages stay on the 3 reading themes, never on the cover colour.

### T5. Ritual minimalism: one object, one verb, nothing else
- **What:** small, single-purpose daily apps that win on restraint. One item per day, no account, a widget and a share.
- **Examples:** grug, ADA 2026 Delight & Fun winner, "every sunrise, grug shares one wisdom", no login, no tracking, themes (App Store id6751649802; Apple developer story: https://developer.apple.com/design/new-design-gallery-2026). Apple Books Reading Goals (one ring). Lumy (https://lumy.app).
- **Why it works:**
  - Apple has publicly rewarded this exact mechanic in 2026.
  - Minimal is the brief ("более минималистичную эпку").
  - Fewer surfaces leave more budget for the one hero moment.
- **FantPub:**
  - Home = cover-tinted field + book + one action ("Открыть") + a date line. That is all.
  - Three tabs max: Сегодня / Полка / Архив. Search can be the separate round glass button, Apple-style.
  - Pabchik and reactions appear only at the end of the story.
  - Delete explanatory text blocks. A grug-like "one tone of voice in every element" (builtformars note on grug: https://builtformars.com/company/grug) means Pabchik's voice can live in empty states and the status line, not in paragraphs.
- **Risk:**
  - "Lazy minimalism" is also on Creative Boom's 2026 list. Minimal only works if the one object is excellent (T2) and the motion is crafted (T6).
  - SEO pages (archive, story pages) still need indexable text. Keep it below the fold or on the story page, not on Today.

### T6. Spatial continuity: shared-element morphs and spring physics
- **What:** the element you tap becomes the next screen. iOS 18+ zoom navigation transitions, iOS 26 glass buttons morphing into menus, Material 3 Expressive springs on Android 16.
- **Examples:** Family wallet (https://family.co). Emil Kowalski's Vaul sheet (https://vaul.emilkowal.ski, https://emilkowal.ski). Rauno Freiberg's craft notes (https://rauno.me). Next.js view-transition demo (https://react-view-transitions-demo.labs.vercel.dev).
- **Why it works:** continuity makes a web app feel native. Springs, unlike ease-in-out, feel physical. Both are hard to fake with templates.
- **FantPub:**
  - Cover → reader morph through `import { ViewTransition } from 'react'` (Next 16.3.8, no config; see `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`).
  - Archive day → book; shelf spine → book.
  - The settings sheet grows from its button.
  - Use one spring curve everywhere (recipe in §4).
- **Risk:**
  - Safari animates some transition types differently. Firefox has no cross-document support, but this is a single-page app, so that is fine.
  - Never block reading behind an animation: under 400ms for navigation, up to about 700ms only for the daily "open the book" moment.

### T7. Tactile micro-interactions: dials, sliders, haptics, sound
- **What:** controls that feel like hardware. Detents on sliders, dial-like pickers, click sounds, haptic ticks.
- **Examples:** recent.design top feed today (effort dials and sliders). (Not Boring) apps. Teenage Engineering (https://teenage.engineering). Halide (https://halide.cam).
- **Why it works:** touch feedback is the part of skeuomorphism that survives in a minimal UI. It costs no screen space.
- **FantPub:**
  - The font-size control as a detented slider with a glass-lens thumb while dragging (the Apple Books settings behaviour).
  - Reaction buttons with a press-down state: `scale(.96)`, darker inner shadow.
  - `navigator.vibrate(8)` on reaction and on opening the book, **Android only**.
  - Optional page-open sound, off by default. On iOS set `navigator.audioSession.type = 'ambient'` (Safari 16.4+) so the silent switch is respected.
- **Risk:**
  - No web haptics on iOS: the switch hack was patched in iOS 26.5, so never build on it.
  - Sound annoys in a reading app. Off by default, one sound only.

### T8. Native-feeling type: system serif on iOS, one authored face, no "AI serif"
- **What:** Apple Books' look is New York (titles) plus SF (UI). 2026 premium web type is either fully native-feeling or one strong, characterful display face. It is not Instrument Serif or Fraunces with an italic emphasised word, both now read as AI defaults.
- **Examples:** Apple Books (New York titles). Stripe Press (custom book typography). The X debate over Instrument Serif's overuse (https://x.com/owen_roe/status/1989096994749681840).
- **Why it works:** on iOS, `ui-serif` delivers the exact Apple Books title face at zero bytes. That is the most "Apple Books" move available on the web.
- **FantPub:**
  - Titles: `font-family: ui-serif, <Cyrillic serif webfont fallback for Android>`.
  - UI: `system-ui` (SF on iOS, Roboto/Google Sans on Android).
  - Reading body: the 3 reader fonts from `07_fonts.md`.
  - Use `text-wrap: pretty` on paragraphs (Safari 26, Chrome 130) for Russian rag quality.
  - Lora goes; it is part of the rejected look.
- **Risk:**
  - Android shows the fallback, so pick a serif whose metrics are close to New York (opsz-aware, Cyrillic).
  - Don't self-host New York (licence).

### T9. Authored imagery over generated: the anti-AI-slop signal
- **What:**
  - Real, human-decided images: public-domain artworks, strict typographic cover systems, hand-drawn characters, visible imperfection.
  - AI imagery is now recognised instantly: Ghibli/Pixar portraits, clay 3D blobs, painterly "book summary" covers.
- **Examples:**
  - Apple Books Classics typographic covers (Mobbin above).
  - Santioni Spirits by Active Theory, illustrated comic world, SOTD 2026-10-05 (https://santionispirits.com).
  - Obys' Design Books, SOTD 2025-12-17 (https://library.obys.agency).
  - Anti-examples on Mobbin: AI-painted "Life Reset" covers ([link](https://mobbin.com/screens/c68ed0a3-309b-4e13-acfa-44f65e4246c1)) and the 3D clay blob in Bloom ([link](https://mobbin.com/screens/13ff5fbc-82fe-4822-8c38-a3d853de9f3b)).
- **Why it works:**
  - "Imperfection now signals a real person made the decision" (multiple 2026 trend pieces).
  - PD literature pairs naturally with PD art.
  - It is also more defensible legally and editorially.
- **FantPub:**
  - Covers are a **typographic system** (title, author, colour, one PD artwork crop or one engraved/woodcut ornament from museum open-access collections), not AI paintings.
  - The palette is extracted from that art (T4).
  - Pabchik stays one consistent hand-drawn style. Generate no extra poses that drift in style.
- **Risk:**
  - A typographic cover system can drift into the "broadsheet" cliché (#3) if it uses hairlines and zero radius. Keep covers object-like (T2) and colour-led.
  - Check PD status per artwork.

### T10. Shaders and texture as one moment, not wallpaper
- **What:** GPU shaders became designer tools in 2026: Figma Shader Effects (Config 2026) and Paper Shaders open-sourced (paper texture, fluted glass, grain gradient, dithering, liquid metal, god rays). Dithering and grain are 2026's mesh gradient.
- **Examples:** https://shaders.paper.design. Oryzo (Lusion). Lando Norris (OFF+BRAND, SOTY 2025, https://landonorris.com).
- **Why it works:** a single real-time material effect at a single moment reads as craft.
- **FantPub:** use at most **one** shader, only during the daily unwrap/open, e.g. a light sweep or paper-texture reveal on the cover for about 600ms. Then unmount it. No grain overlay on the app chrome; that is part of the rejected look.
- **Risk:**
  - Dithering and grain are on the way to cliché (Creative Boom flags "gradients" and "motion for its own sake").
  - WebGL plus low-end Android means a battery and heat cost. Lazy-load it and skip it under `prefers-reduced-motion` or `saveData`.

### T11 (watch). Foldables bring back the two-page spread
- **What:** iPhone Duo (book-style, ships 2026-10-23) and Galaxy Folds. Safari iOS 27 adds `device-posture`; Chrome adds viewport segments.
- **FantPub:** later and optional. On `@media (device-posture: folded)`, or on a wide viewport, the reader can switch to a two-page spread with a centre gutter shadow. That is the most literal "book" moment the web now allows.
- **Risk:** tiny audience in Russia at a $1,999 price. Ship only after the core works.

---

## 3. Already a cliché in 2026: AI-slop tells to avoid

| # | Tell | Why it reads as slop | In the current FantPub build? | Replace with |
|---|---|---|---|---|
| 1 | Warm cream (#F4F1EA-ish) + high-contrast serif + terracotta/amber | Anthropic's skill names it cliché #1. "Claude Design aesthetic" | **Yes** (cream, Lora, warm accent) | Cover-derived colour field + neutral glass (T1, T4) |
| 2 | Grain/noise overlay on everything, paper texture backgrounds | Default "make it human" move, now generic | **Yes** | One material moment (T10); the object carries texture, the UI does not |
| 3 | 2010 skeuo props: cloth tiles, wax seal, stitching, leather | Texture as decoration, not light physics | **Yes** (cloth covers, wax seal) | Lit 3D object with honest thickness (T2) |
| 4 | Glassmorphism cards: frosted panels over gradient blobs, glass behind text | "Glassmorphism and liquid glass" on Creative Boom's 2026 list. HIG: no glass in content | Risk in redesign | Glass only on controls; content opaque |
| 5 | Purple/indigo gradients (Tailwind indigo-500), "Get started" gradient buttons | #1 AI tell per 925studios (2026-06-14) | No | Day colour + black/white buttons |
| 6 | Inter everywhere; Instrument Serif/Fraunces + italic emphasised word; mono pill labels | AI default stack (AI Cliff, X discourse) | Partly (serif-display literary look) | `ui-serif` (New York) + `system-ui` |
| 7 | Bento grids; three rounded cards in a row with thin line icons | On Creative Boom's list; AI layout default | Archive/calendar risk | Shelf of objects; plain list for archive |
| 8 | Emoji as icons, ✨ sparkle "AI" icons | Instant "template" signal | Check reactions | Drawn glyphs or SF-like symbols |
| 9 | Fake 3D: clay blobs, chrome orbs, AI 3D illustrations | Bloom-style "Today's Advice" blob | No | Real modelled/CSS object (book) |
| 10 | AI-painted covers/illustrations (flat+grain, Ghibli/Pixar) | "AI caricatures" on Creative Boom's list; Life Reset-style covers | **Covers pipeline is Codex-generated** | Typographic covers + PD art (T9) |
| 11 | Motion for its own sake: preloaders, scroll-jacking, parallax everywhere | Creative Boom #10 | Some risk | Motion only for continuity (T6) and the daily reveal |
| 12 | Dark + single acid-green/vermilion accent; broadsheet hairlines + zero radius | Anthropic clichés #2, #3 | No | — |
| 13 | Y2K/retro chrome nostalgia | On Creative Boom's list | No | — |
| 14 | Simulated page-curl as default | Heavy and gimmicky on the web; Apple keeps it as an option only | No | Scroll reading (Apple's "Scroll" mode); curl never |

---

## 4. Recipes (tested values, copy-ready)

### 4.1 Glass capsule tab bar (iOS 27-style: tinted, outlined)
```css
/* literal values inside -webkit-backdrop-filter: avoid var() there for older Safari */
.glass {
  background: rgb(255 255 255 / .62);                 /* dark theme: rgb(28 28 30 / .55) */
  -webkit-backdrop-filter: blur(14px) saturate(180%);
          backdrop-filter: blur(14px) saturate(180%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .85),             /* top specular rim */
    inset 0 -1px 0 rgb(0 0 0 / .05),
    0 0 0 .5px rgb(0 0 0 / .14),                       /* iOS 27 darker hairline */
    0 10px 30px -10px rgb(0 0 0 / .35);
}
.tabbar { position: fixed; left: 20px; right: 86px; height: 62px; border-radius: 999px;
  bottom: max(20px, env(safe-area-inset-bottom)); }
.search { position: fixed; right: 20px; width: 62px; height: 62px; border-radius: 50%;
  bottom: max(20px, env(safe-area-inset-bottom)); }
.tabbar [aria-current="page"] { background: rgb(0 0 0 / .07); border-radius: 999px; }
/* day tint: mix 8–14% of the cover colour into the glass */
.glass--tinted { background: color-mix(in oklab, var(--day) 12%, rgb(255 255 255 / .62)); }
/* fallback first: solid when blur unsupported */
@supports not (backdrop-filter: blur(1px)) { .glass { background: rgb(250 250 250 / .96); } }
```
- Budget: blur 12–20px, saturate 140–180%, ≤ 3 glass layers per viewport, never animate `blur()`.
- Refraction (`feDisplacementMap` in `backdrop-filter: url(#lg)`) only when `navigator.userAgentData?.brands?.some(b => b.brand === 'Chromium')`. Never on text surfaces.
- References: https://kube.io/blog/liquid-glass-css-svg/ (it calls itself experimental) and https://www.buildmvpfast.com/blog/liquid-glass-css-backdrop-filter-recipes-2026.

### 4.2 Scroll edge effect (content melting under bars)
```css
.edge-bottom { position: fixed; inset: auto 0 0; height: 110px; pointer-events: none;
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
  mask-image: linear-gradient(to top, #000 35%, transparent); }
```

### 4.3 Book object (CSS only, verified in Chromium, see `03_trends_book.html`)
```css
.stage { perspective: 1400px; }
.book { --w: min(62vw, 260px); --t: 16px; width: var(--w); aspect-ratio: 2/3;
  position: relative; transform-style: preserve-3d; transform: rotateY(-22deg) rotateX(4deg); }
.cover { position: absolute; inset: 0; transform: translateZ(calc(var(--t) / 2));
  border-radius: 2px 6px 6px 2px; overflow: hidden; backface-visibility: hidden; }
.cover::before { /* hinge groove at 2–9% */
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(90deg, rgb(0 0 0/.35) 0 2%, rgb(255 255 255/.30) 4%,
              rgb(0 0 0/.28) 7%, rgb(255 255 255/.10) 9%, transparent 14%); }
.pages { position: absolute; top: 1.2%; bottom: 1.2%; right: calc(var(--t) / -2);
  width: var(--t); transform: rotateY(90deg);
  background: repeating-linear-gradient(90deg, #f4f1ea 0 1px, #dcd6cb 1px 2px); }
/* sheen driven by scroll: no JS, no permission (Chrome 115+, Safari 26+) */
.cover::after { content: ""; position: absolute; inset: 0; mix-blend-mode: soft-light;
  background: linear-gradient(105deg, transparent 30%, rgb(255 255 255/.28) 46%, transparent 58%);
  background-size: 260% 100%; animation: sheen linear both;
  animation-timeline: view(); animation-range: cover 0% cover 100%; }
@keyframes sheen { from { background-position: 100% 0 } to { background-position: 0 0 } }
@media (prefers-reduced-motion: reduce) { .cover::after { animation: none; } }
```
`rotateY(-22deg)` reveals the page block on the right edge (checked in the render).

### 4.4 One spring for the whole app (`linear()`, Chrome 113 / Safari 17.2 / FF 112)
k=220, c=20, m=1 gives ζ≈0.67, ~5.6% overshoot, settling in ~600ms. Use the full curve for the book lift; for navigation, use the same curve at 380ms.
```css
--spring: linear(0, 0.044, 0.151, 0.29, 0.439, 0.581, 0.709, 0.815, 0.9, 0.963, 1.007, 1.035,
  1.051, 1.056, 1.056, 1.051, 1.043, 1.035, 1.026, 1.019, 1.012, 1.007, 1.003, 1, 0.998,
  0.997, 0.997, 0.997, 1);
.book.is-lifted { transition: transform 600ms var(--spring); transform: rotateY(0) translateY(-8px) scale(1.04); }
```

### 4.5 Cover → day colour (build time)
Use one dependency at build time only (e.g. `sharp` resize to 32×32 + OKLCH k-means, or `node-vibrant`). Write `{day, dayInk, dayGlass}` into story frontmatter, then `style={{'--day': story.day}}` on `<body>`. Clamp the field to OKLCH L 0.35–0.55 and C ≤ 0.14, and check text/ink contrast ≥ 4.5:1.

### 4.6 Continuity
`<ViewTransition name={`cover-${slug}`}>` on the home book, the shelf spine and the reader header. Route navigations in the Next 16 App Router trigger it automatically. Keep `view-transition-class` for "open-book" vs "page".

---

## 5. Ranked shortlist

### Five moves that fit FantPub (do these, in this order)
1. **One lit book object as the whole home screen** (T2 + T3). CSS 3D, page block, hinge groove, scroll-driven sheen, spring lift, morph into the reader. This is the "вау" and the "скевоморфизм" in one element, and no AI template produces it.
2. **iOS 27-style tinted Liquid Glass, chrome only** (T1). 62px capsule tab bar + separate round search/archive button. Round glass reader buttons positioned as in iOS 27.2 (X top-left, bookmark top-right, "…" bottom-right, progress bar). Settings as an inset glass sheet. Story text never on glass. Chromium-only refraction as a bonus for the Android majority.
3. **Radical ritual minimalism** (T5, the grug model). Today = field + book + "Открыть" + date. Three tabs max. Pabchik and reactions only after the story. Delete the text blocks.
4. **Covers as authored objects that colour the day** (T9 + T4). A typographic cover system with PD art, not AI paintings. A palette is extracted per story and tints the field, glass, progress, share card and OG image.
5. **Continuity and touch** (T6 + T7 + T8). One spring curve, shared-element morphs, a detented font slider with a glass thumb, Android `vibrate(8)` on key moments, and `ui-serif` so iPhone users get Apple Books' own New York titles.

### Five things to avoid
1. **The cream/serif/terracotta "AI-warm editorial" family** plus 2010 texture props (wax seal, cloth tiles, grain overlay). It is the named #1 AI cliché and the reason for the rejection.
2. **Glass as content.** No frosted cards, no glass behind story text, no gradient blobs for glass to blur, no animated blur, no more than 3 glass layers. Glass on controls only.
3. **Generated imagery and fake 3D.** No AI-painted covers, Ghibli/Pixar art, clay blobs, sparkle icons or emoji icons, and no Pabchik poses that drift in style.
4. **The default stack.** No Inter, Instrument Serif/Fraunces with an italic emphasised word, mono pill labels, indigo gradients, bento grids or three-card rows (watch the archive/calendar).
5. **Motion and texture for its own sake.** No preloaders, scroll-jacking, global grain or dithering, simulated page-curl, or gyro prompts on first visit. The only spectacle is the daily open.

---

## Sources (primary)
- Apple: https://www.apple.com/ios/ · https://developer.apple.com/design/human-interface-guidelines/materials · https://www.apple.com/newsroom/2026/06/apple-reveals-winners-of-the-2026-apple-design-awards/ · https://developer.apple.com/design/new-design-gallery-2026 · https://webkit.org/blog/17333/webkit-features-in-safari-26-0/ · https://webkit.org/blog/17818/announcing-interop-2026/
- Apple Books: https://9to5mac.com/2026/10/06/ios-27-2-gives-apple-books-new-design-updates-as-iphone-duo-nears/ · Mobbin screens linked inline
- Liquid Glass critique and history: https://www.nngroup.com/articles/liquid-glass/ · https://en.wikipedia.org/wiki/Liquid_Glass
- Web glass: https://kube.io/blog/liquid-glass-css-svg/ · https://www.buildmvpfast.com/blog/liquid-glass-css-backdrop-filter-recipes-2026 · https://github.com/rdev/liquid-glass-react · https://liquid-glass.ybouane.com/
- Awards and galleries: https://www.awwwards.com/annual-awards/winners · https://www.awwwards.com/websites/sites_of_the_day/ · https://www.awwwards.com/websites/sites_of_the_month/ · https://www.awwwards.com/sites/aardvark-book-club · https://www.awwwards.com/sites/obys-design-books · https://www.awwwards.com/sites/oryzo-ai · https://www.awwwards.com/sites/santioni-spirits · http://recent.design · https://www.siteinspire.com/
- Clichés and slop: https://www.creativeboom.com/insight/10-trends-creatives-are-so-over-in-2026/ · https://www.925studios.co/blog/ai-slop-design-tells · https://theaicliff.substack.com/p/ai-design-already-has-a-cliche-youre · https://dev.to/skillselion/anthropics-frontend-design-skill-names-the-three-cliche-ai-looks-hex-codes-included-f29 · https://dictionaryblog.cambridge.org/2026/07/27/new-words-27-july-2026/
- Tools: https://www.figma.com/blog/config-2026-recap/ · https://shaders.paper.design/ · https://designtools.fyi/news/paper-shaders-toolcraft-july-2026
- Tactile and craft: https://notboring.software · https://teenage.engineering · https://halide.cam · https://family.co · https://emilkowal.ski · https://rauno.me · https://poke-holo.simey.me · https://press.stripe.com · https://moonlitt.app · https://sunlitt.app
- Platform data: MDN browser-compat-data 8.1.4 (2026-10-01) · https://unpkg.com/ios-haptics@3.1.1/README.md · https://gs.statcounter.com/os-market-share/mobile/russian-federation · https://www.opb.org/article/2026/09/09/apple-s-new-ceo-unveils-a-foldable-iphone/
