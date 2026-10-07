"use client";

import { useEffect } from "react";

type UAData = { brands?: { brand: string }[] };

/** Refraction in backdrop-filter renders only in Blink; Safari and Firefox parse it and draw nothing. */
const isBlink = () => !!(navigator as Navigator & { userAgentData?: UAData }).userAgentData?.brands?.some((b) => b.brand === "Chromium");
// ponytail: crude low-end gate; calibrate on a Mali-G57-class phone
const isLowEnd = () => ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) < 4 || (navigator.hardwareConcurrency ?? 8) < 4;

/**
 * R/G-encoded displacement for a capsule: lensing only in the outer `bezel` px, centre untouched.
 * Runs in a worker: the per-pixel loop cost ~0.5s of main thread on a throttled phone.
 */
function capsuleMapWorker() {
  self.onmessage = async (e: MessageEvent<{ w: number; h: number; bezel: number }>) => {
    const { w, h, bezel } = e.data;
    const W = Math.round(w);
    const H = Math.round(h);
    const R = H / 2;
    const c = new OffscreenCanvas(W, H);
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(W, H);
    const d = img.data;
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const px = x + 0.5 - W / 2;
        const py = y + 0.5 - H / 2;
        const qx = Math.abs(px) - (W / 2 - R);
        const qy = Math.abs(py) - (H / 2 - R);
        const inside = -(Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - R);
        let nx = 0;
        let ny = 0;
        if (qx > 0 && qy > 0) {
          const l = Math.hypot(qx, qy) || 1;
          nx = (qx / l) * Math.sign(px);
          ny = (qy / l) * Math.sign(py);
        } else if (qx > qy) nx = Math.sign(px);
        else ny = Math.sign(py);
        const t = Math.min(Math.max(inside / bezel, 0), 1);
        const mag = Math.pow(1 - t, 2.2);
        const i = (y * W + x) * 4;
        d[i] = 128 - nx * mag * 127; // sample inward: never reads outside the backdrop
        d[i + 1] = 128 - ny * mag * 127;
        d[i + 2] = 128;
        d[i + 3] = 255;
      }
    ctx.putImageData(img, 0, 0);
    (self as unknown as Worker).postMessage(await c.convertToBlob());
  };
}

function spawnMapWorker(): Worker | null {
  try {
    const src = `(${capsuleMapWorker.toString()})()`;
    return new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
  } catch {
    return null;
  }
}

/** Edge refraction for one glass element (the tab bar capsule), Blink only, off on weak devices. */
export function GlassLens({ targetId }: { targetId: string }) {
  useEffect(() => {
    if (!isBlink() || isLowEnd() || matchMedia("(prefers-reduced-transparency: reduce)").matches) return;
    const el = document.getElementById(targetId);
    const fe = document.getElementById("lg-lens-map");
    if (!el || !fe) return;
    const worker = spawnMapWorker();
    if (!worker) return;
    let url = "";
    let timer = 0;
    let size = "";
    let pending = { w: 0, h: 0 };
    worker.onmessage = (e: MessageEvent<Blob>) => {
      URL.revokeObjectURL(url);
      url = URL.createObjectURL(e.data);
      fe.setAttribute("href", url);
      fe.setAttribute("width", String(pending.w));
      fe.setAttribute("height", String(pending.h));
      document.documentElement.dataset.refract = "";
    };
    const fit = () => {
      const r = el.getBoundingClientRect();
      if (r.width < 120) return; // minimized: no refraction
      const key = `${Math.round(r.width)}x${Math.round(r.height)}`;
      if (key === size) return;
      size = key;
      pending = { w: r.width, h: r.height };
      worker.postMessage({ w: r.width, h: r.height, bezel: 16 });
    };
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = window.setTimeout(fit, 160);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      delete document.documentElement.dataset.refract;
    };
  }, [targetId]);

  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <filter id="lg-lens" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB" primitiveUnits="userSpaceOnUse">
        <feImage id="lg-lens-map" x="0" y="0" preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="28" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
