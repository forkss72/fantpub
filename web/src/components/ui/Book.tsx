import type { CSSProperties } from "react";
import type { Cover } from "@/lib/types";
import styles from "./Book.module.css";

type Props = {
  cover: Pick<Cover, "src" | "srcSmall" | "placeholder" | "colors">;
  title?: string;
  issue?: number;
  /** rendered width; the cover keeps 2:3 */
  width: number | string;
  /** sizes attribute for srcset, defaults to the width */
  sizes?: string;
  /** 2.5D page block past the fore-edge: hero and sheet only */
  depth?: boolean;
  /** scroll-driven glint across the cover */
  sheen?: boolean;
  /** tomorrow: art blurred, no title */
  sealed?: boolean;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * A book as an object, the way Apple Books draws it: flat art, hinge crease near the spine,
 * 1px bevel, light falloff and a contact shadow tinted with the cover. The frosted title band
 * is baked into the art (tools/build-covers.py); the type on it is live text.
 */
export function Book({ cover, title, issue, width, sizes, depth, sheen, sealed, priority, className, style }: Props) {
  const w = typeof width === "number" ? `${width}px` : width;
  const vars = {
    "--w": w,
    "--c-bg": cover.colors.bg,
    "--c-dark": cover.colors.dark,
    "--c-base": cover.colors.base,
    backgroundImage: `url(${cover.placeholder})`,
    ...style,
  } as CSSProperties;
  return (
    <div
      className={[styles.book, className].filter(Boolean).join(" ")}
      data-depth={depth ? "" : undefined}
      data-sealed={sealed ? "" : undefined}
      data-sheen={sheen ? "" : undefined}
      style={{ "--w": w } as CSSProperties}
      aria-hidden="true"
    >
      <div className={styles.cover} style={vars}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static webp pair, srcset below */}
        <img
          className={styles.art}
          src={cover.srcSmall}
          srcSet={`${cover.srcSmall} 360w, ${cover.src} 1000w`}
          sizes={sizes ?? w}
          alt=""
          width={1000}
          height={1500}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          draggable={false}
        />
        {!sealed && title && (
          <span className={styles.label}>
            <span className={styles.title}>{title}</span>
            {issue != null && <span className={styles.imprint}>FantPub · № {issue}</span>}
          </span>
        )}
      </div>
    </div>
  );
}
