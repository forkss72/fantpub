import { ViewTransition } from "react";

/** Enter/exit only on route changes — in-page updates (search, refresh) never animate. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      {children}
    </ViewTransition>
  );
}
