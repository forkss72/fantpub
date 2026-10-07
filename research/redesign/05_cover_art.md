# 05 · Cover art from public-domain museum collections

Date: 2026-10-07. Scope: replace the generated cloth covers with real paintings and prints, the way Standard Ebooks and Penguin Classics do, so that the shelf reads as real books, as Apple Books does. The output is 2 candidates for each of the 24 stories. Every image URL was HEAD-checked; the machine-readable list is `05_cover_art.json`, in the same folder as this file.

## 0. Bottom line

- **All 24 stories are covered with 48 candidates; 48 of 48 image URLs returned `200 image/jpeg`** on a `curl -sI` HEAD (AIC requests carried the `AIC-User-Agent` header; see §2). 35 of the 48 come straight from CC0 or PDM museum APIs (Met 23, AIC 7, SMK 3 (PDM), CMA 2); 13 come via Wikimedia Commons. Those 13 are Russian museum works (Tretyakov ×4, Yaroslavl ×1), an 18th-c. lubok, plus Getty, SAAM, Detroit, the Alte Nationalgalerie ×2, the Hamburger Kunsthalle and the Library of Congress.
- **Candidate A is my primary pick for each story.** Both candidates were chosen to keep the twist intact. A–B order also follows the blind-mode rule in §5: no famous illustration of the same text goes in slot A.
- **Do not hotlink.** Every source misbehaved for scripted access today: AIC returns a Cloudflare 403 without its header, Commons returns 429 with `retry-after: 600`, LOC and si.edu sit behind challenge pages, and the old Met and Rijksmuseum search endpoints are retired. Download each chosen master once, downscale it, commit it to `web/public/covers/` (the folder exists and is empty) and let `next/image` produce AVIF/WebP.
- **Do the 2:3 crop in CSS.** Store a focal point per story and use `object-fit: cover; object-position: fx fy`. No pre-cropped variants are needed. 18 of the 48 picks are landscape and crop well around one motif (crop notes in the tables).
- **Recommended system:** real art in an image layer, plus a strict typographic plate built in code, plus a credit line. This is the Standard Ebooks / Penguin model. AI illustration loses on perception, law and distinctiveness for this audience (§6).

## 1. Why fine art, and what "Apple Books-like" means for covers

