"use client";

import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { FileText, CalendarDays, Video, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tab = "script" | "plan" | "create" | "autopost";

interface DirectionLayoutProps {
  title: string;
  subtitle?: string;
  accentColor: string;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  children: React.ReactNode;
  createTabLabel?: string;
  createTabIcon?: React.ElementType;
}

export default function DirectionLayout({
  title,
  subtitle,
  accentColor,
  activeTab,
  onTabChange,
  children,
  createTabLabel = "Создать видео",
  createTabIcon: CreateIcon = Video,
}: DirectionLayoutProps) {
  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "script",   label: "Сценарий",      icon: FileText },
    { id: "plan",     label: "Контент-план",  icon: CalendarDays },
    { id: "create",   label: createTabLabel,  icon: CreateIcon },
    { id: "autopost", label: "Автопостинг",   icon: Send },
  ];
  return (
    <AppLayout title={title} subtitle={subtitle}>
      <div className="p-6 space-y-4">
        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl bg-white/[0.07] border border-white/[0.10]"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon className={cn("w-4 h-4 relative z-10 flex-shrink-0", isActive ? accentColor : "")} />
                <span className="relative z-10 hidden md:inline whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </AppLayout>
  );
}
