"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Video, Flame, Users, Eye, BarChart3, Cpu, TrendingUp, Sparkles, ArrowRight, RefreshCw,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import OnboardingModal from "@/components/OnboardingModal";
import MetricCard from "@/components/dashboard/MetricCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import PlatformChart from "@/components/dashboard/PlatformChart";
import VideoQueue from "@/components/dashboard/VideoQueue";
import AIActivityFeed from "@/components/dashboard/AIActivityFeed";
import { dashboardMetrics } from "@/lib/mock-data";

const metrics = [
  {
    title: "Видео сгенерировано",
    value: dashboardMetrics.videosGenerated,
    change: dashboardMetrics.videosChange,
    changeLabel: "за 30 дней",
    icon: Video,
    iconColor: "text-violet-400",
    glowColor: "rgba(139, 92, 246, 0.3)",
    suffix: "",
  },
  {
    title: "Viral Score",
    value: dashboardMetrics.viralScore,
    change: +12,
    changeLabel: "vs прошлый месяц",
    icon: Flame,
    iconColor: "text-orange-400",
    glowColor: "rgba(249, 115, 22, 0.3)",
    suffix: "/100",
  },
  {
    title: "Потенц. лиды",
    value: dashboardMetrics.potentialLeads,
    change: dashboardMetrics.leadsChange,
    changeLabel: "за 30 дней",
    icon: Users,
    iconColor: "text-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.3)",
    suffix: "",
  },
  {
    title: "Охваты",
    value: dashboardMetrics.totalReach,
    change: dashboardMetrics.reachChange,
    changeLabel: "за месяц",
    icon: Eye,
    iconColor: "text-blue-400",
    glowColor: "rgba(59, 130, 246, 0.3)",
    suffix: "",
  },
  {
    title: "Конверсия",
    value: dashboardMetrics.conversion,
    change: +0.8,
    changeLabel: "vs прошлый квартал",
    icon: BarChart3,
    iconColor: "text-cyan-400",
    glowColor: "rgba(6, 182, 212, 0.3)",
    suffix: "%",
  },
  {
    title: "AI Эффективность",
    value: dashboardMetrics.aiEfficiency,
    change: +4,
    changeLabel: "за неделю",
    icon: Cpu,
    iconColor: "text-violet-400",
    glowColor: "rgba(139, 92, 246, 0.3)",
    suffix: "%",
  },
  {
    title: "Прогноз прибыли",
    value: dashboardMetrics.revenueForecast,
    change: +67,
    changeLabel: "vs план",
    icon: TrendingUp,
    iconColor: "text-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.3)",
    prefix: "",
    suffix: " ₽",
  },
];

function AIProcessingBanner() {
  const [step, setStep] = useState(0);
  const steps = [
    "Анализирую тренды TikTok и Instagram...",
    "Генерирую сценарий «Уход из найма 2026»...",
    "Рассчитываю Viral Score для 3 роликов...",
    "Оптимизирую расписание постинга...",
    "Обновляю аналитику охватов...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-900/20 via-blue-900/15 to-violet-900/20 p-4 mb-6"
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-violet-600/10 blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-blue-600/10 blur-3xl"
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* AI indicator */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-violet-600/30 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-violet-400" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-xl bg-violet-400/20"
                animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">AI обрабатывает</div>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-violet-300 mt-0.5"
              >
                {steps[step]}
              </motion.div>
            </div>
          </div>

          {/* Progress dots */}
          <div className="hidden md:flex items-center gap-1.5 ml-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                  i === step
                    ? "bg-violet-400 scale-125"
                    : "bg-violet-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-4 h-4 text-violet-400" />
          </motion.div>
          <a href="/analytics" className="flex items-center gap-1.5 text-xs text-violet-300 hover:text-violet-200 font-medium transition-colors">
            Подробнее
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppLayout
      title="Дашборд"
      subtitle="Обзор AI-платформы ADONIS"
    >
      <OnboardingModal />
      <div className="p-6 space-y-6">
        {/* AI Processing Banner */}
        <AIProcessingBanner />

        {/* Welcome + Quick Actions */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white">
                Добро пожаловать, <span className="gradient-text">Адонис</span> 👋
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-[10px] font-700 text-amber-400 font-semibold tracking-wide">📊 ДЕМО</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Сегодня AI сгенерировал <span className="text-violet-400 font-medium">14 роликов</span> и получил <span className="text-emerald-400 font-medium">89 лидов</span>
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/analytics")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-slate-400 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
              Превью
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/generator")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-ai text-sm text-white"
            >
              <Sparkles className="w-4 h-4" />
              Создать контент
            </motion.button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {metrics.slice(0, 4).map((metric, i) => (
            <MetricCard
              key={metric.title}
              {...metric}
              loading={isLoading}
              index={i}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.slice(4).map((metric, i) => (
            <MetricCard
              key={metric.title}
              {...metric}
              loading={isLoading}
              index={i + 4}
            />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <PlatformChart />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VideoQueue />
          <AIActivityFeed />
        </div>
      </div>
    </AppLayout>
  );
}