- Apple Books leans on the cover as the hero object. Real, varied publisher art sits on a neutral or blurred-cover background, and the chrome (Liquid Glass in iOS 26) floats over it. The covers supply the colour, not the UI. Our cloth-and-motif covers look like one product 24 times. Real paintings look like 24 different books.
- Standard Ebooks, the closest analogue (free, public-domain texts, high craft), puts a public-domain painting on every cover with one uniform title block. Their rule, from [How to choose and create a cover image](https://standardebooks.org/contribute/how-tos/how-to-choose-and-create-a-cover-image), is that art must be *provably* public domain in the US by one of three proofs: (1) their [artwork database](https://standardebooks.org/artworks); (2) a museum that releases the work under **CC0** ("S.E. does not accept other public domain declarations (not even … CC-PDM)"); (3) a reproduction in a book published before 1 Jan 1931. That is a useful conservative bar. Their database already holds several of our candidates or close siblings with proofs: Menzel *Das Ballsouper*, Sargent *Madame X*, four Vereshchagins and Kuindzhi's *Red Sunset on the Dnieper*.
- Penguin Classics (black spine) uses the same pattern: a fine-art crop with a fixed typographic band. That pairing is why these series look curated rather than generated.

## 2. Source matrix (tested live 2026-10-07)

| Source | Licence of images | How I searched | Hi-res image endpoint | Scripted-access gotchas found today |
|---|---|---|---|---|
| The Met | CC0 when `isPublicDomain=true` ([Open Access](https://www.metmuseum.org/hubs/open-access)) | **`/public/collection/v1/search` was retired on 2026-10-01** (returns a JSON notice). Use `/public/collection/v1.1/search?q=…&hasImages=true&limit=&offset=` (paginated), then `/v1/objects/{id}` | `primaryImage` (`/CRDImages/<dept>/original/…`, 3–5 MB, ~4000 px), `primaryImageSmall`, `additionalImages[]` | `isPublicDomain` query filter did not filter, so check each object. Stieglitz prints are `isPublicDomain:false` at the Met. For Durand's *In the Woods* the primary image is 825 px but `additionalImages[0]` is 2582×3202 |
| Art Institute of Chicago | CC0 when `is_public_domain=true` ([policy](https://www.artic.edu/open-access/open-access-images)) | `api.artic.edu/api/v1/artworks/search?q=…&fields=id,title,artist_title,date_display,image_id,is_public_domain,thumbnail&query[term][is_public_domain]=true` | IIIF `https://www.artic.edu/iiif/2/{image_id}/full/{w},/0/default.jpg`, with w ≤ native width (843 or 1686 recommended) | **403 Cloudflare challenge without the header `AIC-User-Agent: <app name>`**; 200 with it. Asking for a width larger than the native width gives 403 |
| Cleveland Museum of Art | CC0 ([open access](https://www.clevelandart.org/open-access)) | `openaccess-api.clevelandart.org/api/artworks/?q=…&cc0=1&has_image=1` | `images.print.url` (~3400 px) / `images.full.url` | none |
| SMK, Copenhagen | **Public Domain Mark 1.0** (`rights` field), not CC0 | `api.smk.dk/api/v1/art/search/?keys=…&filters=[public_domain:true],[has_image:true]`; details via `/api/v1/art/?object_number=…` | IIIF `{image_iiif_id}/full/!3000,3000/0/default.jpg` (CORS `*`) | Search results omit artist names; fetch details. PDM is legally fine, but Standard Ebooks would not accept it |
| Wikimedia Commons | PD-Art / PD-old templates | Commons API `generator=search`, Wikidata `wbsearchentities` + P18 | `upload.wikimedia.org/…` original | **429 with `retry-after: 600` after ~40 requests in a few minutes**; Wikidata SPARQL answered 429 "1 req/min during outage" |
| Smithsonian (SAAM) | CC0 for Open Access objects | `api.si.edu/openaccess/api/v1.0/search` | `ids.si.edu/ids/deliveryService?id=…` | API timed out (HTTP 000); `si.edu` pages return 403 to curl. I used the Commons copy of the SAAM image |
| National Gallery of Art | CC0 | no live search API: open-data CSVs at github.com/NationalGalleryOfArt/opendata | `api.nga.gov/iiif/{uuid}/…` | not used (needs the CSV, which is large) |
| Rijksmuseum | CC0 | **old `/api/en/collection` now returns 410 Gone**; new Linked Art search `data.rijksmuseum.nl/search/collection?title=…` works keyless | via Linked Art → IIIF | not used (heavy parsing, few Russian-mood fits) |
| Nationalmuseum Sweden | PD (their PD images are mirrored on Commons) | `api.nationalmuseum.se/api/objects?query=…` works | — | poor text search, so not used |
| Getty | Open Content Program, "free of restrictions" ([program](https://www.getty.edu/projects/open-content-program/)) | `data.getty.edu` search 404 | — | used via Commons (Dürer) |
| Library of Congress | "No known restrictions" posters | — | — | Cloudflare challenge (403), so used the Commons mirror (Kellar) |
| Tretyakov / Russian Museum | no open-access licence; works are PD by age | Commons only | Commons originals (1000–2000 px typical) | resolution is the bottleneck (see per-story caveats) |

## 3. Rights rules applied

- **"PD everywhere" test.** (a) The artist died in or before 1955, so the work is PD in every life+70 country in 2026 (EU, RU baseline). (b) For Russia, add 4 years if the author worked or fought during the Great Patriotic War, which would push Soviet artists who died 1942–1951 to life+74. None of our picks falls in that window: Petrov-Vodkin died in 1939. (c) In the US the work was published or made before 1931. Every candidate passes. Most artists died before 1911; the latest deaths are Stieglitz 1946, Petrov-Vodkin 1939, Hassam 1935, Sargent 1925, Hammershøi 1916 and Redon 1916.
- **Avoided:** Dobuzhinsky (d. 1957) and Ostroumova-Lebedeva (d. 1955, worked in besieged Leningrad, so RU life+74 runs to 2030). Their 1919–21 Petrograd prints would be perfect for *Пещера* but are not safely PD in Russia. Also avoided: Steichen (d. 1973), Bilibin-era illustrators who died after 1955, and Harry Clarke's Poe plates (fine legally, but they illustrate the ending).
- **Photos of 2D artworks.** US: no new copyright (Bridgeman v. Corel, 1999). EU: Art. 14 of Directive 2019/790 says reproductions of PD visual art carry no copyright. **Russia: no explicit rule, and the Tretyakov and Russian Museum license their own photographs commercially.** The risk is low in practice but not zero. Mitigations: prefer CC0 museum files; for Russian works use Commons scans that come from pre-1931 books or Google Art Project, and credit them. The *Мыши кота погребают* lubok is itself a scan from Rovinsky's 1881 *Русские народные картинки*, which also satisfies the Standard Ebooks pre-1931-book proof.
- **Credit every cover**, even under CC0: it builds trust and adds SEO text. Format: `Обложка: Василий Верещагин, «Двери Тимура (Тамерлана)», 1872. Государственная Третьяковская галерея. Общественное достояние.` Do not imply museum endorsement or use museum logos.
- **Content check:** Petrov-Vodkin's rider is nude; La Tour includes a skull; Holbein includes a skull. None is gory. No candidate depicts a twist or an ending. The one flagged image is the Beardsley (slot B), which shows the midnight intruder, i.e. the climax.

## 4. Per-story candidates

Visual check: `05_cover_art_contact.jpg` (same folder) renders all 48 picks at their 2:3 focal crop. Stories are numbered by issue. A = primary. Pixel sizes are of the linked file. "Crop" means the 2:3 portrait window to centre on.


### 01 · Гробовщик · Александр Пушкин · ироничное

Hook: «Один неудачный тост — и гробовщик зовёт на новоселье тех, кого обычно не зовут.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Hans Holbein the Younger** (d. 1543) — *Coat-of-Arms of Death, from "The Dance of Death"*, ca. 1526, published 1538 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/365213) | [3068×4000 px](https://images.metmuseum.org/CRDImages/dp/original/DP-23051-001.jpg) · ✅ 200 · portrait | Heraldic shield with a skull, like a tradesman's sign: the undertaker's craft as a coat of arms. Ironic memento mori that matches Pushkin's deadpan tone and Adrian's signboard with the Cupid and inverted torch; reads at thumbnail size. It does not show the dream device or the waking-up ending. **Crop:** focal 50%/55%. |
| B | **Unknown Russian lubok master** — *Мыши кота погребают (The Mice Bury the Cat)*, 18th c. (reproduced in Rovinsky, 1881) | Wikimedia Commons (scan of D. Rovinsky, «Русские народные картинки») · [Public domain (anonymous 18th c.; PD-old)](https://commons.wikimedia.org/wiki/File:%D0%9C%D1%8B%D1%88%D0%B8_%D0%BA%D0%BE%D1%82%D0%B0_%D0%BF%D0%BE%D0%B3%D1%80%D0%B5%D0%B1%D0%B0%D1%8E%D1%82.jpg) · [object page](https://commons.wikimedia.org/wiki/File:%D0%9C%D1%8B%D1%88%D0%B8_%D0%BA%D0%BE%D1%82%D0%B0_%D0%BF%D0%BE%D0%B3%D1%80%D0%B5%D0%B1%D0%B0%D1%8E%D1%82.jpg) | [5245×3306 px](https://upload.wikimedia.org/wikipedia/commons/4/43/%D0%9C%D1%8B%D1%88%D0%B8_%D0%BA%D0%BE%D1%82%D0%B0_%D0%BF%D0%BE%D0%B3%D1%80%D0%B5%D0%B1%D0%B0%D1%8E%D1%82.jpg) · ✅ 200 · landscape | A Russian folk-print funeral procession played as farce. Same register as the undertaker's housewarming, recognisable to a Russian reader. Crop 2:3 on the cat-on-sledge group; black-and-white line art takes a duotone well. **Crop:** focal 40%/30%. ⚠️ Line reproduction from an 1881 book with typeset caption below; busy composition — crop tight on the procession (focal 40/30) and zoom ~1.5×. Weakest pick; B only. |

### 02 · Перед законом · Франц Кафка · тревожное

Hook: «Ворота открыты, привратник отошёл в сторону. Казалось бы, в чём трудность?»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Vasily Vereshchagin** (d. 1904) — *Двери Тимура (Тамерлана) / Doors of Tamerlane*, 1872 | State Tretyakov Gallery (image via Wikimedia Commons) · [Public domain (PD-Art; author d. 1904)](https://commons.wikimedia.org/wiki/File:%D0%94%D0%B2%D0%B5%D1%80%D0%B8_%D0%A2%D0%B8%D0%BC%D1%83%D1%80%D0%B0_(%D0%A2%D0%B0%D0%BC%D0%B5%D1%80%D0%BB%D0%B0%D0%BD%D0%B0).jpg) · [object page](https://commons.wikimedia.org/wiki/File:%D0%94%D0%B2%D0%B5%D1%80%D0%B8_%D0%A2%D0%B8%D0%BC%D1%83%D1%80%D0%B0_(%D0%A2%D0%B0%D0%BC%D0%B5%D1%80%D0%BB%D0%B0%D0%BD%D0%B0).jpg) | [1625×2048 px](https://upload.wikimedia.org/wikipedia/commons/a/a1/%D0%94%D0%B2%D0%B5%D1%80%D0%B8_%D0%A2%D0%B8%D0%BC%D1%83%D1%80%D0%B0_%28%D0%A2%D0%B0%D0%BC%D0%B5%D1%80%D0%BB%D0%B0%D0%BD%D0%B0%29.jpg) · ✅ 200 · portrait | Nearly a literal illustration of the parable: two motionless guards in front of a monumental closed door. Portrait format, strong symmetry, survives a 2:3 crop with no loss. Does not show the doorkeeper's final words. **Crop:** focal 50%/50%. |
| B | **Giovanni Battista Piranesi** (d. 1778) — *The Drawbridge, from "Carceri d'invenzione" (Imaginary Prisons)*, ca. 1749–50 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/337060) | [2847×3762 px](https://images.metmuseum.org/CRDImages/dp/original/DP828200.jpg) · ✅ 200 · portrait | Piranesi's Imaginary Prisons: endless stairs, bridges and gates leading nowhere, the bureaucratic infinity behind the first door. A dense etching, so it works as a monochrome plate under glass. **Crop:** focal 50%/50%. |

### 03 · Зелёная лампа · Александр Грин · светлое

Hook: «Десять фунтов в месяц за лампу на подоконнике. Наниматель уверен, что пошутил удачно.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Carl Gustav Carus** (d. 1869) — *Schloss Milkel in Moonlight*, ca. 1833–35 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/788905) | [3198×4000 px](https://images.metmuseum.org/CRDImages/ep/original/DP-16387-001.jpg) · ✅ 200 · portrait | A single warm window in a dark house at night: the lamp on the windowsill that the plot hangs on. Portrait, centred, high contrast. A calm, hopeful night scene, not a gloomy one. **Crop:** focal 60%/45%. |
| B | **James McNeill Whistler** (d. 1903) — *Reading by Lamplight*, 1859 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/372692) | [2367×3099 px](https://images.metmuseum.org/CRDImages/dp/original/DP813284.jpg) · ✅ 200 · portrait | A figure reading under a lamp: the long evenings spent by the lamp, kept quiet. Etching, takes tinting well. **Crop:** focal 45%/55%. |

### 04 · Бал · Владимир Одоевский · тревожное

Hook: «Бал в честь победы, оркестр в ударе. Капельмейстер очень старался — в этом и беда.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Adolph Menzel** (d. 1905) — *Das Ballsouper (Supper at the Ball)*, 1878 | Alte Nationalgalerie, Berlin (image via Wikimedia Commons / Google Art Project) · [Public domain (PD-Art; author d. 1905)](https://commons.wikimedia.org/wiki/File:Adolph_Menzel_-_Das_Ballsouper_-_Google_Art_Project.jpg) · [object page](https://commons.wikimedia.org/wiki/File:Adolph_Menzel_-_Das_Ballsouper_-_Google_Art_Project.jpg) | [3543×2785 px](https://upload.wikimedia.org/wikipedia/commons/e/e7/Adolph_Menzel_-_Das_Ballsouper_-_Google_Art_Project.jpg) · ✅ 200 · landscape | Candles, gilding and a suffocating crush: the glittering, slightly feverish ball Odoevsky describes ('тонкий чад… над бесчисленными тускнеющими свечами'). Crop on the chandelier and the crowd below it. No skeletons, so no spoiler. **Crop:** focal 45%/40%. |
| B | **Paul Gavarni** (d. 1866) — *The Masked Ball*, 1834 | Art Institute of Chicago · [CC0 1.0 — AIC Open Access (is_public_domain=True)](https://www.artic.edu/open-access/open-access-images) · [object page](https://www.artic.edu/artworks/13586) | [2372×3000 px](https://www.artic.edu/iiif/2/149346ac-ebd3-4ee1-13fb-5b811e935dd6/full/1686,/0/default.jpg) · ✅ 200 · portrait | Gavarni's masked ball of 1834, the same year as Odoevsky's text (1833). Faces half-hidden in a dense crowd hint at 'what is under the masks' without showing it. Portrait lithograph. **Crop:** focal 50%/40%. (Fetch with header `AIC-User-Agent`.) |

### 05 · Робинзоны · Аркадий Аверченко · ироничное

Hook: «Робинзонада, где главная опасность — не дикари, а служебное рвение.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Winslow Homer** (d. 1910) — *Palm Tree, Nassau*, 1898 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/11131) | [2800×4000 px](https://images.metmuseum.org/CRDImages/ad/original/DP-21448-001.jpg) · ✅ 200 · portrait | One palm, a strip of shore, the sea: the desert-island premise reduced to a single deadpan sign. Portrait watercolour with a clean silhouette; fits the dry satirical tone. **Crop:** focal 50%/50%. |
| B | **Ivan Konstantinovich Aivazovsky (Hovhannes Aivazian)** (d. 1900) — *A Ship in a Stormy Sea*, 1892 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/435570) | [4000×2002 px](https://images.metmuseum.org/CRDImages/ep/original/DP-27364-001.jpg) · ✅ 200 · landscape | Aivazovsky's ship in a storm: the shipwreck the story opens with, by the most Russian of marine painters. Small oil sketch; crop on the ship. **Crop:** focal 62%/40%. |

### 06 · Леди или тигр? · Фрэнк Стоктон · загадочное

Hook: «Две одинаковые двери: за одной тигр, за другой свадьба. И принцесса, которая знает, где что.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Jean-Léon Gérôme** (d. 1904) — *Woman at a Balcony*, 1887–88 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/685040) | [3201×3874 px](https://images.metmuseum.org/CRDImages/ep/original/DP354143.jpg) · ✅ 200 · portrait | A richly dressed woman at a carved balcony looking down: the princess in the arena box, with an unreadable gesture. Portrait, no tiger, so it preserves the open question. **Crop:** focal 50%/40%. |
| B | **Eugène Delacroix** (d. 1863) — *Royal Tiger*, 1829 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/337104) | [3731×2623 px](https://images.metmuseum.org/CRDImages/dp/original/DP852114.jpg) · ✅ 200 · landscape | Delacroix's 'Royal Tiger' lithograph: the beast already named in the hook, at rest and waiting. A horizontal print, so crop on the head; as a monochrome plate it pairs well with a gold title. **Crop:** focal 77%/62%. |

### 07 · Кошки Ультара · Говард Лавкрафт · жуткое

Hook: «Легенда о происхождении одного закона. Мораль ясна с первой строки, жуть подкрадывается по-кошачьи.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Édouard Manet** (d. 1883) — *The Cats' Rendezvous*, 1868 | Art Institute of Chicago · [CC0 1.0 — AIC Open Access (is_public_domain=True)](https://www.artic.edu/open-access/open-access-images) · [object page](https://www.artic.edu/artworks/68825) | [1767×2250 px](https://www.artic.edu/iiif/2/752c8b28-5873-2ddb-f7cd-6ea9e4766195/full/1686,/0/default.jpg) · ✅ 200 · portrait | Black cat and white cat meeting on the rooftops at night, poster-graphic. Uncanny but playful, like the story's 'creeping' dread. Portrait, central motif. **Crop:** focal 50%/50%. (Fetch with header `AIC-User-Agent`.) |
| B | **Utagawa Hiroshige** (d. 1858) — *Pilgrimage to the Torinomachi Festival across the Ricefields of Asakusa (Asakusa tanbo Torinomachi mōde), from the series One Hundred Famous  Views of Edo (Meisho Edo hyakkei)*, 1857 (Ansei 4), 11th month | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/36539) | [2627×3905 px](https://images.metmuseum.org/CRDImages/as/original/DP121510.jpg) · ✅ 200 · portrait | A white cat on a windowsill watching a distant procession: calm, ancient, observing humans. Vertical ōban print, crops cleanly to 2:3. **Crop:** focal 50%/50%. |

### 08 · То, чего не было · Всеволод Гаршин · ироничное

Hook: «Под вишней спорят о смысле жизни жук, муравей, улитка и старая лошадь. Никто не уступает.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Albrecht Dürer** (d. 1528) — *Stag Beetle (Hirschkäfer)*, 1505 | J. Paul Getty Museum (image via Getty Open Content / Wikimedia Commons) · [Getty Open Content Program, free of restrictions (PD)](https://www.getty.edu/projects/open-content-program/) · [object page](https://commons.wikimedia.org/wiki/File:Albrecht_D%C3%BCrer_-_Hirschk%C3%A4fer_(1505).jpg) | [3525×4383 px](https://upload.wikimedia.org/wikipedia/commons/f/f0/Albrecht_D%C3%BCrer_-_Hirschk%C3%A4fer_%281505%29.jpg) · ✅ 200 · portrait | One beetle, monumental, on blank paper: an insect taken with full philosophical seriousness, the joke of Garshin's debating insects. Perfect portrait centre motif. **Crop:** focal 50%/45%. |
| B | **Maria Sibylla Merian** (d. 1717) — *Study of Capers, Gorse, and a Beetle*, 1693 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/399922) | [1310×1803 px](https://images.metmuseum.org/CRDImages/dp/original/DP822404.jpg) · ✅ 200 · portrait | Merian's botanical study with a beetle on the stem: the 'under the cherry tree' garden world at insect scale. Light, airy, portrait. **Crop:** focal 50%/50%. |

### 09 · Как это случилось · Артур Конан Дойл · тревожное

Hook: «Ночь, новый автомобиль, крутой спуск — и тормоза, которые отказывают один за другим.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **John Atkinson Grimshaw** (d. 1893) — *Lane Scene at Night*, 1872 | Art Institute of Chicago · [CC0 1.0 — AIC Open Access (is_public_domain=True)](https://www.artic.edu/open-access/open-access-images) · [object page](https://www.artic.edu/artworks/273331) | [5787×7755 px](https://www.artic.edu/iiif/2/cf36b3c1-c792-8529-822e-ddcacfcc26e2/full/1686,/0/default.jpg) · ✅ 200 · portrait | A wet country lane at night, bare trees and a single walker: exactly the late return from the station before the drive. Portrait, cinematic, ominous without showing the car or the crash. **Crop:** focal 50%/55%. (Fetch with header `AIC-User-Agent`.) |
| B | **Samuel Palmer** (d. 1881) — *The Lonely Tower*, 1879 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/362646) | [3874×2958 px](https://images.metmuseum.org/CRDImages/dp/original/DP108221.jpg) · ✅ 200 · landscape | Palmer's moonlit valley with a lone tower: still and uneasy, an English night landscape. Horizontal etching, so crop around the moon and the tower. **Crop:** focal 55%/45%. |

### 10 · Тост · Александр Куприн · задумчивое

Hook: «Будущее, где всё получилось, пьёт за прошлое. Речь длинная, ответ на неё — одна строка.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Frederic Edwin Church** (d. 1900) — *Aurora Borealis*, 1865 | Smithsonian American Art Museum (image via Wikimedia Commons / Google Art Project) · [Public domain (PD-Art; author d. 1900); SAAM image released under Smithsonian Open Access (CC0)](https://www.si.edu/openaccess) · [object page](https://commons.wikimedia.org/wiki/File:Frederic_Edwin_Church_-_Aurora_Borealis_-_Google_Art_Project.jpg) | [4001×2692 px](https://upload.wikimedia.org/wikipedia/commons/d/da/Frederic_Edwin_Church_-_Aurora_Borealis_-_Google_Art_Project.jpg) · ✅ 200 · landscape | The story's celebration happens at the poles, at the 'Electro-Earth-Magnetic' stations; an aurora over polar ice is its setting, with a sense of the future. Crop on the aurora's crown. **Crop:** focal 50%/35%. ⚠️ si.edu returned 403 to scripted checks, so confirm the object-level CC0 flag in a browser. |
| B | **James McNeill Whistler** (d. 1903) — *Nocturne in Black and Gold – The Falling Rocket*, c. 1875 | Detroit Institute of Arts (image via Wikimedia Commons) · [Public domain (PD-Art; author d. 1903)](https://commons.wikimedia.org/wiki/File:Whistler-Nocturne_in_black_and_gold.jpg) · [object page](https://commons.wikimedia.org/wiki/File:Whistler-Nocturne_in_black_and_gold.jpg) | [4371×5807 px](https://upload.wikimedia.org/wikipedia/commons/b/b1/Whistler-Nocturne_in_black_and_gold.jpg) · ✅ 200 · portrait | Fireworks falling over a dark night: New Year's Eve, the toast, sparks dissolving. Portrait, abstract enough to feel modern on a glass UI. **Crop:** focal 55%/55%. |

### 11 · Открытое окно · Саки · ироничное

Hook: «Октябрь, сумерки, окно на лужайку распахнуто настежь. Пятнадцатилетняя племянница объяснит почему.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Caspar David Friedrich** (d. 1840) — *Frau am Fenster (Woman at a Window)*, 1822 | Alte Nationalgalerie, Berlin (image via Wikimedia Commons / Google Art Project) · [Public domain (PD-Art; author d. 1840)](https://commons.wikimedia.org/wiki/File:Caspar_David_Friedrich_-_Frau_am_Fenster_-_Google_Art_Project.jpg) · [object page](https://commons.wikimedia.org/wiki/File:Caspar_David_Friedrich_-_Frau_am_Fenster_-_Google_Art_Project.jpg) | [3072×4345 px](https://upload.wikimedia.org/wikipedia/commons/d/d3/Caspar_David_Friedrich_-_Frau_am_Fenster_-_Google_Art_Project.jpg) · ✅ 200 · portrait | A woman with her back to us, gazing out of an opened window: waiting and watching the outside, the aunt's posture in the story. Portrait, quiet, ironic in context. No hunters in the frame. **Crop:** focal 50%/45%. |
| B | **Rørbye, Martinus** (d. 1848) — *Udsigt fra kunstnerens vindue*, 1823-1827 | SMK – Statens Museum for Kunst, Copenhagen · [Public Domain Mark 1.0 — SMK Open (public_domain=True)](https://creativecommons.org/publicdomain/mark/1.0/) · [object page](https://open.smk.dk/artwork/image/KMS7452) | [2943×3722 px](https://iip.smk.dk/iiif/jp2/70795b578_KMS7452.tif.reconstructed.tif.jp2/full/!3000,3000/0/default.jpg) · ✅ 200 · portrait | A window opened wide onto light from inside a calm domestic room. The ordinary open window that the niece turns into a ghost story. Portrait, bright, legible. **Crop:** focal 50%/50%. |

### 12 · Страшная ночь · Антон Чехов · смешное

Hook: «Дух Спинозы обещал смерть «сегодня ночью». Я дочитал это при всех включённых лампах.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Georges de La Tour** (d. 1652) — *The Penitent Magdalen*, ca. 1640 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/436839) | [2947×4000 px](https://images.metmuseum.org/CRDImages/ep/original/DP-27910-001.jpg) · ✅ 200 · portrait | Candle, mirror, skull and a figure in meditation: séance-and-mortality imagery played straight, which suits a parody of a spiritist scare. Portrait, strong chiaroscuro, wow at any size. **Crop:** focal 55%/45%. |
| B | **Vilhelm Hammershøi** (d. 1916) — *Figure Reading at a Table in an Interior at Night*, ca. 1891 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/406969) | [2751×3594 px](https://images.metmuseum.org/CRDImages/dp/original/DP827280.jpg) · ✅ 200 · portrait | A figure reading at a table under a lamp at night. It matches the hook ('дочитал это при всех включённых лампах'). Charcoal, dark and soft; titles go on top. **Crop:** focal 45%/60%. |

### 13 · Заколоченное окно · Амброз Бирс · жуткое

Hook: «Окно в доме одно, и то заколочено. Всё объясняет последняя фраза — не подглядывайте в конец заранее.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Sanford Robinson Gifford (American, 1823–1880)** (d. 1880) — *A Home in the Wilderness*, 1866 | The Cleveland Museum of Art · [CC0 1.0 — CMA Open Access (share_license_status=CC0)](https://www.clevelandart.org/open-access) · [object page](https://clevelandart.org/art/1970.162) | [3400×1910 px](https://openaccess-cdn.clevelandart.org/1970.162/1970.162_print.jpg) · ✅ 200 · landscape | A lonely settler's cabin under mountains in the wilderness at dusk: the frontier isolation of Bierce's Ohio forest, 1830. Horizontal: crop off-centre on the cabin and the shoreline. The animal does not appear. **Crop:** focal 25%/60%. ⚠️ Cabin sits left of centre, so the 2:3 crop must be offset. |
| B | **Asher Brown Durand** (d. 1886) — *In the Woods*, 1855 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/10790) | [2582×3202 px](https://images.metmuseum.org/CRDImages/ad/original/C_034R4.jpg) · ✅ 200 · portrait | Dense primeval forest, tall and dark: the 'вековой лес' that swallows the hermit's life. Portrait; strong vertical trunks frame a title. **Crop:** focal 50%/50%. ⚠️ Use the Met's additionalImages[0] (C_034R4.jpg); primaryImage is only 825×1024. |

### 14 · Волшебная лавка · Герберт Уэллс · загадочное

Hook: «Лавка фокусов, где «никакого обмана» — не реклама, а предупреждение.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Strobridge Lithographing Co.** — *Kellar (magician's poster)*, c. 1900 | Library of Congress, Prints & Photographs (image via Wikimedia Commons) · [Public domain (published 1900; no known restrictions)](https://commons.wikimedia.org/wiki/File:Kellar_poster.jpg) · [object page](https://commons.wikimedia.org/wiki/File:Kellar_poster.jpg) | [3416×5120 px](https://upload.wikimedia.org/wikipedia/commons/e/e1/Kellar_poster.jpg) · ✅ 200 · portrait | A stage magician in tails with little red imps around him: the 'никакого обмана' charm with a hint of menace. Bold chromolithograph, portrait, reads instantly. **Crop:** focal 50%/45%. |
| B | **Auguste Edouart** (d. 1861) — *The Magic Lantern*, ca. 1835 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/365307) | [3811×2930 px](https://images.metmuseum.org/CRDImages/dp/original/DP141861.jpg) · ✅ 200 · landscape | Silhouette of a family watching a magic-lantern show: a father and child in front of wonders, the story's own pair (narrator and Gip). Crop on the beam and the children. **Crop:** focal 65%/50%. |

### 15 · Большой шлем · Леонид Андреев · печальное

Hook: «Шесть лет за одним карточным столом — и одна мечта, которой карты упорно не дают сбыться.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Paul Cézanne** (d. 1906) — *The Card Players*, 1890–92 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/435868) | [3909×3112 px](https://images.metmuseum.org/CRDImages/ep/original/DP231550.jpg) · ✅ 200 · landscape | Cézanne's card players: the same people at the same table, year after year. Crop on the central player and the table; the most recognisable card-game image in Western art. **Crop:** focal 50%/55%. |
| B | **Rembrandt van Rijn** (d. 1669) — *The Card Player*, 1641 | Art Institute of Chicago · [CC0 1.0 — AIC Open Access (is_public_domain=True)](https://www.artic.edu/open-access/open-access-images) · [object page](https://www.artic.edu/artworks/49065) | [4035×4528 px](https://www.artic.edu/iiif/2/3a7b88ae-e0fc-a561-8bde-4e34085bb1b5/full/1686,/0/default.jpg) · ✅ 200 · portrait | Rembrandt's single card player studying his hand: the private hope for the perfect deal. Portrait etching with a centred figure. **Crop:** focal 45%/45%. (Fetch with header `AIC-User-Agent`.) |

### 16 · Через двадцать лет · О. Генри · задумчивое

Hook: «Встречу назначили двадцать лет назад, на десять вечера. Сейчас без трёх минут десять.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Alfred Stieglitz** (d. 1946) — *An Icy Night, New York*, 1898 | Art Institute of Chicago · [CC0 1.0 — AIC Open Access (is_public_domain=True)](https://www.artic.edu/open-access/open-access-images) · [object page](https://www.artic.edu/artworks/66258) | [3207×2457 px](https://www.artic.edu/iiif/2/4affa44a-d7ba-2f99-ddb8-e1e9f61660b4/full/1686,/0/default.jpg) · ✅ 200 · landscape | New York, night, ice, gaslight through the trees: the cold, empty street where the meeting is set for 10 p.m. Photogravure with a cinematic, non-spoiling mood. **Crop:** focal 50%/50%. ⚠️ Author d. 1946 (PD in life+70 since 2017). The Met marks its Stieglitz prints as not open access; AIC marks this one is_public_domain=true. (Fetch with header `AIC-User-Agent`.) |
| B | **Childe Hassam** (d. 1935) — *New York Street*, 1902 | Art Institute of Chicago · [CC0 1.0 — AIC Open Access (is_public_domain=True)](https://www.artic.edu/open-access/open-access-images) · [object page](https://www.artic.edu/artworks/60294) | [1869×2250 px](https://www.artic.edu/iiif/2/8ed7e389-dbe7-ed35-ade2-fe7743943479/full/1686,/0/default.jpg) · ✅ 200 · portrait | A turn-of-century New York street with lamp posts and a lone figure: period and place, warmer tone. Portrait. **Crop:** focal 50%/55%. (Fetch with header `AIC-User-Agent`.) |

### 17 · Премудрый пискарь · Михаил Салтыков-Щедрин · ироничное

Hook: «Нора на одного, обед в полдень, никаких знакомых. Домовому этот план показался очень разумным.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Henry Louis Stephens** (d. 1882) — *Gudgeon and Shark, from "The Comic Natural History of the Human Race"*, 1851 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/395470) | [3782×2454 px](https://images.metmuseum.org/CRDImages/dp/original/DP813088.jpg) · ✅ 200 · landscape | 'Gudgeon and Shark', literally: a small fish and its predator, from a 19th-c. satirical natural history. Matches Shchedrin's fable-satire exactly. Centre crop on the fish. **Crop:** focal 50%/40%. ⚠️ Printed caption 'GUDGEON SHARK' sits inside a full-height 2:3 crop. Zoom ~1.25× (e.g. `scale: 1.25` on the img) or accept it as a period label. |
| B | **Katsushika Taito II** — *Carp*, c. 1830/44 | Art Institute of Chicago · [CC0 1.0 — AIC Open Access (is_public_domain=True)](https://www.artic.edu/open-access/open-access-images) · [object page](https://www.artic.edu/artworks/7610) | [1455×3000 px](https://www.artic.edu/iiif/2/1bcb308b-c97e-9e90-5b25-4f80ce6dc60d/full/1455,/0/default.jpg) · ✅ 200 · portrait | One fish, vertical, monumental, on blue water: the solitary fish life of the fable as a bold graphic. Portrait print that crops to 2:3 almost natively. **Crop:** focal 50%/50%. (Fetch with header `AIC-User-Agent`.) |

### 18 · Идеофон · Александр Беляев · ироничное

Hook: «Прибор, который слушает мысли, надевают на подозреваемого. Попробуйте при нём ни о чём не думать.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Rørbye, Martinus** (d. 1848) — *Udsigt gennem et vindue på Procida*, 1835 | SMK – Statens Museum for Kunst, Copenhagen · [Public Domain Mark 1.0 — SMK Open (public_domain=True)](https://creativecommons.org/publicdomain/mark/1.0/) · [object page](https://open.smk.dk/artwork/image/KKS1974-58) | [2290×3269 px](https://iip.smk.dk/iiif/jp2/n870zt22r_pc4-02-09-04_-_047.tif.reconstructed.tif.jp2/full/!3000,3000/0/default.jpg) · ✅ 200 · portrait | A view of the Mediterranean through a window: the story opens with an investigator looking through a barred window at the glittering sea and the Pisan hills. Portrait, light, Italian. **Crop:** focal 50%/50%. |
| B | **Odilon Redon** (d. 1916) — *Armor*, 1891 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/339671) | [2831×3858 px](https://images.metmuseum.org/CRDImages/dp/original/DP139626.jpg) · ✅ 200 · portrait | Redon's head locked in a helmet: a mind enclosed by an apparatus, a metaphor for the thought-reading device. Dark, centred, surreal; the irony comes through the title. **Crop:** focal 55%/40%. |

### 19 · Рука · Ги де Мопассан · жуткое

Hook: «Трофей на стене прикован цепью, которая удержала бы слона. Хозяин уверяет, что так надо.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Jean-Baptiste Greuze** (d. 1805) — *Study of a Hand*, ca. 1760–80 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/785410) | [2658×2241 px](https://images.metmuseum.org/CRDImages/dp/original/DP880423.jpg) · ✅ 200 · landscape | A single hand drawn in red chalk on cream paper, isolated like a trophy on a wall. Elegant, uncanny, centred. It shows no attack and no chain. **Crop:** focal 55%/50%. |
| B | **Jean-Auguste-Dominique Ingres (French, 1780–1867)** (d. 1867) — *Study of Hands*, 1842 | The Cleveland Museum of Art · [CC0 1.0 — CMA Open Access (share_license_status=CC0)](https://www.clevelandart.org/open-access) · [object page](https://clevelandart.org/art/2003.37) | [2583×3400 px](https://openaccess-cdn.clevelandart.org/2003.37/2003.37_print.jpg) · ✅ 200 · portrait | Ingres's sheet of hand studies: anatomical, detached hands on blank paper, quietly disturbing. Portrait. **Crop:** focal 50%/50%. |

### 20 · Красная корона · Михаил Булгаков · жуткое

Hook: «История болезни от первого лица. Больной знает, что болен, и знает, кто в этом виноват.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Arkhyp Kuindzhi (Arkhip Ivanovich Kuindzhi)** (d. 1910) — *Red Sunset*, 1905–8 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/436833) | [3811×2764 px](https://images.metmuseum.org/CRDImages/ep/original/DT2557.jpg) · ✅ 200 · landscape | A blood-red sunset under a black cloud. The narrator's first line is 'Больше всего я ненавижу солнце', and the red sun points to the title. A Russian painter in a CC0 collection, with an obvious centred motif. **Crop:** focal 50%/40%. |
| B | **Kuzma Petrov-Vodkin** (d. 1939) — *Купание красного коня / Bathing of a Red Horse*, 1912 | State Tretyakov Gallery (image via Wikimedia Commons) · [Public domain (PD-Art; author d. 1939, PD in RU/EU since 2010; published 1912, PD in US)](https://commons.wikimedia.org/wiki/File:Bathing_of_a_Red_Horse_(Petrov-Vodkin).jpg) · [object page](https://commons.wikimedia.org/wiki/File:Bathing_of_a_Red_Horse_(Petrov-Vodkin).jpg) | [1672×1471 px](https://upload.wikimedia.org/wikipedia/commons/3/3b/Bathing_of_a_Red_Horse_%28Petrov-Vodkin%29.jpg) · ✅ 200 · landscape | A red horse and a young rider: the brother who rode off with the cavalry, rendered as a near-icon of revolutionary Russia. Strong red mass; crop on the horse's head and the rider. **Crop:** focal 40%/40%. ⚠️ Commons file is only 1672×1471, so the 2:3 crop is ~980×1471 px (fine for cards, soft for full-screen hero). Rider is nude. |

### 21 · Пещера · Евгений Замятин · печальное

Hook: «Каменный век наступил в одной петербургской спальне. Молятся здесь чугунной печке.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Hammershøi, Vilhelm** (d. 1916) — *Interiør. Den gamle bilæggerovn. Albertines Lyst, Lyngby*, 1888 | SMK – Statens Museum for Kunst, Copenhagen · [Public Domain Mark 1.0 — SMK Open (public_domain=True)](https://creativecommons.org/publicdomain/mark/1.0/) · [object page](https://open.smk.dk/artwork/image/KMS7246) | [5054×6177 px](https://iip.smk.dk/iiif/jp2/d504rp385_KMS7246.tif.reconstructed.tif.jp2/full/!3000,3000/0/default.jpg) · ✅ 200 · portrait | An empty room with an old iron stove standing like an idol. Zamyatin's tenants 'молятся чугунной печке'. Portrait, Hammershøi's cold grey light, which is very current. **Crop:** focal 30%/45%. |
| B | **Caspar David Friedrich** (d. 1840) — *Das Eismeer (The Sea of Ice)*, 1823–24 | Hamburger Kunsthalle (image via Wikimedia Commons) · [Public domain (PD-Art; author d. 1840)](https://commons.wikimedia.org/wiki/File:Friedrich,_Caspar_David_-_Eismeer.jpg) · [object page](https://commons.wikimedia.org/wiki/File:Friedrich,_Caspar_David_-_Eismeer.jpg) | [2048×1552 px](https://upload.wikimedia.org/wikipedia/commons/7/77/Friedrich%2C_Caspar_David_-_Eismeer.jpg) · ✅ 200 · landscape | The story opens 'Ледники, мамонты, пустыни': a petrified ice age. Friedrich's pyramid of ice slabs is that metaphor. Crop on the ice wedge. **Crop:** focal 45%/45%. ⚠️ Commons file 2048×1552, so the 2:3 crop is ~1035×1552 px. |

### 22 · Красногубая гостья · Фёдор Сологуб · жуткое

Hook: «Святочная история о гостье, которая приходит днём. Читать при свете, как выяснилось, не помогает.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **John Singer Sargent** (d. 1925) — *Madame X (Virginie Amélie Avegno Gautreau)*, 1883–84 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/12127) | [2336×4000 px](https://images.metmuseum.org/CRDImages/ad/original/DP-29006-001.jpg) · ✅ 200 · portrait | A pale, aristocratic woman in black against a dark ground, beautiful and slightly wrong. The 'гостья' before we know what she is. Portrait, iconic, no fangs or gore. **Crop:** focal 50%/40%. |
| B | **Ivan Kramskoi** (d. 1887) — *Неизвестная (Portrait of an Unknown Woman)*, 1883 | State Tretyakov Gallery (image via Wikimedia Commons) · [Public domain (PD-Art; author d. 1887)](https://commons.wikimedia.org/wiki/File:Kramskoy_Portrait_of_a_Woman.jpg) · [object page](https://commons.wikimedia.org/wiki/File:Kramskoy_Portrait_of_a_Woman.jpg) | [2048×1543 px](https://upload.wikimedia.org/wikipedia/commons/c/ce/Kramskoy_Portrait_of_a_Woman.jpg) · ✅ 200 · landscape | The most famous enigmatic woman in Russian painting, in a winter Petersburg setting that matches the святочный frame. She looks down at the viewer: alluring, unknowable. **Crop:** focal 58%/40%. ⚠️ Commons file 2048×1543, so the 2:3 crop is ~1029×1543 px. Very well known; may read as 'chocolate-box' to some readers. |

### 23 · Песчаная учительница · Андрей Платонов · светлое

Hook: «Двадцать лет, диплом педкурсов и село, которое каждый день заметает песком.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Arkhip Kuindzhi** (d. 1910) — *Степь. Нива (Steppe. Cornfield)*, 1875 | Yaroslavl Art Museum (image via Wikimedia Commons) · [Public domain (PD-Art; author d. 1910)](https://commons.wikimedia.org/wiki/File:0815Ha._Kuindzhi_A._Steppe._Cornfield.jpg) · [object page](https://commons.wikimedia.org/wiki/File:0815Ha._Kuindzhi_A._Steppe._Cornfield.jpg) | [3698×2287 px](https://upload.wikimedia.org/wikipedia/commons/4/4f/0815Ha._Kuindzhi_A._Steppe._Cornfield.jpg) · ✅ 200 · landscape | An endless southern steppe under a high sky, with a single figure walking the road: the young teacher heading to her village. Light mood, Russian painter. Crop around the figure. **Crop:** focal 50%/55%. |
| B | **Ivan Shishkin** (d. 1898) — *Сосны, освещённые солнцем (Pines Lit by the Sun)*, 1886 | State Tretyakov Gallery (image via Wikimedia Commons) · [Public domain (PD-Art; author d. 1898)](https://commons.wikimedia.org/wiki/File:%D0%A1%D0%BE%D1%81%D0%BD%D1%8B,_%D0%BE%D1%81%D0%B2%D0%B5%D1%89%D0%B5%D0%BD%D0%BD%D1%8B%D0%B5_%D1%81%D0%BE%D0%BB%D0%BD%D1%86%D0%B5%D0%BC_(%D0%A8%D0%B8%D1%88%D0%BA%D0%B8%D0%BD).jpg) · [object page](https://commons.wikimedia.org/wiki/File:%D0%A1%D0%BE%D1%81%D0%BD%D1%8B,_%D0%BE%D1%81%D0%B2%D0%B5%D1%89%D0%B5%D0%BD%D0%BD%D1%8B%D0%B5_%D1%81%D0%BE%D0%BB%D0%BD%D1%86%D0%B5%D0%BC_(%D0%A8%D0%B8%D1%88%D0%BA%D0%B8%D0%BD).jpg) | [1461×2048 px](https://upload.wikimedia.org/wikipedia/commons/c/c8/%D0%A1%D0%BE%D1%81%D0%BD%D1%8B%2C_%D0%BE%D1%81%D0%B2%D0%B5%D1%89%D0%B5%D0%BD%D0%BD%D1%8B%D0%B5_%D1%81%D0%BE%D0%BB%D0%BD%D1%86%D0%B5%D0%BC_%28%D0%A8%D0%B8%D1%88%D0%BA%D0%B8%D0%BD%29.jpg) · ✅ 200 · portrait | Sunlit pines on sandy ground: the greening of the sands the teacher fights for, warm and hopeful. Portrait, crops natively. **Crop:** focal 50%/50%. ⚠️ Commons file 1461×2048: enough for cards, borderline for a full-bleed hero. |

### 24 · Маска Красной Смерти · Эдгар Аллан По · жуткое

Hook: «Тысяча гостей, семь цветных комнат, наглухо заваренные ворота. А часы всё равно бьют.»

| | Artwork (artist d.) | Museum · licence | Image (HEAD) | Why it fits, no spoiler |
|---|---|---|---|---|
| A | **Francesco Guardi** (d. 1793) — *The Ridotto Pubblico at Palazzo Dandolo*, ca. 1765–68 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/438024) | [3911×2598 px](https://images.metmuseum.org/CRDImages/ep/original/DP162310.jpg) · ✅ 200 · landscape | A Venetian ridotto full of masked revellers under a vast ceiling: the prince's sealed-off party without the intruder. Horizontal, so crop on the central masked group; the ceiling gives headroom for the title. **Crop:** focal 50%/60%. |
| B | **Aubrey Vincent Beardsley** (d. 1898) — *The Masque of the Red Death, for Edgar Allan Poe’s “Tales of Mystery and the Imagination,” Chicago, 1895–96*, 1894 | The Metropolitan Museum of Art, New York · [CC0 1.0 — Met Open Access (isPublicDomain=True)](https://www.metmuseum.org/hubs/open-access) · [object page](https://www.metmuseum.org/art/collection/search/753522) | [2331×3671 px](https://images.metmuseum.org/CRDImages/dp/original/DP-21097-001.jpg) · ✅ 200 · portrait | Beardsley's own drawing for this tale: black-and-white Art Nouveau elegance, an unmistakable masquerade silhouette, high wow at small sizes. **Crop:** focal 50%/50%. ⚠️ SPOILER RISK, medium: it depicts the masked intruder, the story's midnight climax (not the final line). Use only if the title is already visible; otherwise prefer the Guardi. |

## 5. Implementation: the lazy, robust version

**5.1 Get the masters once (no hotlinking).** These are the primary A picks. Run it once, commit the output, never fetch at runtime:

```bash
# from /Users/forkss/FantPub; needs jq (present at /usr/bin/jq) and macOS sips
jq -r '.[] | "\(.slug) \(.candidates[0].imageUrl)"' research/redesign/05_cover_art.json |
while read -r slug url; do
  curl -sfL -A 'FantPub/2.0 (fantpub.vercel.app)' -H 'AIC-User-Agent: FantPub (fantpub.vercel.app)' \
       -o "/tmp/$slug.orig" "$url" || { echo "FAIL $slug"; continue; }
  sips -Z 2000 -s format jpeg -s formatOptions 82 "/tmp/$slug.orig" --out "web/public/covers/$slug.jpg" >/dev/null
  sleep 4   # upload.wikimedia.org answers 429 + retry-after 600 to bursts
done
```

A 2000 px long edge at q82 comes to about 300–700 KB per master in the repo. `next/image` then serves AVIF/WebP at the exact card size, so 24 covers stay well within Vercel limits.

**5.2 Front-matter: one field, no new pipeline.**

```yaml
cover:
  src: /covers/pered-zakonom.jpg
  focal: [50, 50]            # % x, % y. Starting values are in the JSON (eyeballed from thumbnails)
  credit: 'Василий Верещагин. «Двери Тимура (Тамерлана)», 1872. Государственная Третьяковская галерея. Общественное достояние'
  source: https://commons.wikimedia.org/wiki/File:Двери_Тимура_(Тамерлана).jpg
```

**5.3 Crop and book object in CSS.** This is a sketch for the art variant of `Cover.tsx` (CSS Modules, no Tailwind):

```tsx
<figure className={styles.book} style={{ "--fx": `${focal[0]}%`, "--fy": `${focal[1]}%` } as CSSProperties}>
  <Image src={src} alt="" fill sizes="(max-width: 600px) 62vw, 320px" className={styles.art} />
  {!blind && <figcaption className={styles.plate}>{title}</figcaption>}
</figure>
```

```css
.book { position: relative; aspect-ratio: 2 / 3; overflow: hidden; border-radius: 3px 9px 9px 3px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .22), 0 22px 44px -16px rgb(0 0 0 / .5); }
.art  { object-fit: cover; object-position: var(--fx) var(--fy); }
.book::before { /* spine hinge, the crease that makes a picture read as a book */
  content: ""; position: absolute; inset: 0 auto 0 0; width: 6%; z-index: 1;
  background: linear-gradient(90deg, rgb(0 0 0 / .32), rgb(255 255 255 / .14) 45%, transparent); }
.plate { position: absolute; inset: auto 7% 7% 7%; padding: .7em .9em; border-radius: 14px;
  background: rgb(255 255 255 / .16); border: 1px solid rgb(255 255 255 / .32);
  backdrop-filter: blur(14px) saturate(1.5); -webkit-backdrop-filter: blur(14px) saturate(1.5); }
```

For the Apple Books-style ambient background, draw the same `src` a second time behind the page with `filter: blur(60px) saturate(1.4); transform: scale(1.2)`. That avoids colour extraction entirely.

**5.4 Blind-mode rules (the cover must not leak author or title).**
1. Slot A is never a famous illustration of the same text. That is why Beardsley's *Masque of the Red Death* sits in slot B and the Guardi is A.
2. No legible text in the crop that names the work. Rowlandson's captions were rejected for this reason. The Kellar poster's "KELLAR" is harmless because it is not Wells.
3. The **credit line is hidden until the reveal**, together with author and title. The credit names the painting, and for Beardsley it would name the story.
4. The nationality of the art is only a weak hint. The pairing is deliberately mixed: Kafka gets Vereshchagin, Pushkin gets Holbein, Kuprin gets Church, Chekhov gets La Tour, Garshin gets Dürer.

**5.5 New stories (one a day).** Sourcing takes ~10–15 min per story. Search with 2–3 mood or setting words across Met v1.1, AIC, CMA and SMK, then check the [Standard Ebooks artwork DB](https://standardebooks.org/artworks) for a pre-cleared Russian or European painting. Then set a focal point and write the credit. Throttle Commons to 1 request every 4 s or more.

## 6. Comparison: museum fine art vs code-typographic covers vs AI illustration

| Criterion | **PD fine art + code typography (recommended)** | Typographic covers in code only | AI-generated illustration |
|---|---|---|---|
| Looks like a real book (Apple Books, skeuomorphism) | High: real paint, paper, canvas texture and varied palettes, so the shelf looks like a library | Low to medium: uniform, reads as "one product ×24", the reason the current cloth covers were rejected | Medium: plausible at a glance, but glossy and samey across a shelf |
| "Wow" | Strong on large hero cards and in the blurred ambient background | Depends entirely on type craft; little visual surprise | Strong on first view, weak on second look |
| Нейрослоп perception (owner explicitly said «без нейрослопа») | None: provenance is printable ("Верещагин, 1872") and becomes part of the experience | None | **High risk.** Readers who use the word «нейрослоп» look for AI tells (over-smooth light, generic "cinematic" glow, symmetric faces, broken hands or text). Publishers got public backlash for AI covers: Tor (Paolini, *Fractal Noise*, 2022) and Bloomsbury UK (Maas, *House of Earth and Blood* paperback, 2024). One detected cover discredits the whole shelf |
| Legal certainty | High for CC0 sources; for Commons/Russian museum scans, see §3 | Total | Weak. Purely AI output has no human author, so no exclusive rights: Thaler v. Perlmutter, D.C. Cir., 18 Mar 2025, and the ГК РФ ст. 1228 author must be a citizen. Anyone may copy our covers, and the training-data provenance is unresolved |
| Exclusivity | Low: other sites may use the same painting. Mitigate with tight, unusual crops and lesser-known works | High | Nominal: see the legal row |
| Cost per new story | 10–15 min of curation | ~0 | ~1.5 min per generation via Codex CLI, plus rerolls and artifact QA; realistically 10–20 min |
| Shelf consistency | Comes from the typographic plate, the spine hinge and the credit format | Perfect | Needs a locked style prompt; drifts anyway |
| Blind mode | Works with the §5.4 rules | Perfect | Works |
| OG / share card | Excellent: a recognisable masterpiece plus the title drives clicks | OK | Risky: share cards are where AI tells get called out |
| Bytes | ~50–150 KB AVIF at card size (next/image) | <5 KB SVG | same as art |

Verdict: use fine art for every story that has a good match (all 24 have two). Keep the code-typographic cover as the **fallback and loading state**: the current `Cover.tsx` cloth/SVG system can become the placeholder shown while the image decodes, and the cover for any future story with no clean art. Do not use AI for covers. If an illustration is ever needed (Pabchik scenes), keep it visibly in the mascot's hand-drawn style and never let it pass as a period painting.

## 7. Open items

- Owner to approve A/B per story. The JSON keeps both; to swap, reorder the `candidates` array.
- Three Commons URLs (Friedrich *Frau am Fenster*, Kellar poster, Kuindzhi *Steppe*) returned 200, then 429 (`retry-after: 600`) on an immediate re-check, then 200 again after the cooldown. Throttle the download script.
- SAAM CC0 for Church's *Aurora Borealis* could not be confirmed by script (si.edu 403 / API timeout). Open the si.edu object page in a browser once. The painting itself is PD regardless (1865, artist d. 1900).
- Low-resolution Russian scans (≤2048 px): *Купание красного коня*, *Неизвестная*, *Das Eismeer*, Shishkin *Сосны*. They are fine for shelf cards. For a full-bleed hero, look for a better scan, a Google Art Project tile, or a pre-1931 book plate.
- Resolution notes and all fields are in `05_cover_art.json`: `artist, died, title, year, museum, license, licenseUrl, imageUrl, pageUrl, px, why, caveat, verified, headStatus, source, requestHeaders, focal`.
