#!/bin/zsh
cd /Users/forkss/FantPub/research/mascot
source ./prompts.sh
C=/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex
gen() { # name size prompt [ref]
  local name=$1 size=$2 prompt=$3 ref=$4
  local extra=()
  [[ -n $ref ]] && extra=(-i $ref)
  $C exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox -c model_reasoning_effort="low" -c 'notify=[]' $extra \
    "Use your built-in image generation tool to create ONE image (${size}). ${prompt} Save the resulting PNG into the current directory as ${name}.png (copy from wherever the tool stores it, keep the alpha channel). Reply only with the saved path." > log_${name}.txt 2>&1
}
SHEET="Character model sheet of ONE mascot on a flat solid #F6F0E4 background. ${DNA} ${STYLE} Layout: top row — four full-body views of the same character in a neutral standing pose: front, three-quarter, side profile (glasses seen from the side), back (only the scalloped silhouette and the cowlick). Bottom row — six expression studies of the same character: neutral, happy (eyes become small upward arcs), surprised (bigger dot eyes, glasses lifted a little off the face), sad (eyes look down, glasses slipped lower), sleepy (eyes are short horizontal lines), thinking (eyes look up, one hand at the chin). Identical proportions, line weight and colours in every view. No labels, no text. ${NEG}"
gen pab_sheet_v1 "landscape 1536x1024" "$SHEET" &
gen pab_hello_v1 "square 1024x1024" "${DNA} ${STYLE} POSE — hello: standing and facing the viewer, his right hand raised to head height in a small friendly wave, left arm relaxed, body tilted about 10 degrees to one side, calm dot eyes, small closed smile. ${BG} ${NEG}" &
gen pab_note_v1 "square 1024x1024" "${DNA} ${STYLE} POSE — explaining: standing in three-quarter view, one hand raises a single index finger as if adding an interesting fact, the other hand holds a small closed sage-green book against his side, mouth slightly open mid-sentence, eyes looking at the viewer over the top of the glasses. ${BG} ${NEG}" &
wait
echo ALLDONE
