"use client";

import { showHud } from "@/components/ui/Hud";

const coarse = () => typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;

/** Native share sheet on phones, copy + HUD elsewhere. Returns how it went. */
export async function shareOrCopy(url: string, title: string, text?: string): Promise<"shared" | "copied" | "failed"> {
  if (coarse() && navigator.share) {
    try {
      await navigator.share({ url, title, text });
      return "shared";
    } catch (e) {
      if ((e as DOMException)?.name === "AbortError") return "failed";
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    showHud("Ссылка скопирована", "link");
    return "copied";
  } catch {
    showHud("Не получилось скопировать");
    return "failed";
  }
}
