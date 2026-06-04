"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Plus, X, CalendarDays, RefreshCw,
  Link2, AlertCircle, UserCircle2, Zap, Star, TrendingUp, Clock,
} from "lucide-react";
import Link from "next/link";
import { PLATFORMS, DIRECTION_DEFAULT_PLATFORMS } from "@/lib/platforms";
import {
  type Account,
  getAccountsForDirection,
  addAccount,
  removeAccount,
} from "@/lib/accounts-store";
import { getBestTimes, getHourPerformance, getTimeLabel } from "@/lib/best-times";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";

interface AutopostTabProps {
  directionId: string;
  directionLabel: string;
}

type PlanItem = {
  day: number;
  weekday: string;
  platform: string;
  format: string;
  goal: string;
  topic: string;
  hook: string;
  bestTime: string;
  viralScore: number;
};

type ScheduleMode = "plan" | "manual";

export default function AutopostTab({ directionId, directionLabel }: AutopostTabProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlatformId, setNewPlatformId] = useState(DIRECTION_DEFAULT_PLATFORMS[directionId]?.[0] ?? "youtube");
  const [newName, setNewName] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [addForAllDirections, setAddForAllDirections] = useState(false);

  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("plan");
  const [frequency, setFrequency] = useState(5);
  const [plan, setPlan] = useState<PlanItem[] | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const [active, setActive] = useState(false);

  useEffect(() => {
    setAccounts(getAccountsForDirection(directionId));
  }, [directionId]);

  const refresh = () => setAccounts(getAccountsForDirection(directionId));

  const handleAdd = () => {
    if (!newName.trim()) return;
    addAccount({
      platformId: newPlatformId,
      name: newName.trim(),
      handle: newHandle.trim(),
      directionId: addForAllDirections ? null : directionId,
    });
    setNewName("");
    setNewHandle("");
    setShowAddForm(false);
    refresh();
  };

  const handleRemove = (id: string) => {
    removeAccount(id);
    refresh();
  };

  const loadPlan = async () => {
    const defaultPlatforms = DIRECTION_DEFAULT_PLATFORMS[directionId] ?? ["tiktok", "instagram"];
    const platformLabels = PLATFORMS
      .filter((p) => defaultPlatforms.includes(p.id))
      .map((p) => p.label);

    setLoadingPlan(true);
    setPlanError(null);
    try {
      const res = await fetch("/api/content-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: `${directionLabel} — АДОНИС франшиза`,
          platforms: platformLabels,
          frequency,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setPlanError(json.error || `HTTP ${res.status}`); return; }
      setPlan(json.plan || []);
    } catch (e: any) {
      setPlanError(e?.message || "Ошибка сети");
    } finally {
      setLoadingPlan(false);
    }
  };

  const accountsByPlatform = PLATFORMS.map((platform) => ({
    platform,
    accounts: accounts.filter((a) => a.platformId === platform.id),
  })).filter((g) => g.accounts.length > 0);

  const totalPubs = plan ? plan.length : frequency * 4;

  return (
    <div className="p-6 space-y-5">

      {/* ── Аккаунты ─────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Аккаунты для направления</h3>
          <div className="flex items-center gap-2">
            <Link
              href="/channels"
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
            >
              <Link2 className="w-3.5 h-3.5" /> Все каналы
            </Link>
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-slate-300 hover:text-white hover:bg-white/[0.09] transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Добавить
            </button>
          </div>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3">
                {/* Platform select */}
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Платформа</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setNewPlatformId(p.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all",
                          newPlatformId === p.id
                            ? "text-white border-transparent"
                            : "bg-white/[0.03] text-slate-500 border-white/[0.06] hover:text-slate-300"
                        )}
                        style={newPlatformId === p.id ? { backgroundColor: p.bgColor, borderColor: p.color + "60" } : {}}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name + handle */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Название</label>
                    <input
                      value={newName} onChange={(e) => setNewName(e.target.value)}
                      placeholder="ADONIS Инфографика"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/40 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Хэндл / URL</label>
                    <input
                      value={newHandle} onChange={(e) => setNewHandle(e.target.value)}
                      placeholder="@adonis_infographic"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/40 transition-colors"
                    />
                  </div>
                </div>

                {/* Scope toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addForAllDirections}
                    onChange={(e) => setAddForAllDirections(e.target.checked)}
                    className="w-3.5 h-3.5 accent-violet-500"
                  />
                  <span className="text-xs text-slate-400">Использовать во всех направлениях</span>
                </label>

                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    disabled={!newName.trim()}
                    className="flex-1 py-2 rounded-xl bg-violet-600/80 hover:bg-violet-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Добавить аккаунт
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-2 rounded-xl bg-white/[0.05] text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Accounts list */}
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 rounded-2xl border border-dashed border-white/[0.08] text-center gap-2">
            <UserCircle2 className="w-8 h-8 text-slate-600" />
            <p className="text-sm text-slate-500">Нет аккаунтов для этого направления</p>
            <p className="text-xs text-slate-600">Добавь аккаунты или перейди в «Все каналы»</p>
          </div>
        ) : (
          <div className="space-y-2">
            {accountsByPlatform.map(({ platform, accounts: accs }) => (
              <div key={platform.id} className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div
                  className="text-[10px] font-bold mb-2 flex items-center gap-1.5"
                  style={{ color: platform.color }}
                >
                  <span
                    className="w-4 h-4 rounded flex items-center justify-center text-[8px]"
                    style={{ backgroundColor: platform.bgColor }}
                  >
                    {platform.shortLabel}
                  </span>
                  {platform.label}
                </div>
                <div className="space-y-1.5">
                  {accs.map((acc) => (
                    <div key={acc.id} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-white font-medium">{acc.name}</span>
                        {acc.handle && (
                          <span className="text-[11px] text-slate-500 ml-2">{acc.handle}</span>
                        )}
                        {acc.directionId === null && (
                          <span className="text-[9px] text-violet-400 ml-2 font-semibold">общий</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(acc.id)}
                        className="p-1 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Расписание ───────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Расписание</h3>

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          {(["plan", "manual"] as ScheduleMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setScheduleMode(mode)}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-medium transition-all",
                scheduleMode === mode
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {mode === "plan" ? "По контент-плану" : "Вручную"}
            </button>
          ))}
        </div>

        {scheduleMode === "plan" && (
          <div className="space-y-3">
            {/* Frequency */}
            <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <span className="text-xs text-slate-400 flex-shrink-0">Постов в неделю:</span>
              <input type="range" min={3} max={7} step={1} value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="flex-1 accent-violet-500" />
              <span className="text-sm font-bold text-white w-4 text-center">{frequency}</span>
            </div>

            {/* Best time recommendations by platform */}
            {accounts.length > 0 && (
              <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-900/10 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <Star className="w-3.5 h-3.5" /> Рекомендации по выкладке
                </div>
                <div className="space-y-1.5">
                  {Array.from(new Set(accounts.map((a) => a.platformId))).map((pid) => {
                    const platform = PLATFORMS.find((p) => p.id === pid);
                    const best = getBestTimes(pid).slice(0, 2);
                    if (!platform || best.length === 0) return null;
                    return (
                      <div key={pid} className="flex items-center gap-2">
                        <span className="text-[9px] font-black w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: platform.bgColor, color: platform.color }}>
                          {platform.shortLabel}
                        </span>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">{platform.label}:</span>
                        <div className="flex gap-1 flex-wrap">
                          {best.map((slot) => (
                            <span key={slot.time} className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-[10px] text-emerald-300 font-medium">
                              {slot.time}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-600 ml-auto">{best[0]?.reason}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button onClick={loadPlan} disabled={loadingPlan}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-slate-300 hover:text-white hover:bg-white/[0.07] transition-all disabled:opacity-60">
              {loadingPlan ? (
                <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw className="w-4 h-4" /></motion.div> Загружаю план...</>
              ) : (
                <><CalendarDays className="w-4 h-4" /> {plan ? "Обновить план" : "Загрузить контент-план"}</>
              )}
            </button>

            {planError && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400">{planError}</p>
              </div>
            )}

            {plan && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                {plan.slice(0, 12).map((item) => {
                  const platform = PLATFORMS.find((p) => p.label.toLowerCase() === item.platform.toLowerCase());
                  // Compute an actual date from today + day offset
                  const postDate = addDays(new Date(), item.day - 1);
                  const dateLabel = format(postDate, "d MMM");
                  const perf = getHourPerformance(item.bestTime);
                  const timeInfo = getTimeLabel(perf);
                  const isGoodTime = perf >= 1.5;

                  return (
                    <div key={item.day}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                      {/* Day badge */}
                      <div className="flex-shrink-0 text-center w-12">
                        <div className="text-[9px] text-slate-600">{item.weekday}</div>
                        <div className="text-[10px] font-bold text-white">{dateLabel}</div>
                      </div>
                      {/* Platform */}
                      {platform && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ color: platform.color, backgroundColor: platform.bgColor }}>
                          {platform.shortLabel}
                        </span>
                      )}
                      {/* Topic */}
                      <span className="text-[11px] text-slate-300 truncate flex-1">{item.topic}</span>
                      {/* Time + quality */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isGoodTime && <Star className="w-2.5 h-2.5 text-amber-400" />}
                        <span className={cn("text-[10px] font-medium", timeInfo.color)}>{item.bestTime}</span>
                      </div>
                    </div>
                  );
                })}
                {plan.length > 12 && (
                  <p className="text-center text-xs text-slate-600 py-1">+ ещё {plan.length - 12} публикаций</p>
                )}
              </motion.div>
            )}
          </div>
        )}

        {scheduleMode === "manual" && (
          <div className="p-5 rounded-2xl border border-dashed border-white/[0.08] text-center">
            <CalendarDays className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Ручное планирование</p>
            <p className="text-xs text-slate-600 mt-1">Создавай посты вручную через раздел Автопостинг</p>
            <Link href="/autopost" className="inline-flex items-center gap-1.5 mt-3 text-xs text-violet-400 hover:text-violet-300 transition-colors">
              Перейти в Автопостинг →
            </Link>
          </div>
        )}
      </div>

      {/* ── Активация ───────────────────────────────────── */}
      <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3">
        {active ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-emerald-400">Автопостинг активен</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-400">
              <span><span className="text-white font-medium">{totalPubs}</span> публикаций</span>
              <span><span className="text-white font-medium">{accounts.length}</span> аккаунтов</span>
              <span><span className="text-white font-medium">{frequency}</span> постов/неделю</span>
            </div>
            {/* Mini analytics after activation */}
            <div className="p-3 rounded-xl bg-violet-900/15 border border-violet-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-400">
                <TrendingUp className="w-3.5 h-3.5" /> Анализ будет доступен после первых публикаций
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                После выкладки роликов мы проанализируем в какое время они лучше залетают и покажем рекомендации прямо здесь.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Clock className="w-3 h-3" />
                Следующая публикация:
                <span className="text-white font-medium ml-0.5">
                  {plan?.[0] ? `${plan[0].weekday} в ${plan[0].bestTime}` : "по расписанию"}
                </span>
              </div>
              <Link href="/autopost" className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 transition-colors">
                Открыть календарь →
              </Link>
            </div>
            <button onClick={() => setActive(false)}
              className="w-full py-2 rounded-xl border border-red-500/25 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
              Остановить
            </button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Zap className="w-4 h-4 text-violet-400" />
              <span>Запустит автоматическую публикацию по расписанию</span>
            </div>
            {accounts.length === 0 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />
                Сначала добавь хотя бы один аккаунт
              </div>
            )}
            <button
              onClick={() => setActive(true)}
              disabled={accounts.length === 0}
              className="w-full py-3 rounded-xl btn-ai text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Активировать автопостинг
            </button>
          </>
        )}
      </div>
    </div>
  );
}
