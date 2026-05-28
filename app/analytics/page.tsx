"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Users, Eye, Flame,
  ArrowUpRight, ArrowDownRight, Download,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { analyticsData, platformReachData } from "@/lib/mock-data";
import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Cell,
} from "recharts";

const periods = ["7 дней", "30 дней", "90 дней", "Год"];

const topVideos = [
  { title: "Уход из найма — мой опыт", platform: "TikTok", views: 2400000, leads: 234, conv: 4.8, score: 94 },
  { title: "Бизнес на печати с нуля", platform: "Instagram", views: 1890000, leads: 198, conv: 4.2, score: 91 },
  { title: "Сколько стоит франшиза", platform: "YouTube", views: 1560000, leads: 167, conv: 3.9, score: 88 },
  { title: "Первые 500К — мой путь", platform: "TikTok", views: 1340000, leads: 143, conv: 3.7, score: 87 },
  { title: "Партнёр ADONIS: год спустя", platform: "Instagram", views: 1120000, leads: 121, conv: 3.5, score: 85 },
];

const funnelData = [
  { stage: "Охват", value: 2840000, color: "#8b5cf6" },
  { stage: "Просмотры", value: 1890000, color: "#3b82f6" },
  { stage: "Клики", value: 234000, color: "#06b6d4" },
  { stage: "Лиды", value: 18400, color: "#10b981" },
  { stage: "Сделки", value: 1240, color: "#f59e0b" },
];

const platformColors: Record<string, string> = {
  TikTok: "#fe2c55",
  Instagram: "#e91e8c",
  YouTube: "#ff4444",
  VK: "#0077ff",
  Telegram: "#26a5e4",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-[#0d0d1a]/95 border border-violet-500/20 backdrop-blur-xl shadow-xl">
        <p className="text-xs font-semibold text-white mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-white font-medium">{entry.value.toLocaleString("ru-RU")}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [activePeriod, setActivePeriod] = useState("30 дней");

  const totalViews = analyticsData.weeklyViews.reduce((s, d) => s + d.views, 0);
  const totalLeads = analyticsData.weeklyViews.reduce((s, d) => s + d.leads, 0);

  return (
    <AppLayout title="Аналитика" subtitle="Детальный анализ эффективности контента">
      <div className="p-6 space-y-6">

        {/* Period selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activePeriod === period
                    ? "bg-violet-600/80 text-white"
                    : "text-slate-500 hover:text-slate-400"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-slate-400 hover:text-white transition-colors">
            <Download className="w-3.5 h-3.5" />
            Экспорт
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Охваты",
              value: (totalViews / 1000000).toFixed(1) + "M",
              change: +34,
              icon: Eye,
              color: "text-blue-400",
              glow: "rgba(59, 130, 246, 0.3)",
            },
            {
              label: "Лиды",
              value: totalLeads.toLocaleString("ru-RU"),
              change: +18,
              icon: Users,
              color: "text-emerald-400",
              glow: "rgba(16, 185, 129, 0.3)",
            },
            {
              label: "Конверсия",
              value: "4.7%",
              change: +0.8,
              icon: TrendingUp,
              color: "text-violet-400",
              glow: "rgba(139, 92, 246, 0.3)",
            },
            {
              label: "Viral Score",
              value: "91.4",
              change: +5,
              icon: Flame,
              color: "text-orange-400",
              glow: "rgba(249, 115, 22, 0.3)",
            },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] group hover:border-white/[0.1] transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500">{kpi.label}</span>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: kpi.glow.replace("0.3", "0.1") }}
                >
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-2">{kpi.value}</div>
              <div className={`flex items-center gap-1 text-xs font-medium ${kpi.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {kpi.change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {kpi.change >= 0 ? "+" : ""}{kpi.change}%
                <span className="text-slate-600 font-normal ml-1">vs прошлый период</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Views Chart */}
          <div className="xl:col-span-2 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-white">Охваты и лиды</h3>
                <p className="text-xs text-slate-500 mt-1">Недельная динамика</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-violet-400" />
                  Охваты
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  Лиды
                </div>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.weeklyViews} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="views"
                    name="Охваты"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#8b5cf6", stroke: "#07070f", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    name="Лиды"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#10b981", stroke: "#07070f", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Funnel */}
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <h3 className="text-sm font-semibold text-white mb-5">Воронка продаж</h3>
            <div className="space-y-3">
              {funnelData.map((stage, index) => {
                const maxVal = funnelData[0].value;
                const pct = (stage.value / maxVal) * 100;
                return (
                  <motion.div
                    key={stage.stage}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-400">{stage.stage}</span>
                      <span className="text-xs font-medium text-white">
                        {stage.value >= 1000000
                          ? `${(stage.value / 1000000).toFixed(1)}M`
                          : stage.value >= 1000
                          ? `${(stage.value / 1000).toFixed(0)}K`
                          : stage.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                    </div>
                    {index < funnelData.length - 1 && (
                      <div className="text-[10px] text-slate-600 mt-1 text-right">
                        → {((funnelData[index + 1].value / stage.value) * 100).toFixed(1)}% конверсия
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Platform breakdown */}
        <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              Эффективность по платформам
            </h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformReachData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="platform" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(0)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="reach" name="Охваты" radius={[6, 6, 0, 0]}>
                  {platformReachData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Videos */}
        <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Топ роликов по конверсии
          </h3>
          <div className="space-y-3">
            {topVideos.map((video, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer"
              >
                {/* Rank */}
                <div className="w-6 text-center">
                  <span className={`text-xs font-bold ${index === 0 ? "text-yellow-400" : "text-slate-600"}`}>
                    #{index + 1}
                  </span>
                </div>

                {/* Platform */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                  style={{
                    color: platformColors[video.platform],
                    backgroundColor: `${platformColors[video.platform]}15`,
                    border: `1px solid ${platformColors[video.platform]}30`,
                  }}
                >
                  {video.platform.slice(0, 2)}
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate group-hover:text-violet-300 transition-colors">
                    {video.title}
                  </p>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-6 text-xs">
                  <div className="text-center hidden md:block">
                    <div className="text-white font-medium">{(video.views / 1000000).toFixed(1)}M</div>
                    <div className="text-slate-600 text-[10px]">просмотров</div>
                  </div>
                  <div className="text-center hidden md:block">
                    <div className="text-emerald-400 font-medium">{video.leads}</div>
                    <div className="text-slate-600 text-[10px]">лидов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-violet-400 font-medium">{video.conv}%</div>
                    <div className="text-slate-600 text-[10px]">конверсия</div>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-400 font-medium">{video.score}</div>
                    <div className="text-slate-600 text-[10px]">score</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
