#!/usr/bin/env python3
"""Единый источник промптов Пабчика.
Собирает: prompts_full.md (готовые промпты для копирования) и gen_all.sh (пакетная генерация через Codex CLI).
Запуск: python3 build_prompts.py
"""
from pathlib import Path

HERE = Path(__file__).parent

DNA = (
    "PABCHIK (fixed character, never change anything here): a small soft house-spirit mascot shaped like a plump "
    "round bun, slightly wider than tall; head and body are one single shape with no neck. The lower half of his "
    "outline is smooth; the upper half of his outline is a soft fur edge of about 7 slightly pointed tufts that all "
    "curl the same way like combed hair (it must read as fur, never as a cloud, a bush or broccoli), with one single "
    "curled cowlick on the very top. Body colour: flat sage green #CBDD9B, no texture and no fur strokes inside the "
    "shape. Face: large perfectly round glasses with thin black rims and a short straight bridge; both lenses "
    "filled with warm off-white #FCFAF4; the glasses sit at the vertical middle of the body and together span about "
    "60% of the body width; inside each lens one small solid black dot eye. A tiny short curved mouth under the "
    "glasses, drawn as a single ink line (never an open mouth filled with colour). No nose, no ears, no eyebrows, no blush. Arms: thin single-line noodle arms in black ink, ending in "
    "small round off-white mitten hands with four short fingers. Legs: two short stubby legs with rounded off-white "
    "feet. He wears nothing except the glasses. Any book he holds has a sage #CBDD9B or off-white cover with an ink "
    "outline."
)

STYLE = (
    "STYLE (fixed): flat 2D brand illustration drawn by hand with a brush pen on paper, not a clean vector clip-art: "
    "confident black ink outline #1D1C17 of even medium weight (about 1/60 of the character's height) with a slightly dry organic edge and rounded line ends; "
    "flat colour fills only; no gradients, no 3D, no soft shading, no hatching, no texture, no glow. The only shadow "
    "is a small flat dark ink oval on the ground under him. Palette strictly limited to ink #1D1C17, sage #CBDD9B, "
    "off-white #FCFAF4, plus at most one small accent in sealing-wax red #B23A22 only where a prop needs it. Calm, "
    "witty, editorial and adult-friendly, like an indie illustrator's risograph sticker sheet; not kawaii, not chibi, "
    "not a 3D toy. Full body, centered, the character takes about 65% of the image height, generous empty margins."
)

BG = (
    "Background: fully transparent PNG with alpha; if transparency is impossible, a flat solid #F6F0E4 with no "
    "texture or vignette."
)

NEG = (
    "Avoid: eyelashes, eye highlights, sparkles, hearts, stars, emoji symbols, speech bubbles, sweat drops, tears, "
    "tongue, teeth, beer or any drinks, ears, owl/cat/bear features, realistic fur, coloured-pencil texture, "
    "watercolour, text, letters, numbers, logos, frames, extra characters."
)

SHEET = (
    "Character model sheet of ONE mascot on a flat solid #F6F0E4 background. {DNA} {STYLE} Layout: top row - four "
    "full-body views of the same character in a neutral standing pose: front, three-quarter, side profile (glasses "
    "seen from the side), back (only the scalloped silhouette and the cowlick). Bottom row - six expression studies "
    "of the same character: neutral, happy (eyes become small upward arcs), surprised (bigger dot eyes, glasses "
    "lifted a little off the face), sad (eyes look down, glasses slipped lower), sleepy (eyes are short horizontal "
    "lines), thinking (eyes look up, one hand at the chin). Identical proportions, line weight and colours in every "
    "view. No labels, no text. {NEG}"
)

