"use client";

import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { platformReachData } from "@/lib/data/mock-data";

const platformColors: Record<string, string> = {
  TikTok: "#fe2c55",
  Instagram: "#e91e8c",
  YouTube: "#ff4444",
  VK: "#0077ff",
  Telegram: "#26a5e4",
  Rutube: "#003087",
  Yappy: "#ff6600",
};

const platformIcons: Record<string, string> = {
  TikTok: "T",
  Instagram: "In",
  YouTube: "Yt",
  VK: "VK",
  Telegram: "Tg",
  Rutube: "Rt",
  Yappy: "Yp",
};

const total = platformReachData.reduce((sum, p) => sum + p.reach, 0);

export default function PlatformChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6"
    >
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-white">Охваты по платформам</h3>
        <p className="text-xs text-slate-500 mt-1">
          Итого: {(total / 1000000).toFixed(1)}M охватов
        </p>
      </div>

      {/* Donut chart */}
      <div className="flex items-center gap-6">
        <div className="w-32 h-32 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={platformReachData}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={56}
                paddingAngle={3}
                dataKey="reach"
                strokeWidth={0}
              >
                {platformReachData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={platformColors[entry.platform] || "#8b5cf6"}
                    opacity={0.85}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {platformReachData.map((platform, index) => {
            const pct = ((platform.reach / total) * 100).toFixed(1);
            const color = platformColors[platform.platform];
            return (
              <motion.div
                key={platform.platform}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.07 }}
                className="flex items-center gap-2.5"
              >
                {/* Platform badge */}
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: `${color}25`, border: `1px solid ${color}40` }}
                >
                  <span style={{ color }}>{platformIcons[platform.platform]}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400 font-medium">{platform.platform}</span>
                    <span className="text-xs text-slate-500">{pct}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-500 flex-shrink-0 w-14 text-right">
                  {platform.reach >= 1000000
                    ? `${(platform.reach / 1000000).toFixed(1)}M`
                    : `${(platform.reach / 1000).toFixed(0)}K`}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
