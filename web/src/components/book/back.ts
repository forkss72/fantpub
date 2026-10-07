import type { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;

let lockedUntil = 0;

/** One history step per gesture: a double tap on ✕ must not pop two entries. */
export function backOnce(router: Router) {
  const now = Date.now();
  if (now < lockedUntil) return;
  lockedUntil = now + 700;
  router.back();
}

/** Full page: back if the visitor came from inside the app, otherwise to Today. */
export function leavePage(router: Router) {
  let depth = 0;
  try {
    depth = Number(sessionStorage.getItem("fantpub:depth") ?? "0");
  } catch {}
  if (depth > 1 && history.length > 1) backOnce(router);
  else router.push("/");
}
