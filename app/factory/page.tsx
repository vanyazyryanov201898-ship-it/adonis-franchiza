"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import {
  User, Bot, PieChart, Palette, Scissors,
  ChevronRight, CheckCircle2, Clock, Send, LayoutGrid,
} from "lucide-react";

const directions = [
  {
    href: "/factory/heygen-live",
    icon: User,
    label: "HeyGen Живой",
    description: "Видео с реальным аватаром. Сценарии в голосе Ильи, прямая подача.",
    accent: "text-amber-400",
    border: "hover:border-amber-500/30",
    glow: "from-amber-900/20 to-transparent",
    badge: "Скоро",
    badgeColor: "bg-amber-500/15 text-amber-400",
    live: false,
  },
  {
    href: "/factory/heygen-ai",
    icon: Bot,
    label: "HeyGen AI Аватар",
    description: "AI-аватар читает сценарий. Хук → боль → решение → CTA.",
    accent: "text-violet-400",
    border: "hover:border-violet-500/30",
    glow: "from-violet-900/20 to-transparent",
    badge: "Скоро",
    badgeColor: "bg-violet-500/15 text-violet-400",
    live: false,
  },
  {
    href: "/factory/infographics",
    icon: PieChart,
    label: "Инфографика",
    description: "7 кадров с данными и цифрами. Рендер через Creatomate.",
    accent: "text-cyan-400",
    border: "hover:border-cyan-500/30",
    glow: "from-cyan-900/20 to-transparent",
    badge: "Live",
    badgeColor: "bg-emerald-500/15 text-emerald-400",
    live: true,
  },
  {
    href: "/factory/cartoon",
    icon: Palette,
    label: "Мультяшки",
    description: "Спартанец АДОНИС — маскот бренда. Юмор, стендап, истории.",
    accent: "text-pink-400",
    border: "hover:border-pink-500/30",
    glow: "from-pink-900/20 to-transparent",
    badge: "Скоро",
    badgeColor: "bg-pink-500/15 text-pink-400",
    live: false,
  },
  {
    href: "/factory/clips",
    icon: Scissors,
    label: "Нарезка",
    description: "Режешь длинные видео на Reels / Shorts. AI-план нарезки.",
    accent: "text-blue-400",
    border: "hover:border-blue-500/30",
    glow: "from-blue-900/20 to-transparent",
    badge: "Скоро",
    badgeColor: "bg-blue-500/15 text-blue-400",
    live: false,
  },
  {
    href: "/factory/posts",
    icon: Send,
    label: "Посты",
    description: "Пост под любую платформу за 10 секунд. Viral Score + анализ.",
    accent: "text-emerald-400",
    border: "hover:border-emerald-500/30",
    glow: "from-emerald-900/20 to-transparent",
    badge: "Live",
    badgeColor: "bg-emerald-500/15 text-emerald-400",
    live: true,
  },
  {
    href: "/factory/carousels",
    icon: LayoutGrid,
    label: "Карусели",
    description: "Интерактивный превью слайдов для Instagram. Хуки + caption.",
    accent: "text-orange-400",
    border: "hover:border-orange-500/30",
    glow: "from-orange-900/20 to-transparent",
    badge: "Live",
    badgeColor: "bg-orange-500/15 text-orange-400",
    live: true,
  },
];

export default function FactoryHubPage() {
  return (
    <AppLayout
      title="Контент-завод"
      subtitle="7 направлений — видео, посты, карусели. Каждое со своим сценарием, планом и автопостингом"
    >
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {directions.map((dir, i) => {
            const Icon = dir.icon;
            return (
              <motion.div
                key={dir.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link href={dir.href}>
                  <div
                    className={`relative group h-full p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] transition-all duration-300 cursor-pointer ${dir.border} hover:bg-white/[0.04]`}
                  >
                    {/* Glow */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${dir.glow} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />

                    <div className="relative z-10">
                      {/* Icon + badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${dir.accent}`} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {dir.live ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Clock className="w-3 h-3 text-slate-600" />
                          )}
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${dir.badgeColor}`}>
                            {dir.badge}
                          </span>
                        </div>
                      </div>

                      {/* Text */}
                      <h3 className="text-sm font-semibold text-white mb-1.5">{dir.label}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">{dir.description}</p>

                      {/* CTA */}
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${dir.accent} group-hover:gap-2.5 transition-all`}>
                        {dir.live ? "Открыть" : "Посмотреть"}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-2xl border border-cyan-500/20 bg-cyan-900/10 flex items-start gap-3"
        >
          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="text-cyan-300 font-medium">Инфографика уже работает</span> — генерирует 7 кадров и рендерит видео через Creatomate. Остальные направления: UI готов, сценарии пишутся, видео-генерация подключается по мере добавления API ключей.
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
