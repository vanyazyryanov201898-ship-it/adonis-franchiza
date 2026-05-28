"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  glowColor?: string;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
  description?: string;
  index?: number;
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, value);
      setDisplayed(Math.round(current));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatted = displayed >= 1000000
    ? `${(displayed / 1000000).toFixed(1)}M`
    : displayed >= 1000
    ? `${(displayed / 1000).toFixed(1)}K`
    : displayed.toLocaleString("ru-RU");

  return (
    <span>
      {prefix}{formatted}{suffix}
    </span>
  );
}

export default function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-violet-400",
  glowColor = "rgba(139, 92, 246, 0.3)",
  prefix = "",
  suffix = "",
  loading = false,
  description,
  index = 0,
}: MetricCardProps) {
  const isPositive = change !== undefined ? change >= 0 : null;
  const numericValue = typeof value === "number" ? value : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl cursor-pointer group"
    >
      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at top right, ${glowColor} 0%, transparent 60%)`,
        }}
      />

      {/* Top gradient border */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-50"
        style={{
          background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`,
        }}
      />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</span>
            {description && (
              <span className="text-[10px] text-slate-600">{description}</span>
            )}
          </div>

          <div
            className="relative w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: `${glowColor.replace("0.3", "0.1")}`,
              border: `1px solid ${glowColor.replace("0.3", "0.2")}`,
            }}
          >
            <Icon className={cn("w-5 h-5", iconColor)} />
            {/* Icon glow */}
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ boxShadow: `0 0 15px ${glowColor}` }}
            />
          </div>
        </div>

        {/* Value */}
        {loading ? (
          <div className="space-y-2 mt-2">
            <div className="h-8 w-32 rounded-lg shimmer bg-white/[0.05]" />
            <div className="h-4 w-20 rounded-md shimmer bg-white/[0.03]" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white tracking-tight">
              {numericValue !== null ? (
                <AnimatedNumber value={numericValue} prefix={prefix} suffix={suffix} />
              ) : (
                `${prefix}${value}${suffix}`
              )}
            </div>

            {change !== undefined && (
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                    isPositive
                      ? "text-emerald-400 bg-emerald-400/10"
                      : "text-red-400 bg-red-400/10"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {isPositive ? "+" : ""}{change}%
                </div>
                {changeLabel && (
                  <span className="text-xs text-slate-600">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom shimmer line on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`,
        }}
      />
    </motion.div>
  );
}
