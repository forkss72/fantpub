import { ImageResponse } from "next/og";
import { getPublishedStories } from "@/lib/content";
import { OgSite, ogFonts } from "@/lib/og";

export const alt = "FantPub — рассказ на каждый день";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  // the first issues are published forever, so the card never shows a sealed future cover
  return new ImageResponse(<OgSite books={getPublishedStories().slice(0, 5)} />, { ...size, fonts: ogFonts() });
}
