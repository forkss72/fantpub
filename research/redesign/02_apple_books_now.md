# 02 — Apple Books today (Oct 2026) and Liquid Glass: what to copy, what to leave alone

Researched 2026-10-07. Every claim has a source URL. Measurements marked **[measured]** are mine, taken in pixels from official Apple Support screenshots (iOS 27 guide) or Mobbin 1179×2556 @3x captures (Liquid Glass era, before 27.2), then divided by 3 to get pt. Treat them as ±1 pt. Reference images are saved in `research/redesign/02_refs/`.

---

## 0. Where Apple is right now

| Fact | Date | Source |
|---|---|---|
| Liquid Glass announced at WWDC25 and shipped in iOS 26 | 2025-06-09 / 2025-09-15 | https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/ |
| iOS 26.1 added a **Clear / Tinted** switch (Settings › Display & Brightness) after complaints about legibility | 2025-10 | https://tidbits.com/2025/10/21/ios-26-1-to-add-optional-opacity-to-liquid-glass/ |
| WWDC26 revised Liquid Glass: it diffuses complex backgrounds more, adds a **darkened edge and brighter specular highlights**, and replaces the switch with a **slider from "ultra-clear" to "fully tinted"** | 2026-06-08 | https://www.apple.com/newsroom/2026/06/apple-unveils-next-generation-of-apple-intelligence-siri-ai-and-more/ , https://developer.apple.com/videos/play/wwdc2026/102/ |
| **iOS 27 is current.** It shipped 2026-09-14. The slider lives in Settings › Appearance › Liquid Glass, and its midpoint is Apple's default | 2026-09-14 | https://www.macrumors.com/2026/09/14/apple-releases-ios-27/ , https://www.macrumors.com/how-to/ios-27-tone-down-liquid-glass-transparency/ |
| **iOS 27.2 beta 3** changes the Books reader: progress bars, a standard Liquid Glass "…" menu at bottom-right, Bookmark as its own button top-right, **X moved to top-left**, a larger Back button bottom-left | 2026-10-06 | https://9to5mac.com/2026/10/06/ios-27-2-gives-apple-books-new-design-updates-as-iphone-duo-nears/ , https://www.newmobilelife.com/2026/10/07/apple-books-ios-27-2-update/ |
| iPhone Duo (foldable) goes on sale 2026-10-23. When held like a book, the Books reader switches to a two-page spread | 2026-09 / 10 | https://www.apple.com/newsroom/2026/09/apple-unveils-iphone-duo/ , https://appleinsider.com/articles/26/10/07/iphone-duo-has-a-book-like-two-page-quick-look-layout (I could only see the search snippet; the page returns 403 to the fetcher) |
| iOS 27 Books features: AI-assisted audiobook narration and smarter Reading Goals with daily coaching. This is a secondary source; Apple's own guide confirms the "Coaching" notification toggle | 2026-06-10 | https://goodereader.com/blog/e-book-news/apple-books-gets-a-few-new-features-in-ios-27 , https://support.apple.com/guide/iphone/set-reading-goals-iph6013e96f4/ios |

So the target is **iOS 27 Liquid Glass**, which is calmer, frostier and easier to read than the 2025 launch version. The 2025 "everything is a clear lens" look already reads as dated, and Apple itself pulled back from it.

---

## 1. Liquid Glass anatomy, in Apple's own terms

