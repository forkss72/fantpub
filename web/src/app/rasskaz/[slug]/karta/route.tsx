import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getStory } from "@/lib/content";
import { ShareCard, ogFonts } from "@/lib/og";

export async function GET(req: NextRequest, ctx: RouteContext<"/rasskaz/[slug]/karta">) {
  const { slug } = await ctx.params;
  const story = getStory(slug);
  if (!story) return new Response("Not found", { status: 404 });
  // A reader-picked quote must actually be in the story — no arbitrary text on our cards.
  const q = (req.nextUrl.searchParams.get("q") ?? "").replace(/\s+/g, " ").trim().slice(0, 260);
  const plain = story.blocks.map((b) => ("text" in b ? b.text : "")).join(" ").replace(/\s+/g, " ").replace(/\*/g, "");
  const quote = q && plain.includes(q) ? q : story.quote;
  return new ImageResponse(<ShareCard story={{ ...story, quote }} />, {
    width: 1080,
    height: 1350,
    fonts: ogFonts(),
    headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" },
  });
}
