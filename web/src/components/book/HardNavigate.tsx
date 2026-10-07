"use client";

import { useEffect } from "react";

/** A soft visit to a closed or unknown book: load the real page so the 404 renders on its own. */
export function HardNavigate({ href }: { href: string }) {
  useEffect(() => {
    location.replace(href);
  }, [href]);
  return null;
}
