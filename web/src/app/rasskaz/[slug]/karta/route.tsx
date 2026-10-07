import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getStory, typograph } from "@/lib/content";
import { ShareCard, ogFonts } from "@/lib/og";

const MAX = 260;

export async function GET(req: NextRequest, ctx: RouteContext<"/rasskaz/[slug]/karta">) {
  const { slug } = await ctx.params;
  const story = getStory(slug);
  if (!story) return new Response("Not found", { status: 404 });
  // A reader-picked quote must actually be in the story — no arbitrary text on our cards.
  const raw = (req.nextUrl.searchParams.get("q") ?? "").replace(/\s+/g, " ").trim();
  const cut = raw.lastIndexOf(" ", MAX);
  const q = raw.length > MAX ? raw.slice(0, cut > 0 ? cut : MAX).replace(/(\s\S{1,2})+$/, "").replace(/[\s,;:—–-]+$/, "") : raw; // no dangling «и», «к» before the ellipsis
  const plain = story.blocks.map((b) => ("text" in b ? b.text : "")).join(" ").replace(/\s+/g, " ").replace(/\*/g, "");
  const quote = q && plain.includes(q) ? typograph(q.length < raw.length ? `${q}…` : q) : story.quote;
  return new ImageResponse(<ShareCard story={{ ...story, quote }} />, {
    width: 1080,
    height: 1350,
    fonts: ogFonts(),
    headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" },
  });
}
