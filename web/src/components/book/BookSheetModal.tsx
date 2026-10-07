"use client";

import { useEffect, useRef, ViewTransition, type KeyboardEvent, type MouseEvent, type ReactNode, type SyntheticEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HudHost } from "@/components/ui/Hud";
import { backOnce } from "./back";
import { SheetDismiss } from "./SheetContext";
import "./book-sheet.css";
import styles from "./BookSheetModal.module.css";

/**
 * The book page as Apple's card sheet over whatever screen opened it (intercepted /kniga/[slug]).
 * Lives in the @modal slot's layout so a «Похожие» tap swaps the book without re-presenting the card.
 * Closing = one step back in history; Esc, a tap on the dimmed page and a pull-down all do that.
 */
export function BookSheetModal({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  // Esc inside the ••• menu closes the menu only
  const menuEsc = useRef(false);
  // a slot keeps its last page after navigating elsewhere (e.g. «Читать»): render nothing there
  const open = pathname.startsWith("/kniga/");

  // history traversal runs without a view transition, so the card leaves on its own, then we step back
  const dismiss = () => {
    const d = ref.current;
    if (!d || d.dataset.closing != null) return;
    d.style.transition = "";
    d.style.translate = "";
    d.dataset.closing = "";
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => backOnce(router), still ? 0 : 240);
    // if history refused to move, bring the card back rather than leave it off-screen
    setTimeout(() => {
      if (d.isConnected && location.pathname.startsWith("/kniga/")) delete d.dataset.closing;
    }, 1600);
  };

  // the next book starts at its top
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [pathname]);

  // the page under the card stays put
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [open]);

  const dismissRef = useRef(dismiss);
  useEffect(() => {
    dismissRef.current = dismiss;
  });

  // pull down from the top to dismiss (touch; the sheet itself scrolls)
  useEffect(() => {
    const d = ref.current;
    if (!open || !d) return;
    let y0 = 0;
    let dy = 0;
    let t0 = 0;
    let armed = false;
    let pulling = false;
    const reset = () => {
      d.style.transition = "";
      d.style.translate = "";
    };
    const onStart = (e: TouchEvent) => {
      armed = d.scrollTop <= 0 && e.touches.length === 1;
      pulling = false;
      y0 = e.touches[0].clientY;
      dy = 0;
      t0 = performance.now();
    };
    const onMove = (e: TouchEvent) => {
      if (!armed) return;
      dy = e.touches[0].clientY - y0;
      if (!pulling && (dy < 0 || d.scrollTop > 0)) {
        armed = false;
        return;
      }
      if (dy <= 0) return;
      pulling = true;
      e.preventDefault();
      d.style.transition = "none";
      d.style.translate = `0 ${dy}px`;
    };
    const onEnd = () => {
      if (!pulling) return;
      armed = pulling = false;
      const v = dy / Math.max(1, performance.now() - t0);
      if (dy > 120 || (v > 0.55 && dy > 40)) dismissRef.current();
      else reset();
    };
    d.addEventListener("touchstart", onStart, { passive: true });
    d.addEventListener("touchmove", onMove, { passive: false });
    d.addEventListener("touchend", onEnd);
    d.addEventListener("touchcancel", onEnd);
    return () => {
      d.removeEventListener("touchstart", onStart);
      d.removeEventListener("touchmove", onMove);
      d.removeEventListener("touchend", onEnd);
      d.removeEventListener("touchcancel", onEnd);
    };
  }, [open]);

  if (!open) return null;

  const onKeyDown = (e: KeyboardEvent) => {
    menuEsc.current = e.key === "Escape" && !!(e.target as Element).closest?.('[role="menu"]');
  };
  const onCancel = (e: SyntheticEvent) => {
    e.preventDefault();
    if (menuEsc.current) menuEsc.current = false;
    else dismiss();
  };
  // the card fills the dialog box, so a click on the dialog itself is a click on the dimmed page
  const onClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) dismiss();
  };

  return (
    <ViewTransition enter="book-sheet-in" exit={{ "open-book": "book-sheet-fade", default: "book-sheet-out" }} default="none">
      <dialog
        ref={(d) => {
          // during the commit, so the view transition snapshots the open card
          if (d && !d.open) {
            d.showModal();
            // focus the card itself (its title is the accessible name), not the ✕
            d.focus({ preventScroll: true });
          }
          ref.current = d;
        }}
        className={styles.sheet}
        tabIndex={-1}
        aria-labelledby="book-sheet-title"
        onKeyDownCapture={onKeyDown}
        onCancel={onCancel}
        // closed by the browser itself (repeated Esc): keep the URL in step
        onClose={() => backOnce(router)}
        onClick={onClick}
      >
        <SheetDismiss value={dismiss}>{children}</SheetDismiss>
        {/* the layout's HUD sits under the top layer while a modal dialog is open */}
        <HudHost />
      </dialog>
    </ViewTransition>
  );
}
