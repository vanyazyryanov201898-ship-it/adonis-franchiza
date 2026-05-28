"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Search, Cpu, ChevronDown, Sparkles } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [notifications] = useState(3);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [aiThinking, setAiThinking] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAiThinking(true);
      setTimeout(() => setAiThinking(false), 2000);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[rgba(139,92,246,0.12)] bg-[#07070f]/80 backdrop-blur-xl sticky top-0 z-40">
      {/* Left: Title */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-semibold text-white">{title}</h1>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Center: AI Status */}
      <motion.div
        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-violet-500/15 cursor-pointer"
        whileHover={{ borderColor: "rgba(139,92,246,0.3)" }}
      >
        <div className="relative">
          <Cpu className="w-4 h-4 text-violet-400" />
          {aiThinking && (
            <motion.div
              className="absolute inset-0 rounded-full bg-violet-400/30"
              animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
        <span className="text-xs text-violet-300 font-medium">
          {aiThinking ? "AI анализирует..." : "AI активен"}
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-slate-500 ml-1">{currentTime}</span>
      </motion.div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-500 hover:text-slate-400 hover:border-violet-500/20 transition-all">
          <Search className="w-4 h-4" />
          <span className="hidden md:block text-xs">Поиск...</span>
          <kbd className="hidden md:block text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-600 font-mono">⌘K</kbd>
        </button>

        {/* Generate button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl btn-ai text-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Генерировать
        </motion.button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-500 hover:text-slate-400 hover:border-violet-500/20 transition-all">
          <Bell className="w-4 h-4" />
          {notifications > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 text-[10px] text-white flex items-center justify-center font-bold"
            >
              {notifications}
            </motion.span>
          )}
        </button>

        {/* User avatar */}
        <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-violet-500/20 transition-all">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
            A
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-medium text-white">Адонис</div>
            <div className="text-[10px] text-slate-500">Admin</div>
          </div>
          <ChevronDown className="hidden md:block w-3 h-3 text-slate-600" />
        </button>
      </div>
    </header>
  );
}
