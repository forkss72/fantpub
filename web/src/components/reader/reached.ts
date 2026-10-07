/**
 * Calls `cb` once `el` has stayed in view for 1.2 s after the reader scrolled there.
 * Tab jumps focus (and the page) straight into the finish: until the next wheel, touch, click or
 * other key, that doesn't count — the clock starts on entering the view, or on the first real scroll
 * while in view, never on a focus jump. So a keyboard pass never marks a story read.
 * Returns the cleanup.
 */
export function onReached(el: Element, cb: () => void, init?: IntersectionObserverInit): () => void {
  let t = 0;
  let inView = false;
  let tabbing = false;
  const arm = () => {
    if (t || !inView || tabbing) return;
    t = window.setTimeout(() => {
      stop();
      cb();
    }, 1200);
  };
  const disarm = () => {
    window.clearTimeout(t);
    t = 0;
  };
  const onKey = (e: KeyboardEvent) => (tabbing = e.key === "Tab");
  const onInput = () => (tabbing = false);
  const io = new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    if (inView) arm();
    else disarm();
  }, init);
  const inputs = ["wheel", "touchstart", "pointerdown"] as const;
  window.addEventListener("keydown", onKey, true);
  inputs.forEach((n) => window.addEventListener(n, onInput, { capture: true, passive: true }));
  window.addEventListener("scroll", arm, { passive: true });
  io.observe(el);
  function stop() {
    io.disconnect();
    disarm();
    window.removeEventListener("keydown", onKey, true);
    inputs.forEach((n) => window.removeEventListener(n, onInput, true));
    window.removeEventListener("scroll", arm);
  }
  return stop;
}
