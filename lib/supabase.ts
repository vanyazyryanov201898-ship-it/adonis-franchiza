import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  supabaseUrl.startsWith("http") && supabaseAnonKey.length > 10;

// Клиент для фронта (браузер) — ленивый, только если настроен
let _supabase: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!_supabase) _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}
// Для обратной совместимости
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Серверный клиент (для API-роутов) с сервисным ключом
export function createServerClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl.startsWith("http") || serviceKey.length < 10) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

// ─── Типы таблиц ─────────────────────────────────────────────

export type GeneratedContent = {
  id: string;
  type: "scenario" | "hook" | "cta" | "title" | "description" | "ideas";
  topic: string;
  platform: string;
  tone: string;
  content: string;
  viral_score: number;
  created_at: string;
};

export type Lead = {
  id: string;
  name: string | null;
  phone: string | null;
  platform: string;
  source_video: string | null;
  status: "new" | "contacted" | "qualified" | "closed";
  notes: string | null;
  created_at: string;
};

export type VideoQueueItem = {
  id: string;
  title: string;
  status: "queued" | "rendering" | "completed" | "failed";
  progress: number;
  platforms: string[];
  viral_score: number;
  duration: string | null;
  content_id: string | null;
  created_at: string;
};

export type ScheduledPost = {
  id: string;
  title: string;
  platform: string;
  scheduled_at: string;
  status: "scheduled" | "processing" | "published" | "draft";
  video_id: string | null;
  created_at: string;
};
