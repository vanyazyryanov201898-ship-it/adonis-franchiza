import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL    ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  supabaseUrl.startsWith("http") && supabaseAnonKey.length > 10;

// ─── Браузерный клиент (фронт, Client Components) ────────────
export function getSupabase() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Для обратной совместимости
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ─── Серверный клиент с сервисным ключом (API Routes) ─────────
export function createServerClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl.startsWith("http") || serviceKey.length < 10) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

// ─── Типы таблиц ─────────────────────────────────────────────

export type Profile = {
  id: string;
  full_name: string | null;
  company: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
};

export type GeneratedContent = {
  id: string;
  user_id: string;
  type: string;
  topic: string;
  platform: string;
  tone: string;
  content: string;
  viral_score: number;
  carousel_data: object | null;
  created_at: string;
};

export type Lead = {
  id: string;
  user_id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  platform: string;
  source_video: string | null;
  status: "new" | "contacted" | "qualified" | "closed";
  notes: string | null;
  created_at: string;
};

export type VideoQueueItem = {
  id: string;
  user_id: string;
  title: string;
  status: "queued" | "rendering" | "completed" | "failed";
  progress: number;
  platforms: string[];
  viral_score: number;
  duration: string | null;
  content_id: string | null;
  created_at: string;
};

export type VideoGeneration = {
  id: string;
  direction: string;
  topic: string | null;
  prompt: string;
  model: string;
  duration_sec: number;
  higgs_id: string | null;
  status: "queued" | "processing" | "completed" | "failed";
  video_url: string | null;
  credits_used: number | null;
  created_at: string;
  completed_at: string | null;
};

export type ScheduledPost = {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  platform: string;
  direction_id: string | null;
  scheduled_at: string;
  status: "scheduled" | "processing" | "published" | "failed" | "draft";
  video_id: string | null;
  created_at: string;
};
