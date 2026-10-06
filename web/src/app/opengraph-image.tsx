import { ImageResponse } from "next/og";
import { OgSite, ogFonts } from "@/lib/og";

export const alt = "FantPub — рассказ на каждый день";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<OgSite />, { ...size, fonts: ogFonts() });
}
