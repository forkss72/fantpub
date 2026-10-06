import { ImageResponse } from "next/og";
import { getStory } from "@/lib/content";
import { OgStory, ogFonts } from "@/lib/og";

export const alt = "Рассказ дня в FantPub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return new Response("Not found", { status: 404 });
  return new ImageResponse(<OgStory story={story} />, { ...size, fonts: ogFonts() });
}
