export type TimeSlot = {
  time: string;       // "HH:MM"
  label: string;      // "Утренний пик"
  score: number;      // 1-5
  reason: string;
};

export const PLATFORM_BEST_TIMES: Record<string, TimeSlot[]> = {
  tiktok: [
    { time: "07:00", label: "Утро", score: 3, reason: "Просыпаются, листают ленту" },
    { time: "12:00", label: "Обед", score: 4, reason: "Пик активности в обед" },
    { time: "17:00", label: "После работы", score: 5, reason: "Лучшее время — конец рабочего дня" },
    { time: "20:00", label: "Вечер", score: 5, reason: "Максимальная аудитория вечером" },
    { time: "22:00", label: "Поздний вечер", score: 3, reason: "Активность спадает" },
  ],
  instagram: [
    { time: "08:00", label: "Раннее утро", score: 3, reason: "Проверяют перед работой" },
    { time: "12:00", label: "Обед", score: 4, reason: "Обеденный перерыв" },
    { time: "18:00", label: "Вечер", score: 5, reason: "Лучшее время для Reels" },
    { time: "21:00", label: "Ночь", score: 4, reason: "Расслабились, готовы к контенту" },
  ],
  youtube: [
    { time: "15:00", label: "День", score: 3, reason: "Подходит для Shorts" },
    { time: "17:00", label: "После работы", score: 4, reason: "Начинают смотреть видео" },
    { time: "19:00", label: "Вечер", score: 5, reason: "Прайм-тайм YouTube" },
    { time: "21:00", label: "Поздний вечер", score: 4, reason: "Долгие видео смотрят вечером" },
  ],
  telegram: [
    { time: "09:00", label: "Утро", score: 4, reason: "Читают по дороге на работу" },
    { time: "12:00", label: "Обед", score: 4, reason: "Обеденный трафик" },
    { time: "19:00", label: "Вечер", score: 5, reason: "Максимальный охват" },
    { time: "21:00", label: "Ночь", score: 3, reason: "Отложат до утра" },
  ],
  vk: [
    { time: "12:00", label: "Обед", score: 3, reason: "Активны в середине дня" },
    { time: "17:00", label: "Вечер", score: 4, reason: "После работы" },
    { time: "20:00", label: "Вечер", score: 5, reason: "Прайм-тайм ВКонтакте" },
  ],
  rutube: [
    { time: "19:00", label: "Вечер", score: 5, reason: "Основной трафик вечером" },
    { time: "21:00", label: "Ночь", score: 4, reason: "Смотрят длинный контент" },
  ],
  yappy: [
    { time: "17:00", label: "Вечер", score: 4, reason: "Молодая аудитория активна вечером" },
    { time: "20:00", label: "Вечер", score: 5, reason: "Пик просмотров" },
  ],
  dzen: [
    { time: "10:00", label: "Утро", score: 4, reason: "Читают статьи с утра" },
    { time: "13:00", label: "Обед", score: 3, reason: "Обеденный перерыв" },
    { time: "20:00", label: "Вечер", score: 5, reason: "Вечернее чтение" },
  ],
};

export const getBestTime = (platformId: string): string => {
  const slots = PLATFORM_BEST_TIMES[platformId];
  if (!slots) return "19:00";
  return slots.reduce((best, s) => (s.score > best.score ? s : best)).time;
};

export const getBestTimes = (platformId: string): TimeSlot[] => {
  return (PLATFORM_BEST_TIMES[platformId] ?? []).sort((a, b) => b.score - a.score);
};

// Mock analytics: given hour → estimated viral multiplier
export const HOUR_PERFORMANCE: Record<number, number> = {
  6: 0.4, 7: 0.6, 8: 0.8, 9: 1.0, 10: 0.9, 11: 0.9,
  12: 1.3, 13: 1.1, 14: 0.9, 15: 1.0, 16: 1.1, 17: 1.5,
  18: 1.6, 19: 1.8, 20: 2.0, 21: 1.7, 22: 1.2, 23: 0.7,
};

export function getHourPerformance(timeStr: string): number {
  const hour = parseInt(timeStr.split(":")[0], 10);
  return HOUR_PERFORMANCE[hour] ?? 1.0;
}

export function getTimeLabel(score: number): { label: string; color: string } {
  if (score >= 1.7) return { label: "Отличное время", color: "text-emerald-400" };
  if (score >= 1.2) return { label: "Хорошее время",  color: "text-cyan-400" };
  if (score >= 0.9) return { label: "Среднее время",  color: "text-slate-400" };
  return { label: "Слабое время", color: "text-orange-400" };
}
