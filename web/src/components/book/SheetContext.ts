"use client";

import { createContext } from "react";

/** Inside the book sheet: slides the card away, then steps back in history. */
export const SheetDismiss = createContext<(() => void) | null>(null);
