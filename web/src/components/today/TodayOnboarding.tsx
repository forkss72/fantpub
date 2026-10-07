"use client";

import dynamic from "next/dynamic";
import { useHydrated, useShelf } from "@/lib/shelf";
import type { TodayBook } from "./state";

// Only first-time visitors need it: keep it out of Today's bundle for everyone else.
const Onboarding = dynamic(() => import("@/components/onboarding/Onboarding").then((m) => m.Onboarding), { ssr: false });

/** First visit → the onboarding layer over Today, with the book of the day in front of its fan. */
export function TodayOnboarding({ today }: { today: TodayBook }) {
  const shelf = useShelf();
  const hydrated = useHydrated();
  return hydrated && !shelf.onboarded ? <Onboarding today={today} /> : null;
}
