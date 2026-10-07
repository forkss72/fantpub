import type { useRouter } from "next/navigation";
import { backOrHome } from "@/lib/nav";

type Router = ReturnType<typeof useRouter>;

let lockedUntil = 0;

/** One history step per gesture: a double tap on ✕ must not pop two entries. */
export function backOnce(router: Router) {
  const now = Date.now();
  if (now < lockedUntil) return;
  lockedUntil = now + 700;
  router.back();
}

/** Full page ‹: back if the previous entry is inside the app, otherwise to Today. */
export function leavePage(router: Router) {
  backOrHome({ back: () => backOnce(router), push: router.push });
}
