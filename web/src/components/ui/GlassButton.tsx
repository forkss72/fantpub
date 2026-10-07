import Link from "next/link";
import type { Route } from "next";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { IconType } from "./icons";
import styles from "./GlassButton.module.css";

type Common = {
  icon?: IconType;
  /** accessible name; also the visible text when `children` is absent and `wide` is set */
  label: string;
  children?: ReactNode;
  /** tinted from the cover (on a coloured field) */
  tint?: boolean;
  size?: 36 | 44 | 48;
  className?: string;
  active?: boolean;
};

type AsButton = Common & Omit<ComponentProps<"button">, "children"> & { href?: undefined };
type AsLink = Common & { href: Route; prefetch?: boolean; scroll?: boolean };

/** Floating glass circle (icon only) or capsule (with children). */
export function GlassButton(props: AsButton | AsLink) {
  const { icon: Icon, label, children, tint, size = 44, className, active } = props;
  const cls = [styles.btn, "glass", "press", tint ? "glass-tint" : "", children ? styles.capsule : "", className].filter(Boolean).join(" ");
  const inner = (
    <>
      {Icon && <Icon size={size >= 44 ? 22 : 18} weight={active ? "fill" : "regular"} aria-hidden="true" />}
      {children}
    </>
  );
  const style = { "--size": `${size}px` } as CSSProperties;
  if ("href" in props && props.href) {
    return (
      <Link href={props.href} prefetch={props.prefetch} scroll={props.scroll} className={cls} style={style} aria-label={children ? undefined : label}>
        {inner}
      </Link>
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { icon, label: _l, children: _c, tint: _t, size: _s, className: _cn, active: _a, ...rest } = props as AsButton;
  return (
    <button type="button" {...rest} className={cls} style={style} aria-label={children ? undefined : label} aria-pressed={active}>
      {inner}
    </button>
  );
}
