import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/** Vercel Cron, 21:00 UTC = 00:00 MSK (Hobby fires within that hour). ISR covers the rest. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  revalidatePath("/");
  revalidatePath("/arhiv");
  revalidatePath("/sitemap.xml");
  revalidatePath("/rasskaz/[slug]", "page");
  revalidatePath("/kniga/[slug]", "page");
  revalidatePath("/poisk");
  revalidatePath("/avtor/[slug]", "page");
  revalidatePath("/avtory");
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
