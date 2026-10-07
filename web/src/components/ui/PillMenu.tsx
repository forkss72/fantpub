"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { IconType } from "./icons";
import styles from "./PillMenu.module.css";

export type PillItem = {
  label: string;
  icon?: IconType;
  onSelect: () => void;
  /** dark primary pill (Apple's "Contents" pill) */
  primary?: boolean;
  destructive?: boolean;
  hint?: string;
  /** radio-like items (filters): announced as checked */
  selected?: boolean;
};

export type PillRowItem = { label: string; icon: IconType; onSelect: () => void; active?: boolean };

type Props = {
  /** the trigger: receives the props to spread on a button */
  trigger: (p: { onClick: () => void; "aria-expanded": boolean; "aria-controls": string; "aria-haspopup": "menu" }) => ReactNode;
  items: PillItem[];
  /** Apple's bottom row of icon capsules (share, bookmark…) */
  row?: PillRowItem[];
  /** which way the stack grows from the trigger */
  placement?: "up-end" | "down-end" | "down-start";
  label: string;
};

/**
 * Apple's Liquid Glass menu: separate glass pills that bloom out of the button that opened them.
 * Esc / outside tap closes and returns focus to the trigger; arrow keys move between pills.
 */
export function PillMenu({ trigger, items, row, placement = "down-end", label }: Props) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const r = root.current;
    const trig = r?.querySelector<HTMLElement>(`[aria-controls="${CSS.escape(id)}"]`);
    r?.querySelector<HTMLButtonElement>("[role^=menuitem]")?.focus();
    const close = (refocus: boolean) => {
      setOpen(false);
      if (refocus) trig?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!r?.contains(e.target as Node)) close(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // don't let an enclosing <dialog> close too
        e.preventDefault();
        e.stopPropagation();
        close(true);
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const all = [...(r?.querySelectorAll<HTMLButtonElement>("[role^=menuitem]") ?? [])];
        const i = all.indexOf(document.activeElement as HTMLButtonElement);
        const fwd = e.key === "ArrowDown" || e.key === "ArrowRight";
        all[(i + (fwd ? 1 : -1) + all.length) % all.length]?.focus();
        e.preventDefault();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open, id]);

  const pick = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div className={styles.root} ref={root}>
      {trigger({ onClick: () => setOpen((o) => !o), "aria-expanded": open, "aria-controls": id, "aria-haspopup": "menu" })}
      {open && (
        <div id={id} role="menu" aria-label={label} className={styles.menu} data-placement={placement}>
          {items.map((it, i) => {
            const Icon = it.icon;
            const radio = it.selected !== undefined;
            return (
              <button
                key={it.label}
                type="button"
                role={radio ? "menuitemradio" : "menuitem"}
                aria-checked={radio ? it.selected : undefined}
                className={`${styles.pill} ${it.primary ? styles.primary : "glass"} press`}
                data-destructive={it.destructive ? "" : undefined}
                data-selected={it.selected ? "" : undefined}
                style={{ animationDelay: `${i * 28}ms` }}
                onClick={pick(it.onSelect)}
              >
                <span className={styles.text}>
                  {it.label}
                  {it.hint && <span className={styles.hint}>{it.hint}</span>}
                </span>
                {Icon && <Icon size={20} weight={it.selected ? "bold" : "regular"} aria-hidden="true" />}
              </button>
            );
          })}
          {row && row.length > 0 && (
            <div className={styles.row} style={{ animationDelay: `${items.length * 28}ms` }}>
              {row.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.label}
                    type="button"
                    role="menuitem"
                    aria-label={r.label}
                    className={`${styles.rowBtn} glass press`}
                    data-active={r.active ? "" : undefined}
                    onClick={pick(r.onSelect)}
                  >
                    <Icon size={21} weight={r.active ? "fill" : "regular"} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
