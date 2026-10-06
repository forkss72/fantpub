#!/bin/zsh
cd /Users/forkss/FantPub/research/mascot
C=/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex
gen() { # name size prompt [ref]
  local name=$1 size=$2 prompt=$3 ref=$4
  local extra=()
  [[ -n $ref ]] && extra=(-i $ref)
  $C exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox -c model_reasoning_effort="low" -c 'notify=[]' $extra \
    "Use your built-in image generation tool to create ONE image (${size}). ${prompt} Save the resulting PNG into the current directory as ${name}.png (copy from wherever the tool stores it, keep the alpha channel). Reply only with the saved path." > log_${name}.txt 2>&1
}
V2=$(python3 -c "
import importlib.util
s=importlib.util.spec_from_file_location('b','build_prompts.py');b=importlib.util.module_from_spec(s);s.loader.exec_module(b)
print(b.SHEET.format(DNA=b.DNA,STYLE=b.STYLE,NEG=b.NEG))")
P04=$(python3 -c "
import importlib.util
s=importlib.util.spec_from_file_location('b','build_prompts.py');b=importlib.util.module_from_spec(s);s.loader.exec_module(b)
print(b.full([p for p in b.POSES if p[0]=='p04_sealed_book'][0][4]))")
source ./prompts.sh   # v1 DNA для проверки референса
P05V1="${DNA} ${STYLE} POSE - sleeping: sitting slumped against a small stack of two closed books, eyes closed as short horizontal lines, glasses slightly askew, mouth a tiny relaxed curve, one hand resting on the top book, body slightly squashed and relaxed. Quiet and peaceful, no letter Z. ${BG} ${NEG}"
gen pab_sheet_v2 "landscape 1536x1024" "$V2" &
gen pab_sleep_ref_v1 "square 1024x1024" "Use the attached model sheet as the identity reference: same body shape, tufts, cowlick, glasses, proportions, line weight and colours. ${P05V1}" pab_sheet_v1.png &
wait
[[ -f pab_sheet_v2.png ]] && gen pab_sealed_ref_v2 "square 1024x1024" "Use the attached model sheet as the identity reference: same body shape, tufts, cowlick, glasses, proportions, line weight and colours. ${P04}" pab_sheet_v2.png
echo ALLDONE
