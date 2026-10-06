#!/bin/zsh
C=/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex
gen() {
  local name=$1; local prompt=$2
  $C exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox -c model_reasoning_effort="low" -c 'notify=[]' \
    "Use your built-in image generation tool to create ONE image (portrait 1024x1536). ${prompt} Save the resulting PNG into the current directory as ${name}.png (convert/copy from wherever the tool stores it). Reply only with the saved path." > log_${name}.txt 2>&1
}
BASE="A realistic high-fidelity mobile app UI mockup, a single iPhone screen shown flat and straight-on filling the frame, no hands, no device frame. App: 'FantPub' — one short story per day (like DailyArt but for stories). The home screen shows TODAY'S STORY as a beautiful book in the center (the cover art is an eerie illustration of a boarded-up window with glowing eyes), a date label, a small reading-time chip '6 мин', a primary button 'Открыть', and at the bottom a row/shelf of past days' small covers. Brand accent color: sage green #CBDD9B. Keep text minimal; Cyrillic text allowed only for: 'FantPub', 'Заколоченное окно', 'Открыть', '6 мин'."
gen A_skeuo "$BASE Style direction A — WARM SKEUOMORPHISM like the old 2010 Apple iBooks: a real wooden bookshelf with soft shadows, the book is a tangible 3D hardcover with cloth texture and gilded page edges, linen and leather textures, warm lamp lighting, subtle film grain, nostalgic but refined." &
gen B_paper "$BASE Style direction B — PAPER & HAND-DRAWN: warm cream paper texture with fine grain, delicate hand-drawn ink sketches and doodles (pencil lines, small stars, arrows), the book drawn as a tactile object with a soft drop shadow, a small cute hand-drawn mascot (a round fluffy creature with round glasses) peeking from the side, calm editorial typography, clean airy layout." &
gen C_glass "$BASE Style direction C — LIQUID GLASS (iOS 26 style): deep dark moody background made of the blurred cover colors, the book floats in 3D with glossy reflections, translucent refractive liquid-glass panels and a floating glass tab bar, soft specular highlights, premium and modern." &
gen D_eclectic "$BASE Style direction D — ECLECTIC WEB3/COLLAGE: an unusual but usable layout mixing a classic serif with a monospace font, sticker-like labels, a circular radial navigation menu, playful 3D objects (a tiny clay planet, a ticket stub), scrapbook collage of paper scraps with grain, bold but tasteful, a bit like superr.ai and contemporary design studio websites." &
gen E_minimal "$BASE Style direction E — CLEAN SWISS MINIMALISM: pure off-white background, strict grid, large elegant serif title, lots of whitespace, the book cover is flat with a crisp shadow, thin hairline dividers, no textures, no ornaments, very calm and precise." &
wait
echo ALLDONE
