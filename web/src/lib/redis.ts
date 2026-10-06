import "server-only";
import { Redis } from "@upstash/redis";

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

/** null → shared counters are off; reactions still work locally in the browser. */
export const redis = url && token ? new Redis({ url, token }) : null;
