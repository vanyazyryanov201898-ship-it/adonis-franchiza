"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Bell, Cpu, Key, Palette,
  Globe, Shield, ChevronRight, Check, Zap,
  ExternalLink, Smartphone, MessageSquare,
  Lock, Eye, EyeOff, LogOut, Monitor,
  Sun, Moon, Sliders, Link2,
  CheckCircle2, XCircle,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useTheme, type AccentColor } from "@/lib/contexts/theme-context";

const settingsSections = [
  { id: "profile", label: "Профиль", icon: User },
  { id: "ai", label: "AI Настройки", icon: Cpu },
  { id: "notifications", label: "Уведомления", icon: Bell },
  { id: "integrations", label: "Интеграции", icon: Globe },
  { id: "security", label: "Безопасность", icon: Shield },
  { id: "appearance", label: "Внешний вид", icon: Palette },
];

const aiModels = [
  { id: "gpt4", name: "GPT-4o", description: "Наиболее мощная модель", badge: "Рекомендуется" },
  { id: "claude", name: "Claude 3.5", description: "Лучший для контента", badge: "Топ" },
  { id: "gemini", name: "Gemini Pro", description: "Быстрая генерация", badge: null },
];

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
      enabled ? "bg-violet-600" : "bg-white/[0.1]"
    }`}
  >
    <div
      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
        enabled ? "left-5" : "left-0.5"
      }`}
    />
  </button>
);

const platforms = [
  { id: "tiktok", name: "TikTok", icon: "T", color: "#fe2c55", connected: true, handle: "@adonis.franchise" },
  { id: "instagram", name: "Instagram", icon: "In", color: "#e91e8c", connected: true, handle: "@adonis_official" },
  { id: "youtube", name: "YouTube", icon: "Yt", color: "#ff4444", connected: true, handle: "ADONIS Бизнес" },
  { id: "vk", name: "VK Клипы", icon: "VK", color: "#0077ff", connected: false, handle: null },
  { id: "telegram", name: "Telegram", icon: "Tg", color: "#26a5e4", connected: true, handle: "@adonis_channel" },
  { id: "rutube", name: "Rutube", icon: "Rt", color: "#003087", connected: false, handle: null },
  { id: "yappy", name: "Yappy", icon: "Yp", color: "#ff6600", connected: false, handle: null },
];

const sessions = [
  { device: "MacBook Pro", location: "Москва, Россия", time: "Сейчас", current: true, os: "macOS" },
  { device: "iPhone 15 Pro", location: "Москва, Россия", time: "2 часа назад", current: false, os: "iOS" },
  { device: "Chrome / Windows", location: "Санкт-Петербург", time: "3 дня назад", current: false, os: "Windows" },
];

