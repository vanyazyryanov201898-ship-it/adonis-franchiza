import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { ToastProvider } from "@/lib/toast-context";

export const metadata: Metadata = {
  title: "ADONIS AI Platform — Контент-фабрика для продажи франшиз",
  description: "Автоматизированная AI платформа для генерации вирусного контента и продажи франшиз ADONIS",
  keywords: "ADONIS, франшиза, AI контент, автоматизация, TikTok, Instagram",
};

// Blocking script: sets theme/accent class before first paint to avoid flash
const themeScript = `
(function(){
  try{
    var t=localStorage.getItem('adonis_theme')||'dark';
    var a=localStorage.getItem('adonis_accent')||'violet';
    var c=localStorage.getItem('adonis_compact')==='true';
    var r=t==='system'
      ?(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')
      :t;
    var el=document.documentElement;
    el.classList.remove('dark','light');
    el.classList.add(r);
    el.setAttribute('data-accent',a);
    if(c)el.classList.add('compact');
  }catch(e){}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased noise-overlay">
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
