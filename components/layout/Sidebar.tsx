"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  Sparkles,
  Video,
  Send,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Crown,
  Activity,
  Link2,
  ScanSearch,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Дашборд",
    badge: null,
    color: "text-violet-400",
  },
  {
    href: "/trends",
    icon: TrendingUp,
    label: "Тренды",
    badge: "Live",
    color: "text-cyan-400",
  },
  {
    href: "/generator",
    icon: Sparkles,
    label: "AI Генератор",
    badge: null,
    color: "text-purple-400",
  },
  {
    href: "/video-factory",
    icon: Video,
    label: "Видео-фабрика",
    badge: "3",
    color: "text-blue-400",
  },
  {
    href: "/autopost",
    icon: Send,
    label: "Автопостинг",
    badge: null,
    color: "text-emerald-400",
  },
  {
    href: "/analytics",
    icon: BarChart3,
    label: "Аналитика",
    badge: null,
    color: "text-orange-400",
  },
  {
    href: "/channels",
    icon: Link2,
    label: "Каналы",
    badge: null,
    color: "text-emerald-400",
  },
  {
    href: "/analysis",
    icon: ScanSearch,
    label: "Анализ",
    badge: "AI",
    color: "text-cyan-400",
  },
  {
    href: "/brand",
    icon: Palette,
    label: "Бренд",
    badge: null,
    color: "text-pink-400",
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Настройки",
    badge: null,
    color: "text-slate-400",
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-[#09091a] border-r border-[rgba(139,92,246,0.12)] overflow-hidden flex-shrink-0"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-violet-900/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-violet-900/5 to-transparent" />
      </div>

      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 p-5 border-b border-[rgba(139,92,246,0.12)]",
        collapsed && "justify-center px-4"
      )}>
        {/* Logo Icon */}
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center animate-glow-pulse">
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#09091a] animate-pulse" />
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="text-sm font-bold text-white leading-none">ADONIS</div>
              <div className="text-[10px] text-violet-400 font-medium mt-0.5 tracking-widest uppercase">AI Platform</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Status Banner */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-3 mt-3"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-900/30 to-blue-900/20 border border-violet-500/20">
              <Activity className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
              <span className="text-xs text-violet-300 font-medium">AI активен · Генерирует</span>
              <div className="ml-auto flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full bg-violet-400"
                    animate={{ height: [4, 12, 4] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "sidebar-active"
                    : "hover:bg-white/[0.04]"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-500 rounded-full"
                  />
                )}

                <Icon
                  className={cn(
                    "w-[18px] h-[18px] flex-shrink-0 transition-colors",
                    isActive ? item.color : "text-slate-500 group-hover:text-slate-400"
                  )}
                />

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "text-sm font-medium flex-1 whitespace-nowrap",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-300"
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {!collapsed && item.badge && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "px-1.5 py-0.5 text-[10px] font-bold rounded-md",
                      item.badge === "Live"
                        ? "bg-emerald-500/20 text-emerald-400 animate-pulse"
                        : "bg-violet-500/20 text-violet-400"
                    )}
                  >
                    {item.badge}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Plan badge */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-3"
          >
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <Crown className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-amber-300">Pro Plan</div>
                <div className="text-[10px] text-amber-500/70">∞ генераций</div>
              </div>
              <div className="ml-auto">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center w-full py-4 border-t border-[rgba(139,92,246,0.12)] text-slate-500 hover:text-violet-400 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <ChevronLeft className="w-4 h-4" />
            <span>Свернуть</span>
          </div>
        )}
      </button>
    </motion.aside>
  );
}
