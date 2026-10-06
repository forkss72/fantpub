import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getStory } from "@/lib/content";
import { ShareCard, ogFonts } from "@/lib/og";

export async function GET(_req: NextRequest, ctx: RouteContext<"/rasskaz/[slug]/karta">) {
  const { slug } = await ctx.params;
  const story = getStory(slug);
  if (!story) return new Response("Not found", { status: 404 });
  return new ImageResponse(<ShareCard story={story} />, {
    width: 1080,
    height: 1350,
    fonts: ogFonts(),
    headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" },
  });
}
