#!/bin/zsh
cd /Users/forkss/FantPub/research/mascot
C=/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex
P() { python3 -c "
import importlib.util
s=importlib.util.spec_from_file_location('b','build_prompts.py');b=importlib.util.module_from_spec(s);s.loader.exec_module(b)
print(b.full([p for p in b.POSES if p[0]=='$1'][0][4]))"; }
gen() { local name=$1 prompt=$2
  $C exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox -c model_reasoning_effort="low" -c 'notify=[]' -i pab_sheet_v2.png -- \
    "Use your built-in image generation tool to create ONE square 1024x1024 image. Use the attached model sheet as the identity reference: same body shape, tufts, cowlick, glasses, proportions, line weight and colours. ${prompt} Save the resulting PNG into the current directory as ${name}.png (copy from wherever the tool stores it, keep the alpha channel). Reply only with the saved path." > log_${name}.txt 2>&1
}
gen pab_p04_sealed_ref "$(P p04_sealed_book)" &
gen pab_p05_sleep_ref "$(P p05_sleeping)" &
gen pab_p06_sad_ref "$(P p06_sad)" &
wait; echo ALLDONE