# (id, ru_name, mvp, where, pose_block)
POSES = [
    ("p01_hello", "Привет", True, "онбординг, первый визит",
     "POSE - hello: standing and facing the viewer, his right hand raised to head height in a small friendly wave, "
     "left arm relaxed, body tilted about 10 degrees to one side, calm dot eyes, small closed smile."),
    ("p02_reading", "Читает", True, "загрузка рассказа, «о проекте», запасная картинка",
     "POSE - reading: sitting on the ground with legs stretched forward, holding an open sage-green book with both "
     "hands close to his glasses, eyes looking down into the pages, mouth a tiny neutral line, completely absorbed."),
    ("p03_explaining", "Объясняет", True, "записка куратора, «Подробнее о рассказе»",
     "POSE - explaining: standing in three-quarter view, one hand raises a single index finger as if adding an "
     "interesting fact, the other hand holds a small closed sage-green book against his side, mouth slightly open "
     "mid-sentence, eyes looking at the viewer."),
    ("p04_sealed_book", "Держит запечатанную книгу", True, "карточка первого визита, анонс «книга дня»",
     "POSE - presenting today's book: standing facing the viewer, holding out with both hands a closed off-white "
     "hardcover book tied with a thin string and sealed with one round sealing-wax red #B23A22 wax seal on the cover; "
     "he offers it slightly forward, calm happy arc eyes, small proud smile."),
    ("p05_sleeping", "Спит / ждёт завтра", True, "«на сегодня всё», будущие дни в архиве",
     "POSE - sleeping: sitting slumped against a small stack of two closed books, eyes closed as short horizontal "
     "lines, glasses slightly askew, mouth a tiny relaxed curve, one hand resting on the top book, body slightly "
     "squashed and relaxed. Quiet and peaceful, no letter Z."),
    ("p06_sad", "Грустит (ошибка)", True, "офлайн, 404, ошибка сервера",
     "POSE - mild disappointment for an error screen: sitting, shoulders dropped, glasses slipped down a little, eyes "
     "looking down at a single loose blank page lying on the ground in front of him, tiny downturned mouth, one hand "
     "touching the page. Gentle, not tragic, no tears."),
    ("p07_surprised", "Удивлён", False, "статистика реакций, «не ожидали финала»",
     "POSE - surprised: standing, both hands raised to shoulder height with open palms, eyes as bigger round dots, "
     "glasses lifted slightly above their usual place, the fur tufts and the cowlick standing up a little, mouth a "
     "tiny ink-outlined o (the only pose where the mouth is not a single line; never filled with colour)."),
    ("p08_celebrating", "Празднует", False, "вехи: 1-й, 7-й, 30-й рассказ на полке",
     "POSE - celebrating: a small hop in the air with both feet off the ground, both arms up, happy arc eyes, open "
     "smile, three or four small off-white paper scraps flying around him like modest confetti; the ink oval shadow "
     "stays on the ground below."),
    ("p09_goodbye", "Машет «пока»", False, "конец рассказа, «до завтра»",
     "POSE - goodbye: walking away to the right in three-quarter back view, carrying a small closed book under one "
     "arm, looking back over his shoulder at the viewer and waving with the other hand, calm happy arc eyes."),
    ("p10_peeking", "Выглядывает из-за книги", False, "слепой режим «автор под печатью», хоррор",
     "POSE - peeking: a large closed book stands upright like a wall; only the top half of Pabchik peeks out from "
     "behind its right edge, both mitten hands gripping the edge of the cover, eyes looking sideways at the viewer, "
     "slightly mischievous tiny smile."),
    ("p11_searching", "Ищет с фонарём", False, "пустой поиск, пустой фильтр архива",
     "POSE - searching: walking forward and leaning slightly, holding up a small simple ink-drawn lantern with an "
     "off-white glow shape inside, peering ahead through his glasses, mouth a small focused line."),
    ("p12_thinking", "Задумался", False, "реакция «Задумался», вопрос куратора",
     "POSE - thinking: standing, one hand at his chin, the other arm folded under it, eyes looking up and to the side "
     "through the glasses, mouth a small flat line, head-body tilted slightly back."),
]


def full(pose_block: str) -> str:
    return f"{DNA} {STYLE} {pose_block} {BG} {NEG}"


def main():
    sheet = SHEET.format(DNA=DNA, STYLE=STYLE, NEG=NEG)

    md = ["# Пабчик — готовые промпты (собрано из build_prompts.py)\n",
          "Каждый промпт самодостаточен: фиксированное описание персонажа (DNA) + стиль + поза + фон + запреты.\n",
          "Порядок работы: сначала лист персонажа (P00), затем каждая поза с приложенным утверждённым листом "
          "(`codex exec … -i pab_sheet.png -- \"промпт\"`) и фразой «Use the attached model sheet as the identity reference».\n",
          "\n## P00 — лист персонажа (1536×1024)\n", "```text\n" + sheet + "\n```\n"]
    for pid, ru, mvp, where, block in POSES:
        tag = "MVP" if mvp else "v2"
        md.append(f"\n## {pid.upper()} — {ru} ({tag}; {where}; 1024×1024)\n")
        md.append("```text\n" + full(block) + "\n```\n")
    (HERE / "prompts_full.md").write_text("".join(md), encoding="utf-8")

    sh = ["#!/bin/zsh",
          "# Пакетная генерация поз Пабчика. Требует утверждённый лист персонажа pab_sheet.png рядом.",
          "# Пример: ./gen_all.sh            — все MVP-позы",
          "#         ./gen_all.sh all        — все 12",
          "cd \"$(dirname \"$0\")\"",
          "C=/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex",
          "REF=pab_sheet.png",
          "[[ -f $REF ]] || { echo 'Нет pab_sheet.png — сначала утвердите лист персонажа'; exit 1; }",
          "gen() {",
          "  local name=$1 prompt=$2",
          "  $C exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox -c model_reasoning_effort=\"low\" -c 'notify=[]' -i $REF -- \\",
          "    \"Use your built-in image generation tool to create ONE square 1024x1024 image. Use the attached model sheet as the identity reference: same body shape, tufts, cowlick, glasses, proportions, line weight and colours. ${prompt} Save the resulting PNG into the current directory as ${name}.png (copy from wherever the tool stores it, keep the alpha channel). Reply only with the saved path.\" > log_${name}.txt 2>&1",
          "}",
          ]
    for pid, ru, mvp, where, block in POSES:
        cond = "" if mvp else "[[ $1 == all ]] && "
        prompt = full(block).replace('"', '\\"')
        sh.append(f"{cond}gen {pid} \"{prompt}\" &")
    sh += ["wait", "echo ALLDONE"]
    p = HERE / "gen_all.sh"
    p.write_text("\n".join(sh) + "\n", encoding="utf-8")
    p.chmod(0o755)
    print("ok:", HERE / "prompts_full.md", p)


if __name__ == "__main__":
    main()
