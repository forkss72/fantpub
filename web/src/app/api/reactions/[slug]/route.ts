import { NextResponse, type NextRequest } from "next/server";
import { getStory } from "@/lib/content";
import { redis } from "@/lib/redis";
import { EMPTY_COUNTS, REACTION_KEYS, type Counts } from "@/lib/reactions";
import type { ReactionKey } from "@/lib/types";

const key = (slug: string) => `fp:rx:${slug}`;

async function read(slug: string): Promise<Counts> {
  if (!redis) return { ...EMPTY_COUNTS };
  const h = (await redis.hgetall<Record<string, number | string>>(key(slug))) ?? {};
  const out = { ...EMPTY_COUNTS };
  for (const k of REACTION_KEYS) out[k] = Math.max(0, Number(h[k] ?? 0));
  return out;
}

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/reactions/[slug]">) {
  const { slug } = await ctx.params;
  if (!getStory(slug)) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!redis) return NextResponse.json({ enabled: false, counts: EMPTY_COUNTS });
  try {
    const counts = await read(slug);
    return NextResponse.json(
      { enabled: true, counts },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" } },
    );
  } catch {
    return NextResponse.json({ enabled: false, counts: EMPTY_COUNTS });
  }
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/reactions/[slug]">) {
  const { slug } = await ctx.params;
  if (!getStory(slug)) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!redis) return NextResponse.json({ enabled: false, counts: EMPTY_COUNTS });

  let body: { reaction?: string; prev?: string | null; device?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const reaction = body.reaction as ReactionKey;
  const device = String(body.device ?? "").slice(0, 64);
  if (!REACTION_KEYS.includes(reaction) || !/^[a-z0-9-]{8,64}$/i.test(device)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  try {
    // one vote per device per story; changing the vote moves it
    const pickKey = `fp:pick:${slug}`;
    const prev = (await redis.hget<string>(pickKey, device)) as ReactionKey | null;
    if (prev !== reaction) {
      const tx = redis.multi();
      tx.hset(pickKey, { [device]: reaction });
      tx.hincrby(key(slug), reaction, 1);
      if (prev && REACTION_KEYS.includes(prev)) tx.hincrby(key(slug), prev, -1);
      await tx.exec();
    }
    return NextResponse.json({ enabled: true, counts: await read(slug) });
  } catch {
    return NextResponse.json({ enabled: false, counts: EMPTY_COUNTS });
  }
}
