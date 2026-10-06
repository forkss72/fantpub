import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { Analytics } from "@vercel/analytics/next";
import { fontVars } from "./fonts";
import { SITE_DESCRIPTOR, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_DESCRIPTOR}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ru_RU",
    title: `${SITE_NAME} — ${SITE_DESCRIPTOR}`,
    description: SITE_TAGLINE,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f2e7",
};

/**
 * Applies reading prefs + theme before first paint (no flash), and the blind-reading
 * mask when a story was opened from today's ritual or via a riddle link (?z=1).
 */
const bootScript = `(function(){try{
var d=document.documentElement,s=JSON.parse(localStorage.getItem('fantpub:v1')||'{}'),p=s.prefs||{};
var t=p.theme||'auto';if(t==='auto'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dusk':'paper'}
d.dataset.theme=t;d.dataset.font=p.font||'literata';d.dataset.size=String(p.size||3);d.dataset.leading=p.leading||'normal';
var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute('content',t==='paper'?'#f6f2e7':t==='dusk'?'#24201a':'#121211')}
var q=new URLSearchParams(location.search);
if(location.pathname.indexOf('/rasskaz/')===0){var slug=location.pathname.split('/')[2];
if(q.get('z')==='1'||sessionStorage.getItem('fantpub:blind')===slug){var r=s.read||{};if(!r[slug]||q.get('z')==='1'){d.dataset.blind='1'}}}
}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <div id="app-root">
          <ViewTransition default="page">{children}</ViewTransition>
        </div>
        <BottomNav />
        <Analytics />
      </body>
    </html>
  );
}
