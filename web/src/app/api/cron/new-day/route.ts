import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/** Vercel Cron, 21:00 UTC = 00:00 MSK (Hobby fires within that hour). ISR covers the rest. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  // fail closed in production; locally it can be poked without a secret
  const ok = secret ? req.headers.get("authorization") === `Bearer ${secret}` : process.env.NODE_ENV !== "production";
  if (!ok) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  // everything under the root layout: today, the archive, book pages and their intercepted sheets, authors…
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
