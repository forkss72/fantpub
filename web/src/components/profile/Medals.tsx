"use client";

import { useState, type CSSProperties } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { BookOpen, Books, CalendarBlank, Flame, HandsClapping, MagnifyingGlass, Moon, Quotes, Trophy, type IconType } from "@/components/ui/icons";
import type { Achievement } from "@/lib/stats";
import { Group } from "./Group";
import styles from "./Profile.module.css";
import m from "./Medals.module.css";

type Metal = "bronze" | "silver" | "gold";

const LOOK: Record<string, { icon: IconType; metal: Metal }> = {
  first: { icon: BookOpen, metal: "bronze" },
  week: { icon: Flame, metal: "silver" },
  sleuth: { icon: MagnifyingGlass, metal: "silver" },
  owl: { icon: Moon, metal: "bronze" },
  ten: { icon: Books, metal: "gold" },
  quotes: { icon: Quotes, metal: "bronze" },
  critic: { icon: HandsClapping, metal: "silver" },
  month: { icon: Trophy, metal: "gold" },
};
const FALLBACK = { icon: CalendarBlank, metal: "silver" as Metal };

/** A struck metal medallion: brushed rim, recessed face, raised glyph. Pewter while locked. */
export function Medal({ a, size = 64 }: { a: Achievement; size?: number }) {
  const { icon: Icon, metal } = LOOK[a.id] ?? FALLBACK;
  return (
    <span className={m.medal} data-metal={a.unlocked ? metal : "locked"} style={{ "--m": `${size}px` } as CSSProperties} aria-hidden="true">
      <Icon size={Math.round(size * 0.42)} weight="fill" className={m.glyph} />
    </span>
  );
}

export function Medals({ list }: { list: Achievement[] }) {
  const [open, setOpen] = useState<Achievement | null>(null);
  const [shown, setShown] = useState(false);
  const got = list.filter((a) => a.unlocked).length;
  return (
    <>
      <Group title="Достижения" aside={<span className="num">{`${got} из ${list.length}`}</span>}>
        <ul className={m.grid}>
          {list.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className={`${m.item} press`}
                data-locked={a.unlocked ? undefined : ""}
                aria-label={`${a.title}, ${a.unlocked ? "получено" : "не получено"}. ${a.hint}`}
                onClick={() => {
                  setOpen(a);
                  setShown(true);
                }}
              >
                <Medal a={a} />
                <span className={m.title}>{a.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </Group>
      <Sheet open={shown} onClose={() => setShown(false)} title={open?.title}>
        {open && (
          <div className={`${styles.sheetBody} ${m.detail}`}>
            <Medal a={open} size={120} />
            <p className={m.hint}>{open.hint}</p>
            <p className={m.status} data-on={open.unlocked ? "" : undefined}>
              {open.unlocked ? "Получено" : "Пока не получено"}
            </p>
          </div>
        )}
      </Sheet>
    </>
  );
}
