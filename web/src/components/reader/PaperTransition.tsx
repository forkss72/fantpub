"use client";

import { ViewTransition, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * The reader's paper layer is where the sheet's cover lands (open-book). A book sheet opened over the
 * reader is an intercepted route, so the reader stays mounted under it: while the URL is not this
 * story's, the paper gives the name up so `book-<slug>` stays unique (same hand-off as BookTransition).
 */
export function PaperTransition({ slug, children }: { slug: string; children: ReactNode }) {
  const pathname = usePathname();
  if (pathname !== `/rasskaz/${slug}`) return children;
  return (
    <ViewTransition name={`book-${slug}`} share="open-book" default="none">
      {children}
    </ViewTransition>
  );
}
