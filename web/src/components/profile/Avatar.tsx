"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useShelf } from "@/lib/shelf";
import { UserCircle } from "@/components/ui/icons";
import styles from "./Avatar.module.css";

/** Pabchik poses offered as avatars, with their accessible names ("" = initials). */
export const POSE_NAMES: Record<string, string> = {
  avatar: "Пабчик крупно",
  reading: "Пабчик читает",
  thinking: "Пабчик думает",
  explaining: "Пабчик объясняет",
  celebrating: "Пабчик радуется",
  surprised: "Пабчик удивлён",
  searching: "Пабчик с фонарём",
  sleeping: "Пабчик спит",
  goodbye: "Пабчик машет",
  sad: "Пабчик грустит",
  "sealed-book": "Пабчик с посылкой",
};
export const AVATAR_POSES = Object.keys(POSE_NAMES);

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/** Pabchik pose or initials on a sage circle. Decorative: the caller names it. */
export function Avatar({ avatar, name, size }: { avatar: string; name: string; size: number }) {
  const pose = Object.hasOwn(POSE_NAMES, avatar) ? avatar : "";
  const ini = initials(name);
  return (
    <span className={styles.avatar} data-kind={pose ? (pose === "avatar" ? "head" : "pose") : "ini"} style={{ "--s": `${size}px` } as CSSProperties} aria-hidden="true">
      {pose ? (
        // eslint-disable-next-line @next/next/no-img-element -- tiny pre-sized webp
        <img src={`/pabchik/${pose}.webp`} alt="" width={size} height={size} decoding="async" draggable={false} />
      ) : ini ? (
        <span className={styles.ini}>{ini}</span>
      ) : (
        <UserCircle size={Math.round(size * 0.62)} weight="light" />
      )}
    </span>
  );
}

/** The 44px avatar circle in page headers → /profil. */
export function AvatarLink() {
  const { profile } = useShelf();
  return (
    <Link href="/profil" className={`${styles.link} press`} aria-label="Профиль">
      <Avatar avatar={profile.avatar} name={profile.name} size={44} />
    </Link>
  );
}
