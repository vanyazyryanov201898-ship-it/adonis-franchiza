import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ADONIS AI Platform — Контент-фабрика для продажи франшиз",
  description: "Автоматизированная AI платформа для генерации вирусного контента и продажи франшиз ADONIS",
  keywords: "ADONIS, франшиза, AI контент, автоматизация, TikTok, Instagram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased noise-overlay">
        {children}
      </body>
    </html>
  );
}
