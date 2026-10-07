"use client";

import dynamic from "next/dynamic";
import { useHydrated, useShelf } from "@/lib/shelf";
import type { FanBook } from "@/components/onboarding/Onboarding";

// Only first-time visitors need it: keep it out of Today's bundle for everyone else.
const Onboarding = dynamic(() => import("@/components/onboarding/Onboarding").then((m) => m.Onboarding), { ssr: false });

/** First visit → the onboarding layer over Today; `fan` = published issues, the book of the day first. */
export function TodayOnboarding({ fan }: { fan: FanBook[] }) {
  const shelf = useShelf();
  const hydrated = useHydrated();
  return hydrated && !shelf.onboarded ? <Onboarding fan={fan} /> : null;
}
