import { Literata } from "next/font/google";

// Preload the reading face (Cyrillic, upright) only where stories are read.
// Same file as the global, non-preloaded Literata — the browser fetches it once.
const literataPreload = Literata({ subsets: ["cyrillic"], style: ["normal"], display: "swap", preload: true });

export default function StoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span className={literataPreload.className} aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        ·
      </span>
      {children}
    </>
  );
}
