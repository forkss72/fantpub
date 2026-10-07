/** A short tick on Android; iOS web has no haptics, so it never carries meaning. */
export function tick(ms = 8) {
  try {
    navigator.vibrate?.(ms);
  } catch {}
}
