"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import GenerationIndicator from "@/components/GenerationIndicator";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <GenerationIndicator />
      </div>
    </div>
  );
}
