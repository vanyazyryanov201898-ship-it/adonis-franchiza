export type Platform = {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
};

export const PLATFORMS: Platform[] = [
  { id: "tiktok",    label: "TikTok",      shortLabel: "TT",  color: "#fe2c55", bgColor: "rgba(254,44,85,0.15)" },
  { id: "instagram", label: "Instagram",   shortLabel: "In",  color: "#e91e8c", bgColor: "rgba(233,30,140,0.15)" },
  { id: "youtube",   label: "YouTube",     shortLabel: "Yt",  color: "#ff4444", bgColor: "rgba(255,68,68,0.15)" },
  { id: "vk",        label: "VK Клипы",    shortLabel: "VK",  color: "#0077ff", bgColor: "rgba(0,119,255,0.15)" },
  { id: "telegram",  label: "Telegram",    shortLabel: "Tg",  color: "#26a5e4", bgColor: "rgba(38,165,228,0.15)" },
  { id: "rutube",    label: "Rutube",      shortLabel: "Rt",  color: "#003087", bgColor: "rgba(0,48,135,0.20)" },
  { id: "yappy",     label: "Yappy",       shortLabel: "Yp",  color: "#ff6600", bgColor: "rgba(255,102,0,0.15)" },
  { id: "dzen",      label: "Дзен",        shortLabel: "Дз",  color: "#ff6633", bgColor: "rgba(255,102,51,0.15)" },
];

export const getPlatform = (id: string) => PLATFORMS.find((p) => p.id === id);

export const DIRECTION_DEFAULT_PLATFORMS: Record<string, string[]> = {
  "heygen-live":  ["youtube", "tiktok", "instagram"],
  "heygen-ai":    ["youtube", "vk", "tiktok"],
  "infographics": ["youtube", "instagram", "dzen"],
  "cartoon":      ["tiktok", "instagram", "telegram"],
  "clips":        ["tiktok", "instagram", "youtube"],
  "posts":        ["instagram", "telegram", "tiktok", "vk"],
  "carousels":    ["instagram", "tiktok"],
};
