#!/bin/zsh
# Usage: gen_image.sh <output_path.png> <size: 1024x1024|1024x1536|1536x1024> <prompt...>
# Generates one image via Codex CLI built-in image generation and copies it to output path.
OUT=$1; SIZE=$2; shift 2; PROMPT="$*"
C=/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex
DIR=$(dirname "$OUT"); mkdir -p "$DIR"; NAME=$(basename "$OUT")
cd "$DIR"
for attempt in 1 2; do
  $C exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox -c model_reasoning_effort="low" -c 'notify=[]' \
    "Use your built-in image generation tool to create exactly ONE image, size ${SIZE}. Do not use any script or API key fallback. ${PROMPT} After it is generated, copy the PNG file (from wherever the tool stored it) into $(pwd) as ${NAME} without resizing or recompressing. Reply only with the saved path." < /dev/null > ".log_${NAME}.txt" 2>&1
  [ -s "$OUT" ] && { echo "OK $OUT"; exit 0; }
  echo "retry $attempt for $OUT" >&2
done
echo "FAIL $OUT"; exit 1
