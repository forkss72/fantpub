"use client";

import { ViewTransition, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Shared-element name for a tappable cover on any shelf (Today, Archive, Shelf, Search).
 * The book sheet is an intercepted route, so the shelf stays mounted under it: while the sheet for
 * this book is open (URL /kniga/<slug>) the name belongs to the sheet's cover. Handing it over in
 * the same commit is what makes the cover fly into the sheet and back, and keeps names unique.
 */
export function BookTransition({ slug, children }: { slug: string; children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === `/kniga/${slug}`) return children;
  return (
    <ViewTransition name={`book-${slug}`} share="book" default="none">
      {children}
    </ViewTransition>
  );
}
