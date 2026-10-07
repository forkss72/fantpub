"use client";

import Link from "next/link";
import type { Route } from "next";
import { GoalRing } from "@/components/ui/Goal";
import { useShelf } from "@/lib/shelf";
import { todaySeconds } from "@/lib/stats";
import { useDayNow } from "./state";
import styles from "./HeaderActions.module.css";

/** Apple Books' two circles: today's reading ring and the reader's avatar. */
export function HeaderActions({ serverNow }: { serverNow: number }) {
  const shelf = useShelf();
  const now = useDayNow(serverNow);
  const minutes = Math.floor(todaySeconds(shelf, now) / 60);
  const goal = shelf.goal.daily;
  const { name, avatar } = shelf.profile;
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const pose = /^[a-z-]+$/.test(avatar) ? avatar : "";

  return (
    <>
      <Link
        href={"/profil#goals" as Route}
        className={`${styles.circle} glass press`}
        aria-label={`Цель на сегодня: ${minutes} из ${goal} мин`}
      >
        <GoalRing progress={minutes / goal} size={34} />
        <span className={`${styles.minutes} num`} aria-hidden="true">
          {minutes}
        </span>
      </Link>
      <Link href={"/profil" as Route} className={`${styles.avatar} press`} aria-label="Профиль" data-initials={pose ? undefined : ""}>
        {pose ? (
          // eslint-disable-next-line @next/next/no-img-element -- 44px local webp
          <img src={`/pabchik/${pose}.webp`} alt="" width={44} height={44} decoding="async" />
        ) : (
          <span aria-hidden="true">{initials || "Я"}</span>
        )}
      </Link>
    </>
  );
}