Primary sources: WWDC25 "Meet Liquid Glass" (https://developer.apple.com/videos/play/wwdc2025/219/), WWDC25 "Get to know the new design system" (https://developer.apple.com/videos/play/wwdc2025/356/), HIG Materials (https://developer.apple.com/design/human-interface-guidelines/materials), "Adopting Liquid Glass" (https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass), WWDC26 Platforms State of the Union (https://developer.apple.com/videos/play/wwdc2026/102/).

### 1.1 What it is
- Apple calls it *"a new digital meta-material that dynamically bends and shapes light"*. It is not a copy of real glass. Its motion is meant to read as *"a lightweight liquid"* (WWDC25-219).
- It defines itself mainly through **lensing**: *"Whereas previous materials scattered light, this new set of materials dynamically bends, shapes, and concentrates light in real time."*
- Look and motion were designed together: the material *"responds to interaction by instantly flexing and energizing with light"* and has a *"gel-like flexibility"*.
- **Entering and leaving:** *"Instead of fading, Liquid Glass objects materialize in and out by gradually modulating the light bending and lensing."*
- **Morphing:** *"As you go between states in an app, Liquid Glass dynamically morphs between the controls in each context … a singular floating plane that the controls live on."* A menu *"simply pops open"* out of the button that triggered it.

### 1.2 The layers (stacked bottom to top)
| # | Layer | Apple's description | Web equivalent |
|---|---|---|---|
| 1 | Backdrop processing | Regular glass *"blurs and adjusts the luminosity of background content"* (HIG). iOS 27 *"more effectively diffuses complex content"* | `backdrop-filter: blur() saturate()` plus a semi-opaque fill |
| 2 | Lensing / refraction | Light bends at the edges, which is how the shape announces itself | SVG `feDisplacementMap` in `backdrop-filter` works **in Chromium only** (see §4). On iOS Safari, fake it with an edge highlight |
| 3 | Tint (optional) | *"Selecting a color generates a range of tones that are mapped to content brightness underneath"*, like stained glass. Apple says to use it for primary actions only | `color-mix()` fill on one CTA |
| 4 | Specular highlights | *"Light sources … shine on the material producing highlights that respond to geometry"*. Sometimes they follow device motion. iOS 27 made them **brighter** | `inset` top-rim `box-shadow` / gradient border |
| 5 | Darkened edge (iOS 27) | *"we also introduced a darkened edge along with brighter specular highlights"* (WWDC26-102) | 0.5 px dark inner ring |
| 6 | Adaptive shadow | *"increases the opacity of its shadow when it is over text … lowers the opacity … over a solid light background"* | Two shadow strengths, chosen by context (rest vs. over text) |
| 7 | Illumination on touch | *"the material illuminates from within … Starting right under your fingertips, the glow spreads throughout the element"* | `:active` radial gradient at the pointer position |
| 8 | Foreground content | Symbols and labels are monochrome and *"flip from light to dark"* along with the glass | `color: var(--on-glass)` that follows theme / background |

**Size changes the material.** When glass grows into a menu or sheet, it *"casts deeper, richer shadows, has more pronounced lensing and refraction effects, and a softer scattering of light"*. Small bars switch between light and dark. Large surfaces like menus and sidebars don't, because a flip there would be distracting (WWDC25-219).

### 1.3 Where glass goes, and where it never goes
- **Only in the navigation/control layer** that floats above content. HIG: *"Don't use Liquid Glass in the content layer."* The one exception is transient controls such as a slider knob or toggle, which turn into glass only while you touch them. The Books brightness slider does exactly this: the thumb becomes a clear lens while dragged (Mobbin, https://mobbin.com/screens/fea5dd1a-687e-4474-9647-9aac99c10b15).
- **No glass on glass:** *"When placing elements on top of Liquid Glass, avoid applying the material to both layers. Instead, use fills, transparency, and vibrancy."*
- **Use it sparingly:** *"Limit these effects to the most important functional elements in your app."*
- **No overlap at rest:** *"In steady states, such as when an app first launches, avoid intersections between content and Liquid Glass. Instead, reposition or scale the content."*
- **Color belongs to content:** don't tint every element (*"When every element is tinted, nothing stands out"*). *"If you want to imbue color into your app, do it in the content layer instead."* The HIG Color page says to tint the **background** of a primary button, never several controls at once (https://developer.apple.com/design/human-interface-guidelines/color).

### 1.4 Regular vs. clear
- **Regular** is the default. It is adaptive, works over any content, and suits anything with real text (alerts, sidebars, popovers).
- **Clear** is *"permanently more transparent"* and has no adaptive behaviour. Use it only when all three hold: (1) it sits over media-rich content, (2) a dimming layer won't hurt that content, (3) the content above the glass is bold and bright. HIG: *"If the underlying content is bright, consider adding a dark dimming layer of 35% opacity."* **Never mix the two variants.**
- FantPub: use **regular** everywhere. Use **clear + 35% dim** only for controls laid over a full-bleed illustrated cover (the hero of the day's book), if any controls sit on it at all.

### 1.5 Scroll edge effect
- It replaces hard dividers: *"As content begins to scroll underneath a glass element, the effect gently dissolves the content into the background."* Over dark content it *"switches to apply a subtle dimming instead"* (WWDC25-219).
- **Soft** is the default on iOS. **Hard** (a uniform opaque band) is mostly for macOS and pinned headers. *"Apply one scroll edge effect per view."* It is *"not decorative"*: leave it out wherever no floating UI exists (WWDC25-356).
- iOS 27 / macOS 27 add *"When content scrolls under floating bars, a uniform toolbar appears across the top"* (WWDC26-102).

### 1.6 Concentric geometry (the main reason Apple's UI looks "right")
- There are three shape types: **fixed** (constant radius), **capsule** (radius = height/2), and **concentric** (*"calculate their radius by subtracting padding from the parent's"*) (WWDC25-356).
- *"keep an eye out for corners that feel too pinched — or flared."* On phones: *"use a capsule with extra margin to create space near the screen edge."*
- Toolbar items are concentric with the bar by default. Custom components must follow the same rule (HIG Toolbars, https://developer.apple.com/design/human-interface-guidelines/toolbars).
- Lists, forms and grouped sections got **taller rows, more padding and bigger section radii** (Adopting Liquid Glass).

### 1.7 Tab bar (iOS)
- *"A tab bar floats above content at the bottom of the screen. Its items rest on a Liquid Glass background"* (HIG Tab bars, updated 2026-06-08: https://developer.apple.com/design/human-interface-guidelines/tab-bars).
- Search becomes its own tab. *"The system automatically separates the search tab from other tabs and places it at the trailing end"* (Adopting Liquid Glass).
- **Minimize on scroll:** `.tabBarMinimizeBehavior(.onScrollDown)`. The bar shrinks while you scroll down and expands when you scroll back up or tap. The HIG recommends this mainly for tab bars with an **accessory** (e.g. Music's MiniPlayer moves inline with the minimized bar). Newsroom: *"when users scroll, tab bars shrink to bring focus to the content … The moment users scroll back up, tab bars fluidly expand."*
- Accessory rule: use it only for **persistent** features such as playback. *"Avoid placing screen-specific actions here"* (WWDC25-356).
- Labels: one word, filled symbols preferred, monochrome bars over colorful content.
- **[measured] Books tab bar** (Mobbin Library capture, https://mobbin.com/screens/fb8d6cde-a349-4b0b-a1d5-4fbbc3fce77f):
  - Capsule **62 pt** tall, insets **21 pt** left / right / bottom. LearnUI.design independently gives 21 pt and 11 pt labels: https://www.learnui.design/blog/ios-design-guidelines-templates.html
  - Search is a separate **62 pt circle**, 8 pt gap from the capsule. With 3 tabs the capsule is ~281 pt wide.
  - The selected tab is a pill **inset 4 pt** inside the capsule, about 88×53 pt, radius ≈ 27 pt (31 − 4: concentric).
  - Along the top of the capsule runs a 1 px rim brighter than its fill (255 vs. 253), which is the specular edge.
  - The bar picks up color from what's behind it. In the iOS 27 Support image the "Library" pill is tinted red by the cover underneath (`02_refs/ios27_support_library.png`).

### 1.8 Sheets, menus, toolbars
- Sheets have a bigger corner radius. *"half sheets are inset from the edge of the display to allow content to peek through"*. A sheet becomes **more opaque** as it expands to full height. Modal sheets get a dimming layer; parallel tasks don't (Adopting Liquid Glass; WWDC25-356).
- **Button placement changed in 2026:** the HIG Sheets page was updated on 2026-03-24, *"the Cancel button belongs on the leading edge"*, with Done on the trailing edge (https://developer.apple.com/design/human-interface-guidelines/sheets). Books follows it: the iOS 27 Themes & Settings sheet has its X on the **left**, where in iOS 26 it was on the right. In 27.2 the reader's X also moves to the left.
- Action sheets and menus grow out of their source button instead of the bottom of the screen.
- Toolbars: symbols over text, *"don't group symbols with text"*, at most ~3 groups. A single primary action sits on the trailing side with the `.prominent` (tinted) style. *"Reduce the use of toolbar backgrounds and tinted controls."* Large titles collapse to inline titles on scroll. Titles should be under 15 characters.

### 1.9 Accessibility and user settings (they all change the material)
- **Reduce Transparency** makes glass *"frostier and obscures more of the content behind it"*.
- **Increase Contrast** makes elements *"predominantly black or white"* with *"a contrasting border"*.
- **Reduce Motion** *"decreases the intensity of some effects and disables any elastic properties"* (WWDC25-219).
- Under Reduce Motion the HIG also asks for crossfades instead of x/y/z movement, *"Avoiding animating into and out of blurs"*, and tighter springs (https://developer.apple.com/design/human-interface-guidelines/accessibility).
- **iOS 27 slider** goes from ultra-clear to fully tinted; Reduce Transparency still applies on top of it (MacRumors how-to above).
- Contrast targets in the HIG: 4.5:1 for text up to 17 pt, 3:1 for 18 pt+ or bold.

### 1.10 Branding inside Apple's system (WWDC26 "Communicate your brand identity on iOS", https://developer.apple.com/videos/play/wwdc2026/251/)
- Think of the app as two layers: the UI layer (keep it native and familiar) and the content layer (*"the best opportunity to express your brand identity"*).
- *"move color into the content area of your app, into the scroll view … Liquid Glass controls sit above the content layer and pick up your brand color dynamically."*
- Show the logo only on Home, and let it fade on scroll (the NYT Cooking example).
- Motion is part of the brand (zoom transitions, springs). *"delayed load times or dropped frames translate poorly"*.
- New York is Apple's serif *"for traditional reading"*. Books uses it for large titles; the face first shipped in Apple Books in 2018 (https://en.wikipedia.org/wiki/New_York_(2019_typeface)).

---

## 2. Apple Books today (iOS 26 → 27 → 27.2 beta)

### 2.1 Structure
- Tabs in the iOS 27 guide: **Home, Library, Book Store, Audiobooks, Search** (https://support.apple.com/guide/iphone/read-books-iphc1af7c57/ios). In regions without audiobooks the capture shows Home / Library / Book Store in one capsule with Search as a separate circle (Mobbin).
- **Large titles in New York Bold** ("Home", "Library") with circular glass buttons top-right: a reading-goal ring plus avatar on Home; sort and "…" on Library.

### 2.2 Home (`02_refs/ios27_support_home.png`, https://mobbin.com/screens/ef25171d-f4a6-43ed-a0a2-375e835230f8)
- **"Continue" row:** horizontal cards, each **filled with a color taken from its book's cover** (taupe for *Atomic Habits*, green for *Pride and Prejudice*, rust in the Mobbin capture). Each card holds a small cover, title, author, "Book · 1%" and "…".
- **Top Picks:** large editorial cards (illustrated gradient art, "Staff Picks") next to a white card with a real cover.
- **Want to Read:** a carousel of covers with "GET" outline capsules.
- **More to Explore:** wide white cards holding a genre name (serif) and **3 covers fanned/overlapping** at the right edge (https://mobbin.com/screens/f4688b5b-bbd4-43aa-9da7-edd780d338fb).
- **Reading Goals** (`02_refs/ios27_support_reading_goals.png`, https://support.apple.com/guide/iphone/set-reading-goals-iph6013e96f4/ios):
  - A semicircular gauge reading "Today's Reading **6:28** of your 15-minute goal", in big serif numerals.
  - A black capsule **"Keep Reading"** with the book name as a subtitle.
  - A **week streak row S M T W T F S** of circles, filled blue when done, with partial progress drawn as a ring. Below it: "Extend your 3-day reading streak. Record is 3 days."
  - **Books Read This Year:** finished covers with a blue check, and **empty slots numbered "2", "3"** as placeholders.
  - Defaults are **5 min/day** and **3 books/year**. Users get "Coaching" and "Goal Completion" notifications. Reading Goals arrived in iOS 13 (2019) (https://www.mactrast.com/2019/09/how-to-set-reading-goals-in-the-ios-13-books-app/amp/).

### 2.3 Library (`02_refs/ios27_support_library.png`)
- A 2-column grid of **covers aligned on a common bottom line** (no shelves, no boxes). Under each: a status label ("SAMPLE" red pill, "Finished", "117 books") plus "…".
- A **series is a stack**: 2–3 covers offset diagonally behind each other.
- Grid or List view. Sort by Recent / Title / Author / Manual, with drag to reorder (https://support.apple.com/guide/iphone/organize-books-iphab219b91/ios).

### 2.4 How Apple draws a cover **[measured]**, from the white *A Tale of Two Cities* cover in the Mobbin Library capture
- Aspect **2:3** (152.7 × 229 pt in the 2-column grid).
- Corner radius **≈ 1.5 pt**. The corners are almost square: a book, not an app card.
- A **hairline outline** (0.33 pt, dark ~45%) on the top, left and right edges, so white covers don't dissolve into the white background.
- **Spine hinge shading** across the first ~6% of the cover width (about 10 pt):
  - 0 → 1.3 pt: a dark falloff from the edge (luminance 50% → 90%)
  - peak highlight at ~3 pt (2% of width)
  - a **groove** at ~5.7 pt (3.7%), about 7% darker
  - flat from ~9.7 pt (6.3%) onward

  It reads as the hinge crease of a hardcover. It sits on top of the artwork and doesn't change it.
- **Shadow:** soft and pushed downward, visible ~23 pt below the cover, darkest (~29%) right at the bottom edge. A faint ~4 pt halo on the sides.
- On the store product page the cover sits centered over a **full-bleed background in the cover's dominant color** (rust for *Pride and Prejudice*). The title is in serif. The glass circle buttons (X on one side; "+" and "…" grouped on the other) take on that color. A translucent card holds the white "Read" / "Get" capsule (https://mobbin.com/flows/328cdde7-bf7c-47f7-85a5-0e06f5d34e78, `02_refs/mobbin_ios26_product.jpg`).

### 2.5 Reader
**Chrome before 27.2** (`02_refs/ios27_support_reader.png`, `mobbin_ios26_reader.jpg`)
- The page is clean. A tap reveals:
  - top-left, a "↺ 372" back-to-previous-location chip
  - top-center, small grey "9 pages left in chapter" (or the book title)
  - top-right, **X in a ~44 pt glass circle**
  - bottom-center, "395 of 691"
  - bottom-right, a **menu button**
- Users can switch the menu button to the left side (Settings › Apps › Books › Reading Menu Position).
- **Swipe down from the top closes the book** (https://support.apple.com/guide/iphone/read-books-iphc1af7c57/ios).
- Turn the page by tapping the right margin or swiping. "Both Margins Advance" is an option.

**Menu, iOS 26** (https://mobbin.com/screens/fda02365-2264-4eff-a55e-7850616e58bf)
- It **blooms out of the button as a stack of separate glass capsules**: "Contents · 0%" (dark, active), "Search Book", "Themes & Settings (AA)".
- Under them is a row of 4 circles: Share, Orientation Lock, Line Guide, Bookmark.
- This is Apple's "menu pops from the button" principle applied.

**27.2 changes** (9to5Mac 2026-10-06)
- Progress bars.
- The menu becomes a **standard Liquid Glass "…" menu** at bottom-right.
- **Bookmark** becomes a standalone top-right button.
- **X** moves top-left.
- **Back** moves bottom-left and gets larger.

Apple is moving toward fewer custom controls and more standard system glass.

**Themes & Settings sheet** (`02_refs/ios27_support_themes_sheet.png`, `mobbin_ios26_themes.jpg`)
- A floating sheet over the dimmed page. Header: X in a circle plus "Themes & Settings" (iOS 27: X on the left).
- Row 1: a font-size capsule **"A | A"** (small / large) and a second capsule with **page-turn** and **appearance** icons.
- Row 2: a **brightness slider**, sun icons at both ends, glass-lens thumb while dragging.
- Then **6 theme tiles in a 3×2 grid**. Each tile is a mini page showing "Aa" in that theme's font and colors. **[measured]** light-mode backgrounds:

  | Theme | Background |
  |---|---|
  | Original | `#FFFFFF` |
  | Quiet | `#4C4C4E`, grey text |
  | Paper | `#F4F4F4` |
  | Bold | `#FFFFFF`, heavy sans |
  | Calm | `#F4E8D0`, serif |
  | Focus | `#FEFFF9`, sans |

  The selected tile has a ~2.5 pt black outline. Sheet fill is `#F8F8F8`; control capsule fill is `#E7E8EA`.
- A full-width **"Customize"** capsule leads to: Font (Original, Palatino, …), Bold Text, and Accessibility & Layout Options (line, character and word spacing, margins, justify). "Reset Theme" undoes it all.
- Appearance options are Light / Dark / **Match Device / Match Surroundings**. Dark turns all 6 themes dark (https://tidbits.com/2022/10/03/apples-books-ios-16/).
- **Page turn:** Slide (default since iOS 16), **Curl**, Fast Fade, Scroll (vertical).
  - Curl was **removed in iOS 16.0** (Sep 2022). After complaints it **came back in 16.4** (Mar 2023) (https://ios.gadgethacks.com/how-to/get-page-turning-curl-animation-back-apple-books-for-iphone-and-ipad-0385329/, https://basicappleguy.com/basicappleblog/build-a-better-books).
  - Curl follows the finger: you can hold a page half-turned and drag it back and forth (https://www.macrumors.com/how-to/re-enable-page-turning-animation-apple-books/).
- **Line Guide:** dims the page and leaves one line lit on a white bar. Move it by tapping above/below or by dragging.
- First-run hint: a glass popover pointing at the menu: *"Choose a theme, page turn animation and more to make each book perfect for you."* (https://mobbin.com/flows/f12e0c84-531c-49dd-be84-edeea05d53ec).
- End of a sample: a floating glass card with a mini cover, title and a "GET" capsule over the last page (same flow).

**Opening a book** *(I watched this on device; Apple doesn't document it)*. Tapping a cover runs a **zoom transition**: the cover grows from its grid position to fill the screen and dissolves into the first page. Closing (X or swipe down) shrinks it back into place. This is the same SwiftUI zoom transition Apple promotes in WWDC26-251 (*"connecting the tap target to the transition state"*). Check it on a device before copying the timing.

### 2.6 What makes Books feel like Books
1. **Covers are the only color.** The chrome is white/grey with black glyphs, and any color comes **from the cover** (Continue cards, product page backgrounds, glass tint).
2. **Serif display type** (New York) for titles and the goal numerals. UI labels are in SF.
3. **The page has nothing on it while you read.** Chrome appears on tap as a few glass circles and small grey metadata.
4. **Physical cues without texture:** hinge-shaded covers, cast shadows, stacked series, an optional finger-tracked curl.
5. **Progress shown as objects:** a ring, a gauge, week dots, numbered empty slots for this year's books.

---

## 3. From wooden shelves to physicality without texture

| Year | What Apple did | Source |
|---|---|---|
| 2010 (iPad) | Wooden bookshelf. *"Tapping on the store button on the bookshelf flips over the bookshelf and reveals the store"*, the famous "secret passage" swing. Page curl on turn | https://www.iphoneincanada.ca/2010/01/27/apple-reveals-ibooks-store-for-ipad/ |
| 2012 | Apple patents the page-turn animation | https://en.wikipedia.org/wiki/Apple_Books |
| 2013-11-14 | iBooks redesigned for iOS 7: *"stripped of its real-world allegories like wooden textures and bookshelves … significantly more depth through the use of shadows"*. Covers float over white | https://techcrunch.com/?p=914973 |
| 2018-06 | Renamed Apple Books in iOS 12 (*"our biggest books redesign ever"*). Reading Now / Library / Book Store, "large, easy-to-see cover art", serif display face (New York, then called SF Serif) | https://www.apple.com/newsroom/2018/06/apple-books-all-new-for-iphone-and-ipad-celebrates-reading/ |
| 2022 (iOS 16) | New reader, 6 themes, Customize. Curl removed | https://tidbits.com/2022/10/03/apples-books-ios-16/ |
| 2023 (iOS 16.4) | Curl back as an option | https://ios.gadgethacks.com/how-to/get-page-turning-curl-animation-back-apple-books-for-iphone-and-ipad-0385329/ |
| 2025–26 | Liquid Glass chrome: physical through **light and motion**, not surface texture | WWDC25-219 |

**How the "skeuomorphism" moved.** Apple dropped imitation *surfaces* (wood, leather, linen) and kept imitation *physics*:

| 2010 texture | 2026 replacement |
|---|---|
| Wooden shelf with a drawn ledge | Covers on a shared baseline with a real cast shadow and no shelf. The shadow alone implies the surface |
| Book with drawn spine and pages | Spine hinge shading on the cover image plus 2:3 near-square corners |
| Pile of books | Stacked series covers (offset copies) |
| Shelf that flips into a "secret door" store | Zoom and morph transitions: the object you tapped becomes the next screen |
| Paper texture background | Plain themed page colors (Calm, Focus, Paper). Paper is suggested by **color temperature only** |
| Glossy plastic buttons | Glass that lenses, catches light, glows under the finger, and flexes like gel |
| Page curl as the only option | Curl as **one option** that tracks the finger; Slide/Fade/Scroll for everyone else |

For FantPub this means the "skeuomorph" brief should be met with **objects and physics** (a book with weight, shadow, a hinge, and an opening that follows your finger), **not textures** (grain, cloth tiling, wax, leather). The rejected design was textures. Apple Books today is objects.

---

## 4. Imitating it on the web, tastefully

### 4.1 Platform reality (FantPub runs in Android Chrome + iOS Safari)
| Feature | Support | Implication |
|---|---|---|
| `backdrop-filter: blur() saturate()` | Every modern engine. Write literal values in both `-webkit-` and unprefixed forms. One source reports CSS variables failing inside `-webkit-backdrop-filter` | Base glass layer for everyone |
| SVG refraction via `backdrop-filter: url(#f)` | **Chromium only.** Firefox passes `@supports` and then draws nothing. Safari has an open bug (https://www.buildmvpfast.com/blog/liquid-glass-css-backdrop-filter-recipes-2026, https://kube.io/blog/liquid-glass-css-svg/, https://github.com/w3c/svgwg/issues/1142) | iOS users never see it. **The design must look finished without refraction.** At most an Android-only extra, gated by UA. Not recommended for v1 |
| `prefers-reduced-transparency` | **Not in iOS Safari** (caniuse through 26.5: https://caniuse.com/wf-prefers-reduced-transparency) | We can't detect the iOS setting. **Ship our own toggle** (iOS 27 has a slider for the same reason) |
| `prefers-contrast: more`, `prefers-reduced-motion`, `prefers-color-scheme` | Broad | Must handle all three |
| View Transitions (same-document) | Baseline since 2025-10-14 (Chrome 111, Safari 18, Firefox 144) | Cover → reader zoom. The repo already uses `viewTransitionName` in `BottomNav.tsx` and has `PageTransition.tsx` |
| Scroll-driven animations | Chrome 115, Safari 26; no Firefox | Fine for the large-title collapse. **Tab-bar minimize depends on scroll direction**, so use a tiny JS listener |
| `corner-shape: squircle` | Chromium 139+ only (https://www.smashingmagazine.com/2026/03/beyond-border-radius-css-corner-shape-property-ui/) | Progressive enhancement only. Don't rely on it |
| SF Pro / New York / SF Symbols | **The license forbids web use** (*"may not use the font to create … website content"*: https://developer.apple.com/forums/thread/733267; SF Symbols terms: https://developer.apple.com/forums/thread/739523) | Use `system-ui` for UI (users get SF on Apple devices legally, Roboto on Android). Use our own serif with Cyrillic for reading/display. Icons must be our own |

Performance guardrails (buildmvpfast, 2026-08):
- **Never animate the blur radius.**
- Keep blur ≤ 20 px on large surfaces.
- No more than **3–4 glass layers per viewport**.
- No permanent `will-change`.
- Low-end Android is the slowest target. Test there first.

### 4.2 Starter code (CSS Modules friendly)

**Glass tokens** (regular variant; values tuned to look like iOS 27, which is frostier than 26):
```css
:root {
  --bg: #fff;
  --glass-fill: rgb(255 255 255 / 0.62);
  --glass-on: #111;                       /* monochrome labels */
  --glass-shadow-rest: 0 6px 20px -8px rgb(0 0 0 / .18);
  --glass-shadow-over-text: 0 10px 28px -6px rgb(0 0 0 / .28);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0b0b0c;
    --glass-fill: rgb(40 40 44 / 0.58);
    --glass-on: #f5f5f7;
  }
}
:root[data-theme="dark"] { --bg:#0b0b0c; --glass-fill: rgb(40 40 44 / .58); --glass-on:#f5f5f7; }

.glass {
  background: var(--glass-fill);
  -webkit-backdrop-filter: blur(14px) saturate(180%);   /* literal values */
  backdrop-filter: blur(14px) saturate(180%);
  color: var(--glass-on);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .85),    /* specular top rim (iOS 27: brighter) */
    inset 0 -1px 0 rgb(255 255 255 / .25),   /* lower inner rim */
    inset 0 0 0 .5px rgb(0 0 0 / .10),       /* iOS 27 "darkened edge" */
    var(--glass-shadow-rest);
}
.glass[data-over-text] { box-shadow: inset 0 1px 0 rgb(255 255 255/.85), inset 0 0 0 .5px rgb(0 0 0/.12), var(--glass-shadow-over-text); }

/* Touch illumination: glow starts under the finger (set --x/--y on pointerdown) */
.glass { position: relative; overflow: hidden; }
.glass::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: radial-gradient(120px circle at var(--x, 50%) var(--y, 50%), rgb(255 255 255 / .45), transparent 70%);
  opacity: 0; transition: opacity .35s;
}
.glass:active::after { opacity: 1; transition-duration: .08s; }

/* User/OS preferences: in-app toggle (iOS Safari can't report Reduce Transparency) + Chromium media query */
:root[data-glass="solid"] .glass {
  background: color-mix(in oklab, var(--bg) 94%, var(--glass-on));
  -webkit-backdrop-filter: none; backdrop-filter: none;
}
@media (prefers-reduced-transparency: reduce) {
  .glass { background: color-mix(in oklab, var(--bg) 94%, var(--glass-on)); -webkit-backdrop-filter: none; backdrop-filter: none; }
}
@media (prefers-contrast: more) {
  .glass { background: var(--bg); -webkit-backdrop-filter: none; backdrop-filter: none; box-shadow: 0 0 0 1.5px var(--glass-on); }
}
```

**Floating tab bar** (the iOS 26/27 numbers, in CSS px = pt):
```css
.tabbar {                       /* capsule */
  position: fixed; left: 21px; right: 21px;
  bottom: max(21px, env(safe-area-inset-bottom));
  height: 62px; border-radius: 31px; padding: 4px;
  display: grid; grid-auto-flow: column; grid-auto-columns: 1fr;
  transition: transform .5s var(--snappy);   /* transform only: compositor-friendly */
}
.tab[aria-current="page"] {     /* concentric pill: 31 − 4 = 27 */
  border-radius: 27px;
  background: rgb(0 0 0 / .07);  /* a fill, NOT glass-on-glass */
}
.tab { display:grid; place-items:center; font: 600 11px/1 system-ui; gap: 2px; }
.tabbar[data-min="true"] { transform: scale(.82) translateY(6px); }  /* minimize on scroll down.
   ponytail: uniform scale; iOS actually collapses to the selected tab (+ inline accessory). Upgrade if the accessory ships */
```
```js
// ponytail: direction-based minimize; scroll-driven CSS can't read direction
let last = scrollY;
addEventListener('scroll', () => {
  const y = scrollY, d = y - last;
  if (Math.abs(d) < 8) return;
  bar.dataset.min = String(d > 0 && y > 80);
  last = y;
}, { passive: true });
```

**Scroll edge effect (soft)** for the area under top/bottom glass. It blurs and fades the content and is not a dark overlay:
```css
.edgeTop {
  position: fixed; inset: 0 0 auto; height: calc(env(safe-area-inset-top) + 64px);
  pointer-events: none;
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
  -webkit-mask-image: linear-gradient(#000 35%, transparent);
          mask-image: linear-gradient(#000 35%, transparent);
  background: linear-gradient(var(--bg), transparent);   /* dark themes: dims instead */
}
```

**Apple-accurate book cover** (from the §2.4 measurements):
```css
.cover {
  position: relative; aspect-ratio: 2 / 3; border-radius: 1.5px 2.5px 2.5px 1.5px;
  box-shadow: 0 12px 22px -10px rgb(0 0 0 / .32), 0 2px 5px rgb(0 0 0 / .10);
}
.cover img { width: 100%; height: 100%; object-fit: cover; border-radius: inherit; display: block; }
.cover::after {                 /* hinge + hairline, on top of the art */
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: linear-gradient(90deg,
    rgb(0 0 0 / .45) 0%, rgb(0 0 0 / .10) .9%,
    rgb(255 255 255 / .28) 2%, rgb(255 255 255 / 0) 2.9%,
    rgb(0 0 0 / .08) 3.7%, rgb(0 0 0 / 0) 6.3%);
  box-shadow: inset 0 0 0 .5px rgb(0 0 0 / .22);
}
.stack .cover:nth-child(2) { position: absolute; transform: translate(-10%, -6%); z-index: -1; }  /* series/week stack */
```

**Springs.** SwiftUI's presets are verified in the docs: `.smooth` bounce 0, `.snappy` bounce 0.15, `.bouncy` bounce 0.3, all with a default perceptual duration of 0.5 s (https://developer.apple.com/documentation/swiftui/animation/snappy(duration:extrabounce:)). The `linear()` versions below are my own integration of the damped spring with ζ = 1 − bounce:
```css
:root {
  /* .snappy ≈ 640ms, 0.6% overshoot — default for UI */
  --snappy: linear(0, .047, .154, .287, .422, .548, .658, .749, .821, .878, .920, .951, .972, .987, .996, 1.002, 1.005, 1.006, 1.006, 1.005, 1.004, 1.003, 1);
  /* .bouncy ≈ 730ms, 4.6% overshoot — only for the wow moment (book opens) */
  --bouncy: linear(0, .061, .201, .372, .542, .693, .815, .908, .972, 1.013, 1.036, 1.045, 1.045, 1.041, 1.033, 1.025, 1.018, 1.011, 1.006, 1.003, 1);
}
@media (prefers-reduced-motion: reduce) { :root { --snappy: ease-out; --bouncy: ease-out; } }
```

**Menus that bloom from their button** (Apple: *"the bubble simply pops open"*): give the popover a `transform-origin` at the trigger corner, enter from `scale(.6); opacity:0` to `1` over 0.5 s `var(--snappy)` using `@starting-style`. Stack the items as separate glass capsules, as in the Books menu.

**Cover → reader** (shared element):
```css
.todayCover { view-transition-name: book-cover; }    /* on Home */
.readerHero { view-transition-name: book-cover; }    /* on /rasskaz/[slug] */
::view-transition-group(book-cover) { animation-duration: .7s; animation-timing-function: var(--bouncy); }
@media (prefers-reduced-motion: reduce) { ::view-transition-group(*) { animation-duration: .2s; } }
```

### 4.3 DO
1. **Two layers, strictly.** Content (paper, text, covers, Pabchik) is opaque and rich. Glass is used **only** for: the tab bar, the reader top/bottom controls, the settings sheet, menus/popovers and toasts. That's ≤ 3 glass surfaces on screen.
2. **Floating capsule tab bar** at the measured numbers (62 / 21 / 4 / 27). FantPub's tabs "Сегодня · Архив · Полка" fit one capsule. Leave out Search until search exists.
3. **Concentric radii everywhere:** inner = outer − padding. Capsules near screen edges. Sheets use large radii (≈ 32–38 px) and sit 8 px inset from the edges when half-height.
4. **Covers drawn like Apple's:** 2:3, ~1.5 px corners, hairline, hinge gradient, downward soft shadow, bottom baseline alignment, stacks for weeks/series. This is the whole "skeuomorphism" budget.
5. **Color from the cover.** Store a `tint` color per story (frontmatter) and use it for the today hero background (like the Books product page), the "Продолжить" card (like Books "Continue") and the share card. The glass then picks it up for free.
6. **Serif display + system UI.** Big serif headline ("Сегодня", the story title, the reading-time numerals) and `system-ui` labels.
7. **Reader chrome hidden by default.** A tap toggles it. Top: X (leading, per the 2026 HIG) plus a small grey "≈ 4 мин до конца". Bottom: a thin progress bar plus an "Aa" button (trailing). This copies 27.2.
8. **Settings sheet like Books:** an "A | A" capsule plus 3 theme tiles showing "Aa" in the real font and colors, plus "Ещё" for fonts and spacing. Mark the selected tile with a 2.5 px outline.
9. **Progress as objects,** after Reading Goals: week dots (S M T W …, partial rings), "this year" slots numbered 2, 3, …, and a gauge in serif numerals. The blind-guess result fits the same style.
10. **Motion = snappy for UI, bouncy only for the hero moment** (opening the day's book). Glass enters by scaling and fading, never by animating blur.
11. **An "Стекло: обычное / плотное" setting** (or a slider) stored in localStorage, because iOS Safari doesn't expose Reduce Transparency. Also honor `prefers-contrast: more` with solid fills and 1.5 px borders.
12. **Dim before clear glass:** any control over the full-bleed hero cover gets a 35% black dim behind it, or sits on regular glass.

### 4.4 DON'T: what reads as a cheap imitation / AI slop
1. **Glass cards in content.** Story cards, archive tiles and calendar cells must not be frosted. Apple explicitly forbids this, and it is the #1 tell of a "glassmorphism template".
2. **Glass on glass.** No frosted buttons inside a frosted sheet; use flat fills (`rgb(0 0 0/.06)`).
3. **Gradient blobs/orbs placed behind glass** just so the blur has something to show. Apple's glass sits over *real* content.
4. **Thick white borders, outer glows, rainbow/iridescent `border-image`, neon rims.** Apple's rim is a 1 px highlight plus a 0.5 px dark edge, and that's all.
5. **Heavy refraction or chromatic-aberration demos** (SVG displacement everywhere). Apple confines lensing to the rim. It also wouldn't render on iOS Safari, so iPhone users would see a different product.
6. **Animating `backdrop-filter`.** It drops to ~30 fps on phones and is exactly what the HIG's reduce-motion guidance tells you to avoid.
7. **Tinting every button** in the brand color. Tint one primary CTA per screen ("Читать"); everything else stays monochrome.
8. **Low-contrast text on clear glass over busy art.** Apple added the darkened edge, more frost and a slider in iOS 27 *because of this*. Keep text 4.5:1.
9. **Textures as "skeuomorphism":** wood shelves, leather, paper grain overlays, cloth tiling, stitched edges, wax seals. That is the rejected design, and it's 2010 Apple. 2026 Apple is objects + light + motion.
10. **Apple's assets or identity:** SF Pro/New York webfonts, SF Symbols, the Books orange, "Book Store" wording, fake iOS status bars or device frames. These are license problems, they look foreign on Android, and they read as a clone.
11. **Fake 3D everywhere:** perpetual tilt on every cover, or gyroscope parallax (iOS requires a permission prompt for device orientation). Use one 3D moment (the day's book opening), not ambient wobble.
12. **Bouncy springs on everything.** Overshoot on every tap feels like a toy. Apple uses bounce 0.15 for UI and saves larger bounce for delight.
13. **Several scroll-edge gradients / dark overlays "for legibility"** where nothing floats. Apple: one per view, only under floating UI.
14. **Solid-colored bars.** Apple moved bar color into content; a colored tab bar instantly reads as pre-2025.
15. **Curl as a default on the web.** A curl that doesn't track the finger is worse than none (Apple removed it once). If you do it, make it finger-tracked and opt-in, like Books.

---

## 5. Mapping onto FantPub components (no edits made; this is guidance)

| FantPub file | Apple Books analogue | Change |
|---|---|---|
| `src/components/BottomNav.tsx` (+ .module.css) | Floating glass tab bar | 62 px capsule, 21 px insets, concentric selected pill, monochrome icons, minimize on scroll down. Optional **accessory** above it: "Продолжить: «Название» · 4 мин" while a story is unfinished (the MiniPlayer pattern; the HIG allows it for persistent features only) |
| `TodayHero.tsx`, `Book3D.tsx`, `Cover.tsx`, `Spine.tsx` | Books product page + Continue card | Cover-tinted full-bleed hero, Apple-accurate cover rendering (§4.2), one bouncy cover → reader view transition. Drop tiled motifs and seal textures |
| `WeekShelf.tsx`, `ShelfView.tsx`, `ArchiveView.tsx`, `CalendarView.tsx` | Library grid + stacks + Reading Goals | Covers on a common baseline with shadow, no drawn shelf. Weeks as stacks. Calendar/streak as week dots and numbered slots |
| `reader/ReaderBar.tsx` | 27.2 reader chrome | Hidden by default, tap to toggle. X leading, "≈ N мин" top, thin progress bar + "Aa" trailing, glass circles 44 px |
| `reader/SettingsSheet.tsx` | Themes & Settings | Inset glass sheet, X leading, "A \| A" capsule, theme tiles with "Aa" previews, "Ещё" for fonts. Fills inside, not glass |
| `reader/EndOfStory.tsx`, `Pabchik.tsx` | End-of-sample glass card / Reading Goals | Content layer (opaque paper card). At most one floating glass card for the CTA |
| `PageTransition.tsx` | Zoom transition | Keep View Transitions, switch to a shared `book-cover` name, `--bouncy` only here, crossfade under reduced motion |

---

## Sources (primary first)
- Apple HIG: Materials https://developer.apple.com/design/human-interface-guidelines/materials · Tab bars https://developer.apple.com/design/human-interface-guidelines/tab-bars · Sheets https://developer.apple.com/design/human-interface-guidelines/sheets · Toolbars https://developer.apple.com/design/human-interface-guidelines/toolbars · Color https://developer.apple.com/design/human-interface-guidelines/color · Accessibility https://developer.apple.com/design/human-interface-guidelines/accessibility
- Adopting Liquid Glass https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass
- WWDC25 Meet Liquid Glass https://developer.apple.com/videos/play/wwdc2025/219/ · WWDC25 Get to know the new design system https://developer.apple.com/videos/play/wwdc2025/356/
- WWDC26 Platforms State of the Union https://developer.apple.com/videos/play/wwdc2026/102/ · WWDC26 Communicate your brand identity on iOS https://developer.apple.com/videos/play/wwdc2026/251/
- Apple Newsroom: 2025-06 new design https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/ · 2026-06 iOS 27 https://www.apple.com/newsroom/2026/06/apple-unveils-next-generation-of-apple-intelligence-siri-ai-and-more/ · 2026-09 iPhone Duo https://www.apple.com/newsroom/2026/09/apple-unveils-iphone-duo/ · 2018 Apple Books https://www.apple.com/newsroom/2018/06/apple-books-all-new-for-iphone-and-ipad-celebrates-reading/
- Apple Support (iOS 27 guide): Read books https://support.apple.com/guide/iphone/read-books-iphc1af7c57/ios · Reading goals https://support.apple.com/guide/iphone/set-reading-goals-iph6013e96f4/ios · Organize https://support.apple.com/guide/iphone/organize-books-iphab219b91/ios
- Mobbin Apple Books: reading flow https://mobbin.com/flows/328cdde7-bf7c-47f7-85a5-0e06f5d34e78 · sample flow https://mobbin.com/flows/f12e0c84-531c-49dd-be84-edeea05d53ec · Library https://mobbin.com/screens/fb8d6cde-a349-4b0b-a1d5-4fbbc3fce77f · Home https://mobbin.com/screens/ef25171d-f4a6-43ed-a0a2-375e835230f8 · More to Explore https://mobbin.com/screens/f4688b5b-bbd4-43aa-9da7-edd780d338fb · Themes https://mobbin.com/screens/fea5dd1a-687e-4474-9647-9aac99c10b15 · Dark themes https://mobbin.com/screens/e934326b-c637-4937-9a5f-6b05c3cc0a08 · Menu https://mobbin.com/screens/fda02365-2264-4eff-a55e-7850616e58bf · Line guide https://mobbin.com/screens/f574a03a-68c3-4790-9237-ba975c2714f0
- Press: 9to5Mac 27.2 Books https://9to5mac.com/2026/10/06/ios-27-2-gives-apple-books-new-design-updates-as-iphone-duo-nears/ · MacRumors iOS 27 https://www.macrumors.com/2026/09/14/apple-releases-ios-27/ · MacRumors slider https://www.macrumors.com/how-to/ios-27-tone-down-liquid-glass-transparency/ · TidBITS 26.1 https://tidbits.com/2025/10/21/ios-26-1-to-add-optional-opacity-to-liquid-glass/ · TidBITS iOS 16 Books https://tidbits.com/2022/10/03/apples-books-ios-16/ · TechCrunch iOS 7 iBooks https://techcrunch.com/?p=914973 · iPhone in Canada 2010 https://www.iphoneincanada.ca/2010/01/27/apple-reveals-ibooks-store-for-ipad/ · Basic Apple Guy https://basicappleguy.com/basicappleblog/build-a-better-books · Wikipedia Liquid Glass https://en.wikipedia.org/wiki/Liquid_Glass · Apple Books https://en.wikipedia.org/wiki/Apple_Books
- Web: kube.io refraction https://kube.io/blog/liquid-glass-css-svg/ · buildmvpfast recipes https://www.buildmvpfast.com/blog/liquid-glass-css-backdrop-filter-recipes-2026 · caniuse reduced transparency https://caniuse.com/wf-prefers-reduced-transparency · Smashing corner-shape https://www.smashingmagazine.com/2026/03/beyond-border-radius-css-corner-shape-property-ui/ · LearnUI iOS 26 https://www.learnui.design/blog/ios-design-guidelines-templates.html · Apple font licensing (forums) https://developer.apple.com/forums/thread/733267
