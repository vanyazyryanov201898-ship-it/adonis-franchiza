import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function formatCurrency(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M ₽`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K ₽`;
  return `${num} ₽`;
}

export function getRandomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateFakeMetric(base: number, variance: number = 0.1): number {
  const change = base * variance * (Math.random() > 0.5 ? 1 : -1);
  return Math.round(base + change);
}
