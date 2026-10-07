"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassButton } from "@/components/ui/GlassButton";
import { PillMenu, type PillItem } from "@/components/ui/PillMenu";
import { showHud } from "@/components/ui/Hud";
import { CaretLeft, Check, DotsThree, Link as LinkIcon, Plus, Question, X } from "@/components/ui/icons";
import { markRead, toggleWant, useShelf } from "@/lib/shelf";
import { shareOrCopy } from "@/lib/share";
import { tick } from "@/lib/haptics";
import { backOnce, leavePage } from "./back";
import { SheetDismiss } from "./SheetContext";
import styles from "./BookDetail.module.css";

type Props = { slug: string; title: string; minutes: number; variant: "page" | "sheet" };

/** Floating tinted glass: ✕ (sheet) or ‹ (page) on the left, the grouped [+ | •••] capsule on the right. */
export function BookTopBar({ slug, title, minutes, variant }: Props) {
  const router = useRouter();
  const dismiss = useContext(SheetDismiss);
  const shelf = useShelf();
  const want = !!shelf.want[slug];
  const read = !!shelf.read[slug];
  const bar = useRef<HTMLDivElement>(null);
  // tinted while over the colour field, plain glass once the canvas scrolls under (keeps the glyphs legible)
  const [onCanvas, setOnCanvas] = useState(false);

  useEffect(() => {
    const el = bar.current;
    const field = el?.parentElement?.querySelector("header");
    if (!el || !field) return;
    const io = new IntersectionObserver(([e]) => setOnCanvas(!e.isIntersecting), {
      root: el.closest("dialog"),
      rootMargin: `-${Math.round(el.getBoundingClientRect().bottom - (el.closest("dialog")?.getBoundingClientRect().top ?? 0))}px 0px 0px 0px`,
    });
    io.observe(field);
    return () => io.disconnect();
  }, []);

  const onWant = () => {
    tick();
    toggleWant(slug, !want);
    if (want) showHud("Убрано", "bookmark", "из «Хочу прочитать»");
    else showHud("Добавлено", "bookmark", "в «Хочу прочитать»");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}/kniga/${slug}`);
      showHud("Ссылка скопирована", "link");
    } catch {
      showHud("Не получилось скопировать");
    }
  };

  const items: PillItem[] = [
    {
      label: "Поделиться загадкой",
      hint: "Без имени автора",
      icon: Question,
      onSelect: () => void shareOrCopy(`${location.origin}/rasskaz/${slug}?z=1`, `«${title}»`, `Рассказ на ${minutes} мин. Угадаете автора?`),
    },
    { label: "Скопировать ссылку", icon: LinkIcon, onSelect: () => void copyLink() },
  ];
  if (!read) {
    items.push({
      label: "Отметить прочитанным",
      icon: Check,
      onSelect: () => {
        tick();
        markRead(slug);
        showHud("Прочитано", "check");
      },
    });
  }

  return (
    <div className={styles.bar} ref={bar} data-on-canvas={onCanvas ? "" : undefined}>
      {variant === "sheet" ? (
        <GlassButton icon={X} label="Закрыть" tint={!onCanvas} onClick={() => (dismiss ? dismiss() : backOnce(router))} />
      ) : (
        <GlassButton icon={CaretLeft} label="Назад" tint={!onCanvas} onClick={() => leavePage(router)} />
      )}
      <div className={styles.group}>
        <span className={`${styles.groupBg} glass${onCanvas ? "" : " glass-tint"}`} aria-hidden="true" />
        <button type="button" className={styles.groupBtn} onClick={onWant} aria-label="Хочу прочитать" aria-pressed={want}>
          {want ? <Check size={22} weight="bold" aria-hidden="true" /> : <Plus size={22} aria-hidden="true" />}
        </button>
        <PillMenu
          label="Действия с рассказом"
          placement="down-end"
          items={items}
          trigger={(p) => (
            <button type="button" {...p} className={styles.groupBtn} aria-label="Действия">
              <DotsThree size={24} weight="bold" aria-hidden="true" />
            </button>
          )}
        />
      </div>
    </div>
  );
}
