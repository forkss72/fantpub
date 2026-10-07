# -*- coding: utf-8 -*-
# Downloads the chosen public-domain artworks once (museum open-access APIs / Wikimedia Commons).
import json, os, subprocess, time, sys
base = os.path.dirname(os.path.abspath(__file__))
cands = {s["slug"]: s["candidates"] for s in json.load(open(os.path.join(base, "05_cover_art.json")))}
picks = json.load(open(os.path.join(base, "covers_pick.json")))
out = os.path.join(base, "covers_src")
UA = "FantPub/2.0 (https://fantpub.vercel.app; public-domain book covers)"
for slug, p in picks.items():
    c = cands[slug][p["pick"]]
    url = c["imageUrl"]
    dest = os.path.join(out, slug + ".jpg")
    if os.path.exists(dest) and os.path.getsize(dest) > 20000:
        continue
    hdr = ["-H", "User-Agent: " + UA]
    if "artic.edu" in url:
        hdr += ["-H", "AIC-User-Agent: " + UA]
    r = subprocess.run(["curl", "-sSL", "--max-time", "180", "-o", dest, "-w", "%{http_code} %{size_download}", *hdr, url], capture_output=True, text=True)
    print(slug, r.stdout, r.stderr.strip()[:120], flush=True)
    if "wikimedia" in url:
        time.sleep(5)
