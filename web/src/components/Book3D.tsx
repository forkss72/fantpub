"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { Cover } from "./Cover";
import { clothVars } from "@/lib/cloth";
import type { ClothKey } from "@/lib/types";
import styles from "./Book3D.module.css";

export type BookPhase = "rest" | "front" | "open";

type Props = {
  title: string;
  issue: number;
  motif: string;
  cloth: ClothKey;
  /** rest = 3/4 on the ledge, front = turned to the reader, open = cover swung open */
  phase?: BookPhase;
  width?: number;
  /** Rendered on the first page, visible when the cover opens. */
  titlePage?: ReactNode;
  /** Things that sit on the front cover (seal, ribbon). */
  children?: ReactNode;
  tilt?: boolean;
  className?: string;
};

/**
 * A clothbound book in CSS 3D — no WebGL. Cover, spine, page block, back board.
 */
export function Book3D({ title, issue, motif, cloth, phase = "rest", width = 220, titlePage, children, tilt = true, className }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const depth = Math.round(width * 0.15);
  const style = {
    ...clothVars(cloth),
    "--w": `${width}px`,
    "--h": `${Math.round(width * 1.5)}px`,
    "--d": `${depth}px`,
  } as CSSProperties;

  function onPointerMove(e: React.PointerEvent) {
    if (!tilt || e.pointerType === "touch") return;
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--tx", `${(-y * 8).toFixed(2)}deg`);
    el.style.setProperty("--ty", `${(x * 12).toFixed(2)}deg`);
  }
  function onPointerLeave() {
    const el = stageRef.current;
    if (!el) return;
    el.style.setProperty("--tx", "0deg");
    el.style.setProperty("--ty", "0deg");
  }

  return (
    <div
      ref={stageRef}
      className={`${styles.stage} ${className ?? ""}`}
      style={style}
      data-phase={phase}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className={styles.floor} aria-hidden="true" />
      <div className={styles.book}>
        <div className={styles.back} aria-hidden="true" />
        <div className={styles.spine} aria-hidden="true">
          <span className={styles.spineBand} />
          <span className={styles.spineTitle}>{title}</span>
          <span className={styles.spineIssue}>{issue}</span>
          <span className={styles.spineBand} />
        </div>
        <div className={styles.edgeRight} aria-hidden="true" />
        <div className={styles.edgeTop} aria-hidden="true" />
        <div className={styles.edgeBottom} aria-hidden="true" />
        <div className={styles.firstPage}>{titlePage}</div>
        <div className={styles.frontCover}>
          <div className={styles.frontOutside}>
            <Cover title={title} issue={issue} motif={motif} cloth={cloth} />
            {children}
          </div>
          <div className={styles.frontInside} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
