import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { fontVars } from "./fonts";
import { SITE_DESCRIPTOR, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { TabBar } from "@/components/TabBar";
import { BlindStyle } from "@/components/BlindStyle";
import { HudHost } from "@/components/ui/Hud";
import { ClientEffects } from "@/components/ClientEffects";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

/**
 * Before first paint: appearance, reader theme and blind reading from localStorage (no flash).
 * Blind reading seals the author of every story this browser hasn't finished;
 * a riddle link (?z=1) keeps its story sealed regardless.
 */
const bootScript = `(function(){try{
var d=document.documentElement,s=JSON.parse(localStorage.getItem('fantpub:v2')||'null');
if(!s){var o=JSON.parse(localStorage.getItem('fantpub:v1')||'null')||{},op=o.prefs||{};s={read:o.read||{},prefs:{appearance:op.theme==='paper'?'light':(op.theme==='dusk'||op.theme==='night')?'dark':'auto',blind:op.blind!==false}}}
var p=s.prefs||{},a=p.appearance||'auto';if(a==='auto'){a=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
d.dataset.scheme=a;d.dataset.reader=p.readerTheme||'original';d.dataset.font=p.font||'auto';d.dataset.size=String(p.size||4);d.dataset.leading=p.leading||'normal';d.dataset.justify=p.justify?'1':'0';d.dataset.glass=p.glass||'regular';
var q=new URLSearchParams(location.search),seg=location.pathname.split('/'),f=q.get('z')==='1'?(seg[2]||'').replace(/[^a-z0-9-]/g,''):'';
if(p.blind!==false||f){d.dataset.blind='1';var r=Object.keys(s.read||{}).map(function(k){return k.replace(/[^a-z0-9-]/g,'')}).filter(function(k){return k&&k!==f});
if(r.length){var at=function(x){return r.map(function(k){return ':root[data-blind="1"] [data-seal="'+k+'"] '+x}).join(',')};var st=document.createElement('style');st.id='fp-read';st.textContent=at('.seal-real')+'{display:inline}'+at('.seal-mask')+'{display:none}'+at('.blind-only')+'{display:none!important}'+at('.reveal-only')+'{display:revert!important}';document.head.appendChild(st)}
var sl=(seg[1]==='rasskaz'||seg[1]==='kniga')?(seg[2]||''):'';if(sl&&(sl===f||!(s.read||{})[sl])){document.addEventListener('DOMContentLoaded',function(){var h=document.querySelector('[data-seal-title]');if(h){d.dataset.realTitle=document.title;document.title='\u00ab'+h.textContent.trim()+'\u00bb \u2014 рассказ дня \u00b7 FantPub'}})}}
}catch(e){}})();`;

export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <div id="app-root">{children}</div>
        {modal}
        <TabBar />
        <BlindStyle />
        <HudHost />
        <ClientEffects />
        {/* Turn on Web Analytics in the Vercel project first, then set NEXT_PUBLIC_ANALYTICS=1 */}
        {process.env.NEXT_PUBLIC_ANALYTICS === "1" && <Analytics />}
      </body>
    </html>
  );
}
