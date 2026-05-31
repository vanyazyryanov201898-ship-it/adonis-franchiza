"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Cpu, ChevronDown, Sparkles, X, CheckCircle2, AlertCircle, Info, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMobileMenuToggle?: () => void;
}

const mockNotifications = [
  { id: 1, type: "success", title: "Новый лид!", body: "Заявка на франшизу из TikTok", time: "2 мин назад", read: false },
  { id: 2, type: "info", title: "Viral Alert", body: "Ролик набрал 100K просмотров", time: "15 мин назад", read: false },
  { id: 3, type: "success", title: "Рендер завершён", body: "Видео «Уход из найма» готово", time: "1 ч назад", read: true },
];

export default function Header({ title, subtitle, onMobileMenuToggle }: HeaderProps) {
  const router = useRouter();
  const [notifList, setNotifList] = useState(mockNotifications);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [aiThinking, setAiThinking] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifList.filter((n) => !n.read).length;

  const pages = [
    { label: "Дашборд", href: "/dashboard" },
    { label: "Тренды", href: "/trends" },
    { label: "AI Генератор", href: "/generator" },
    { label: "Видео-фабрика", href: "/video-factory" },
    { label: "Автопостинг", href: "/autopost" },
    { label: "Аналитика", href: "/analytics" },
    { label: "Каналы", href: "/channels" },
    { label: "Анализ каналов", href: "/analysis" },
    { label: "Бренд", href: "/brand" },
    { label: "Настройки", href: "/settings" },
  ];

  const filteredPages = searchQuery.trim()
    ? pages.filter((p) => p.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : pages;

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }));
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

  useEffect(() => {
    if (showSearch) setTimeout(() => searchRef.current?.focus(), 50);
  }, [showSearch]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch((v) => !v);
      }
      if (e.key === "Escape") { setShowSearch(false); setShowNotif(false); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const markAllRead = () => setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));

  const NotifIcon = ({ type }: { type: string }) => {
    if (type === "success") return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (type === "warning") return <AlertCircle className="w-4 h-4 text-amber-400" />;
    return <Info className="w-4 h-4 text-blue-400" />;
  };

  return (
    <>
      {/* Search modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}
            >
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по разделам..."
                  className="flex-1 bg-transparent text-sm outline-none text-white placeholder-slate-500"
                />
                <button onClick={() => setShowSearch(false)}>
                  <X className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                </button>
              </div>
              <div className="py-2 max-h-64 overflow-y-auto">
                {filteredPages.map((page) => (
                  <button
                    key={page.href}
                    onClick={() => { router.push(page.href); setShowSearch(false); setSearchQuery(""); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-300 hover:text-white transition-colors"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-dim)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <span className="text-slate-500">/</span>
                    {page.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className="h-16 flex items-center justify-between px-6 backdrop-blur-xl sticky top-0 z-40"
        style={{ backgroundColor: "var(--bg-header)", borderBottom: "1px solid var(--border-default)" }}
      >
        {/* Left: Hamburger (mobile) + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-white">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
          </div>
        </div>

        {/* Center: AI Status */}
        <motion.div
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-violet-500/15 cursor-pointer"
          whileHover={{ borderColor: "var(--accent-border)" }}
        >
          <div className="relative">
            <Cpu className="w-4 h-4" style={{ color: "var(--accent)" }} />
            {aiThinking && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: "var(--accent-dim)" }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
          <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>
            {aiThinking ? "AI анализирует..." : "AI активен"}
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-500 ml-1">{currentTime}</span>
        </motion.div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-500 hover:text-slate-400 hover:border-violet-500/20 transition-all"
          >
            <Search className="w-4 h-4" />
            <span className="hidden md:block text-xs">Поиск...</span>
            <kbd className="hidden md:block text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-600 font-mono">⌘K</kbd>
          </button>

          {/* Generate button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/generator")}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl btn-ai text-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Генерировать
          </motion.button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotif((v) => !v)}
              className="relative p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-500 hover:text-slate-400 hover:border-violet-500/20 transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] text-white flex items-center justify-center font-bold"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotif && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl overflow-hidden z-50"
                  style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}
                >
                  <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <span className="text-sm font-semibold text-white">Уведомления</span>
                    <button onClick={markAllRead} className="text-[11px] text-slate-500 hover:text-white transition-colors">
                      Прочитать все
                    </button>
                  </div>
                  <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                    {notifList.map((n) => (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                        style={{ backgroundColor: n.read ? "transparent" : "var(--accent-dim)" }}
                        onClick={() => setNotifList((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          <NotifIcon type={n.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white">{n.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{n.body}</p>
                          <p className="text-[10px] text-slate-600 mt-1">{n.time}</p>
                        </div>
                        {!n.read && (
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: "var(--accent)" }} />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User avatar */}
          <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-violet-500/20 transition-all">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, var(--accent), var(--accent-2))` }}>
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
    </>
  );
}