export default function SettingsPage() {
  const { theme, setTheme, accentColor, setAccentColor, compact, setCompact } = useTheme();
  const [activeSection, setActiveSection] = useState("ai");
  const [showPassword, setShowPassword] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };
  const [settings, setSettings] = useState({
    autoGenerate: true,
    viralOptimize: true,
    autoPost: false,
    notifications: true,
    emailReports: true,
    aiModel: "claude",
    language: "ru",
    theme: "dark",
    // Notifications
    notifNewLead: true,
    notifViralAlert: true,
    notifDailyReport: true,
    notifWeeklyReport: false,
    notifRenderDone: true,
    notifTelegram: true,
    notifEmail: true,
    notifPush: false,
    // Security
    twoFactor: false,
    // Appearance
    accentColor: "violet",
    sidebarCollapsed: false,
    compactMode: false,
    animations: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <AppLayout title="Настройки" subtitle="Управление платформой и AI">
      <div className="p-6">
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-sm text-emerald-300 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {notification}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* Sidebar Nav */}
          <div className="xl:col-span-1">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all ${
                    activeSection === section.id
                      ? "sidebar-active text-white"
                      : "text-slate-500 hover:text-slate-400 hover:bg-white/[0.03]"
                  }`}
                >
                  <section.icon className={`w-4 h-4 ${activeSection === section.id ? "text-violet-400" : ""}`} />
                  {section.label}
                  {activeSection === section.id && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-violet-400" />
                  )}
                </button>
              ))}
            </nav>

            {/* Save indicator */}
            <AnimatePresence>
              {savedMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">Сохранено!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="xl:col-span-3 space-y-5">

            {/* ───── AI Settings ───── */}
            {activeSection === "ai" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-violet-400" />
                    AI Модель
                  </h3>
                  <div className="space-y-3">
                    {aiModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setSettings((prev) => ({ ...prev, aiModel: model.id }))}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl text-left border transition-all ${
                          settings.aiModel === model.id
                            ? "border-violet-500/40 bg-violet-500/10"
                            : "border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          settings.aiModel === model.id ? "bg-violet-600/40" : "bg-white/[0.06]"
                        }`}>
                          <Cpu className={`w-4 h-4 ${settings.aiModel === model.id ? "text-violet-300" : "text-slate-500"}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{model.name}</span>
                            {model.badge && (
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-violet-600/30 text-violet-300">
                                {model.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">{model.description}</span>
                        </div>
                        {settings.aiModel === model.id && (
                          <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Автоматизация AI
                  </h3>
                  <div className="space-y-5">
                    {[
                      { key: "autoGenerate" as const, title: "Авто-генерация контента", description: "AI автоматически создаёт сценарии по расписанию" },
                      { key: "viralOptimize" as const, title: "Оптимизация Viral Score", description: "AI анализирует и улучшает вирусность контента" },
                      { key: "autoPost" as const, title: "Автопостинг", description: "Публикация в лучшее время без вашего участия" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-white">{item.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                        </div>
                        <Toggle enabled={settings[item.key] as boolean} onChange={() => toggle(item.key)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Key className="w-4 h-4 text-orange-400" />
                    API Ключи
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: "OpenAI API", status: "connected", key: "sk-...7x9k" },
                      { name: "Anthropic API", status: "connected", key: "sk-ant-...3m2p" },
                      { name: "ElevenLabs (Voice)", status: "connected", key: "xi_...8q1w" },
                      { name: "Creatomate (Video)", status: "not_connected", key: null },
                    ].map((api) => (
                      <div key={api.name} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <div className={`w-2 h-2 rounded-full ${api.status === "connected" ? "bg-emerald-400" : "bg-slate-600"}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{api.name}</p>
                          {api.key ? (
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{api.key}</p>
                          ) : (
                            <p className="text-xs text-slate-600 mt-0.5">Не подключено</p>
                          )}
                        </div>
                        <button
                          onClick={() => showToast(api.status === "connected" ? "Измените ключ в файле .env.local" : "Добавьте ключ в файл .env.local")}
                          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                            api.status === "connected"
                              ? "text-slate-500 hover:text-white bg-white/[0.04]"
                              : "text-violet-400 hover:text-violet-300 bg-violet-500/10 border border-violet-500/20"
                          }`}
                        >
                          {api.status === "connected" ? "Изменить" : "Подключить"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ───── Profile ───── */}
            {activeSection === "profile" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <h3 className="text-sm font-semibold text-white mb-6">Профиль компании</h3>
                  <div className="flex items-center gap-5 mb-6 pb-6 border-b border-white/[0.06]">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                      A
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">ADONIS</h4>
                      <p className="text-sm text-slate-500">Производство мерча · Франчайзинг</p>
                      <button
                        onClick={() => showToast("Загрузка логотипа — откройте раздел Бренд")}
                        className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        Изменить логотип →
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Название компании", value: "ADONIS" },
                      { label: "Сайт", value: "adonis.ru" },
                      { label: "Email", value: "info@adonis.ru" },
                      { label: "Телефон", value: "+7 (999) 123-45-67" },
                    ].map((field) => (
                      <div key={field.label}>
                        <label className="text-xs text-slate-500 mb-1.5 block">{field.label}</label>
                        <input
                          type="text"
                          defaultValue={field.value}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:border-violet-500/40 transition-colors"
                        />
                      </div>
                    ))}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      className="mt-2 px-6 py-2.5 rounded-xl btn-ai text-sm text-white font-medium"
                    >
                      Сохранить изменения
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ───── Notifications ───── */}
            {activeSection === "notifications" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                {/* Channels */}
                <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    Каналы уведомлений
                  </h3>
                  <div className="space-y-4">
                    {[
                      { key: "notifTelegram" as const, icon: "Tg", label: "Telegram", description: "Мгновенные уведомления в бот", color: "#26a5e4" },
                      { key: "notifEmail" as const, icon: "✉", label: "Email", description: "Дайджест на почту", color: "#8b5cf6" },
                      { key: "notifPush" as const, icon: "🔔", label: "Push-уведомления", description: "Браузерные уведомления", color: "#f59e0b" },
                    ].map((channel) => (
                      <div key={channel.key} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: `${channel.color}20`, color: channel.color }}
                        >
                          {channel.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{channel.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{channel.description}</p>
                        </div>
                        <Toggle enabled={settings[channel.key] as boolean} onChange={() => toggle(channel.key)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Events */}
                <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-violet-400" />
                    Типы событий
                  </h3>
                  <div className="space-y-5">
                    {[
                      { key: "notifNewLead" as const, title: "Новый лид", description: "Заявка на франшизу из соцсетей", badge: "Важное" },
                      { key: "notifViralAlert" as const, title: "Viral Alert", description: "Ролик набрал более 100K просмотров за час", badge: "AI" },
                      { key: "notifRenderDone" as const, title: "Рендер завершён", description: "Видео готово к публикации", badge: null },
                      { key: "notifDailyReport" as const, title: "Ежедневный отчёт", description: "Сводка по лидам, охватам и видео в 20:00", badge: null },
                      { key: "notifWeeklyReport" as const, title: "Еженедельный отчёт", description: "Расширенная аналитика по понедельникам", badge: null },
                    ].map((item) => (
                      <div key={item.key} className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">{item.title}</p>
                            {item.badge && (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                item.badge === "Важное" ? "bg-red-500/20 text-red-400" : "bg-violet-500/20 text-violet-400"
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                        </div>
                        <Toggle enabled={settings[item.key] as boolean} onChange={() => toggle(item.key)} />
                      </div>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl btn-ai text-sm text-white font-medium"
                >
                  Сохранить настройки
                </motion.button>
              </motion.div>
            )}

            {/* ───── Integrations ───── */}
            {activeSection === "integrations" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                {/* Social Platforms */}
                <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-violet-400" />
                    Социальные сети
                  </h3>
                  <div className="space-y-3">
                    {platforms.map((platform) => (
                      <div key={platform.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] transition-all">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ backgroundColor: `${platform.color}20`, color: platform.color, border: `1px solid ${platform.color}30` }}
                        >
                          {platform.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">{platform.name}</p>
                            {platform.connected ? (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Подключено
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                Не подключено
                              </span>
                            )}
                          </div>
                          {platform.handle && (
                            <p className="text-xs text-slate-500 mt-0.5 font-mono">{platform.handle}</p>
                          )}
                        </div>
                        <button
                          onClick={() => showToast(platform.connected ? `${platform.name} отключён` : "Перейдите в раздел Каналы для подключения")}
                          className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                            platform.connected
                              ? "border-white/[0.08] text-slate-500 hover:text-red-400 hover:border-red-500/30 bg-white/[0.02]"
                              : "border-violet-500/30 text-violet-400 hover:text-violet-300 bg-violet-500/10"
                          }`}
                        >
                          {platform.connected ? "Отключить" : "Подключить"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CRM & Tools */}
                <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-orange-400" />
                    CRM и инструменты
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: "AmoCRM", description: "Синхронизация лидов", connected: false, color: "#ff6b35" },
                      { name: "Bitrix24", description: "Управление сделками", connected: false, color: "#ef4444" },
                      { name: "Google Analytics", description: "Аналитика трафика", connected: true, color: "#f59e0b" },
                      { name: "Яндекс.Метрика", description: "Аналитика для RU", connected: false, color: "#ef4444" },
                    ].map((tool) => (
                      <div key={tool.name} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] transition-all">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: `${tool.color}20`, color: tool.color }}>
                          {tool.name[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{tool.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{tool.description}</p>
                        </div>
                        {tool.connected ? (
                          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Активно
                          </span>
                        ) : (
                          <button
                            onClick={() => showToast(`${tool.name} — интеграция в разработке`)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-violet-500/30 text-violet-400 hover:text-violet-300 bg-violet-500/10 transition-all flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Подключить
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ───── Security ───── */}
            {activeSection === "security" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                {/* Password */}
                <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-violet-400" />
                    Смена пароля
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: "Текущий пароль", placeholder: "••••••••" },
                      { label: "Новый пароль", placeholder: "Минимум 8 символов" },
                      { label: "Повторите пароль", placeholder: "Повторите новый пароль" },
                    ].map((field, i) => (
                      <div key={field.label}>
                        <label className="text-xs text-slate-500 mb-1.5 block">{field.label}</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder={field.placeholder}
                            className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/40 transition-colors"
                          />
                          {i === 0 && (
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      className="px-6 py-2.5 rounded-xl btn-ai text-sm text-white font-medium"
                    >
                      Обновить пароль
                    </motion.button>
                  </div>
                </div>

                {/* 2FA */}
                <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        Двухфакторная аутентификация
                      </h3>
                      <p className="text-xs text-slate-500">
                        Дополнительная защита через Telegram или Google Authenticator
                      </p>
                    </div>
                    <Toggle enabled={settings.twoFactor} onChange={() => toggle("twoFactor")} />
                  </div>
                  {settings.twoFactor && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 pt-4 border-t border-white/[0.06]"
                    >
                      <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        2FA включена — аккаунт защищён
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Sessions */}
                <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-blue-400" />
                    Активные сессии
                  </h3>
                  <div className="space-y-3">
                    {sessions.map((session, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                          <Monitor className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">{session.device}</p>
                            {session.current && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                                Текущая
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{session.location} · {session.time}</p>
                        </div>
                        {!session.current && (
                          <button
                            onClick={() => showToast(`Сессия ${session.device} завершена`)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Завершить
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => showToast("Все другие сессии завершены")}
                    className="mt-4 text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Завершить все другие сессии
                  </button>
                </div>
              </motion.div>
            )}

            {/* ───── Appearance ───── */}
            {activeSection === "appearance" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                {/* Theme */}
                <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                    <Moon className="w-4 h-4 text-violet-400" />
                    Тема интерфейса
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "dark", label: "Тёмная", icon: Moon, preview: "bg-[#07070f] border-violet-500/30" },
                      { id: "light", label: "Светлая", icon: Sun, preview: "bg-slate-100 border-slate-300" },
                      { id: "system", label: "Системная", icon: Monitor, preview: "bg-gradient-to-br from-[#07070f] to-slate-100 border-white/20" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setTheme(t.id as any); showToast(`Тема: ${t.label}`); }}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          theme === t.id
                            ? "border-violet-500/40 bg-violet-500/10"
                            : "border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className={`w-full h-12 rounded-lg mb-3 border ${t.preview}`} />
                        <t.icon className={`w-3.5 h-3.5 mb-1 ${theme === t.id ? "text-violet-400" : "text-slate-500"}`} />
                        <p className="text-xs font-medium text-white">{t.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-pink-400" />
                    Акцентный цвет
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { id: "violet", color: "#8b5cf6", label: "Violet" },
                      { id: "blue", color: "#3b82f6", label: "Blue" },
                      { id: "emerald", color: "#10b981", label: "Emerald" },
                      { id: "rose", color: "#f43f5e", label: "Rose" },
                      { id: "amber", color: "#f59e0b", label: "Amber" },
                      { id: "cyan", color: "#06b6d4", label: "Cyan" },
                    ].map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setAccentColor(a.id as AccentColor)}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl transition-all ${
                            accentColor === a.id ? "ring-2 ring-white/50 scale-110" : "opacity-70 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: a.color }}
                        >
                          {accentColor === a.id && (
                            <div className="w-full h-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* UI Options */}
                <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-slate-400" />
                    Параметры интерфейса
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">Компактный режим</p>
                        <p className="text-xs text-slate-500 mt-0.5">Уменьшенные отступы и элементы</p>
                      </div>
                      <Toggle enabled={compact} onChange={() => { setCompact(!compact); showToast(compact ? "Компактный режим выключен" : "Компактный режим включён"); }} />
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">Анимации</p>
                        <p className="text-xs text-slate-500 mt-0.5">Плавные переходы и анимации компонентов</p>
                      </div>
                      <Toggle enabled={settings.animations} onChange={() => toggle("animations")} />
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">Свёрнутый сайдбар по умолчанию</p>
                        <p className="text-xs text-slate-500 mt-0.5">Открывать платформу с боковым меню в свёрнутом виде</p>
                      </div>
                      <Toggle enabled={settings.sidebarCollapsed} onChange={() => { toggle("sidebarCollapsed"); showToast("Настройка применится при следующем входе"); }} />
                    </div>
                  </div>
                </div>


                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl btn-ai text-sm text-white font-medium"
                >
                  Сохранить внешний вид
                </motion.button>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
