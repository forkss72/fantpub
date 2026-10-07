# -*- coding: utf-8 -*-
"""Builds book covers from public-domain artworks.

research/redesign/covers_src/<slug>.jpg  (downloaded once, not committed)
  -> web/public/covers/<slug>.webp      1000x1500, flat title band in the cover's dark tone
  -> web/public/covers/<slug>-s.webp    360x540 for shelves and grids
  -> web/content/covers.json            colours, credit, tiny placeholder

Usage: python3 tools/build-covers.py [slug ...]
"""
import base64, colorsys, io, json, os, sys
from PIL import Image, ImageOps, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES = os.path.join(ROOT, "research", "redesign")
SRC = os.path.join(RES, "covers_src")
OUT = os.path.join(ROOT, "web", "public", "covers")
JSON_OUT = os.path.join(ROOT, "web", "content", "covers.json")

W, H = 1000, 1500
BAND = 0.26  # bottom share of the cover that carries the frosted title band

cands = {s["slug"]: s["candidates"] for s in json.load(open(os.path.join(RES, "05_cover_art.json")))}
picks = json.load(open(os.path.join(RES, "covers_pick.json")))


def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rgb2hex(c):
    return "#%02x%02x%02x" % tuple(max(0, min(255, round(v))) for v in c)


def hls(c):
    return colorsys.rgb_to_hls(*(v / 255 for v in c))


def from_hls(h, l, s):
    return tuple(v * 255 for v in colorsys.hls_to_rgb(h, max(0, min(1, l)), max(0, min(1, s))))


def lum(c):
    def ch(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(v) for v in c)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def crop_23(im, fx, fy, zoom=1.0):
    """Largest 2:3 box around the focal point (percent), clamped to the image; zoom > 1 crops tighter."""
    iw, ih = im.size
    if iw / ih > 2 / 3:
        ch, cw = ih, ih * 2 / 3
    else:
        cw, ch = iw, iw * 3 / 2
    cw, ch = cw / zoom, ch / zoom
    cx, cy = iw * fx / 100, ih * fy / 100
    x0 = min(max(cx - cw / 2, 0), iw - cw)
    y0 = min(max(cy - ch / 2, 0), ih - ch)
    return im.crop((round(x0), round(y0), round(x0 + cw), round(y0 + ch)))


def palette(im):
    """Dominant colour of the art, weighted toward saturated mid-tones."""
    small = im.resize((60, 90))
    q = small.quantize(colors=8, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()[: 8 * 3]
    best, best_score = None, -1
    for count, idx in q.getcolors():
        c = tuple(pal[idx * 3: idx * 3 + 3])
        h, l, s = hls(c)
        if l < 0.08 or l > 0.94:
            score = count * 0.05
        else:
            score = count * (0.25 + s) * (1 - abs(l - 0.45))
        if score > best_score:
            best, best_score = c, score
    return best


def derive(base):
    h, l, s = hls(base)
    s = min(s, 0.62)
    bg = from_hls(h, min(max(l, 0.30), 0.40), s * 0.9)       # product-page field, white text on it
    if contrast(bg, (255, 255, 255)) < 4.5:
        bg = from_hls(h, 0.27, s * 0.9)
    dark = from_hls(h, hls(bg)[1] - 0.12, s * 0.85)          # gradient end, continue card
    light = from_hls(h, 0.86, min(s, 0.45))                   # tinted glass on the field
    tint = from_hls(h, 0.55, min(s, 0.5))                     # small accents, progress
    return {"base": rgb2hex(base), "bg": rgb2hex(bg), "dark": rgb2hex(dark), "light": rgb2hex(light), "tint": rgb2hex(tint)}


def build(slug):
    p = picks[slug]
    c = cands[slug][p["pick"]]
    im = Image.open(os.path.join(SRC, slug + ".jpg"))
    im.draft("RGB", (2400, 2400))
    im = ImageOps.exif_transpose(im).convert("RGB")
    if p.get("duotone"):
        g = ImageOps.autocontrast(im.convert("L"), cutoff=1)
        im = ImageOps.colorize(g, black=hex2rgb(p["duotone"][0]), white=hex2rgb(p["duotone"][1]))
    fx, fy = p.get("focal") or c.get("focal") or [50, 50]
    art = crop_23(im, fx, fy, p.get("zoom", 1.0)).resize((W, H), Image.LANCZOS)
    colors = derive(palette(art))

    # title band: a flat field of the cover's own dark tone, lit from above (printed, not glass)
    by = round(H * (1 - BAND))
    top = hex2rgb(colors["dark"])
    h, l, sat = hls(top)
    bot = from_hls(h, max(0, l - 0.05), sat)
    band = Image.new("RGB", (W, H - by))
    bd = ImageDraw.Draw(band)
    for y in range(H - by):
        t = y / max(1, H - by - 1)
        bd.line([(0, y), (W, y)], fill=tuple(round(a + (b - a) * t) for a, b in zip(top, bot)))
    cover = art.copy()
    cover.paste(band, (0, by))
    d = ImageDraw.Draw(cover, "RGBA")
    d.line([(0, by), (W, by)], fill=(255, 255, 255, 70), width=2)  # edge catching the light
    d.line([(0, by + 2), (W, by + 2)], fill=(0, 0, 0, 50), width=2)

    os.makedirs(OUT, exist_ok=True)
    cover.save(os.path.join(OUT, slug + ".webp"), "WEBP", quality=80, method=6)
    cover.resize((360, 540), Image.LANCZOS).save(os.path.join(OUT, slug + "-s.webp"), "WEBP", quality=74, method=6)
    tiny = io.BytesIO()
    cover.resize((12, 18), Image.LANCZOS).save(tiny, "WEBP", quality=50)

    return {
        "src": f"/covers/{slug}.webp",
        "srcSmall": f"/covers/{slug}-s.webp",
        "placeholder": "data:image/webp;base64," + base64.b64encode(tiny.getvalue()).decode(),
        "colors": colors,
        "duotone": bool(p.get("duotone")),
        "credit": {
            "artist": c["artist"],
            "title": c["title"],
            "year": str(c.get("year", "")),
            "museum": c["museum"],
            "license": c.get("license", ""),
            "licenseUrl": c.get("licenseUrl", ""),
            "pageUrl": c.get("pageUrl", ""),
            "imageUrl": c["imageUrl"],
        },
    }


def main():
    data = json.load(open(JSON_OUT)) if os.path.exists(JSON_OUT) else {}
    slugs = sys.argv[1:] or list(picks)
    for slug in slugs:
        if not os.path.exists(os.path.join(SRC, slug + ".jpg")):
            print("missing source", slug)
            continue
        data[slug] = build(slug)
        print(slug, data[slug]["colors"])
    json.dump(dict(sorted(data.items())), open(JSON_OUT, "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
