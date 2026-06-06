"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { revenueChartData } from "@/lib/data/mock-data";
import { TrendingUp } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip p-3 rounded-xl bg-[#0d0d1a]/95 border border-violet-500/20 backdrop-blur-xl shadow-xl">
        <p className="text-xs font-semibold text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-white font-medium">
              {entry.name === "Выручка"
                ? `${(entry.value / 1000000).toFixed(1)}M ₽`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

type ChartView = "revenue" | "leads" | "videos";

export default function RevenueChart() {
  const [activeView, setActiveView] = useState<ChartView>("revenue");

  const views: { key: ChartView; label: string }[] = [
    { key: "revenue", label: "Выручка" },
    { key: "leads", label: "Лиды" },
    { key: "videos", label: "Видео" },
  ];

  const getDataKey = () => {
    switch (activeView) {
      case "revenue": return "revenue";
      case "leads": return "leads";
      case "videos": return "videos";
    }
  };

  const getGradientColors = () => {
    switch (activeView) {
      case "revenue": return { start: "#8b5cf6", end: "#3b82f6" };
      case "leads": return { start: "#06b6d4", end: "#3b82f6" };
      case "videos": return { start: "#10b981", end: "#06b6d4" };
    }
  };

  const formatYAxis = (value: number): string => {
    if (activeView === "revenue") {
      if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    }
    return String(value);
  };

  const colors = getGradientColors();
  const totalRevenue = revenueChartData.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Динамика роста</h3>
          <div className="flex items-center gap-2 mt-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">+284% за год</span>
            <span className="text-xs text-slate-600">·</span>
            <span className="text-xs text-slate-500">Прогноз: {(totalRevenue / 1000000).toFixed(1)}M ₽</span>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          {views.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveView(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeView === key
                  ? "bg-violet-600/80 text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.start} stopOpacity={0.4} />
                <stop offset="100%" stopColor={colors.end} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={colors.start} />
                <stop offset="100%" stopColor={colors.end} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#64748b", fontFamily: "Inter" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b", fontFamily: "Inter" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={getDataKey()}
              name={views.find(v => v.key === activeView)?.label}
              stroke="url(#lineGradient)"
              strokeWidth={2.5}
              fill="url(#chartGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: colors.start,
                strokeWidth: 2,
                stroke: "#07070f",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
