export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/db/supabase";

export async function GET() {
  const sb = createServerClient();
  if (!sb) {
    return NextResponse.json({ error: "Supabase not configured", videos: [] });
  }

  const { data, error } = await sb
    .from("video_generations")
    .select("id,direction,topic,prompt,model,duration_sec,status,video_url,created_at,completed_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message, videos: [] });
  return NextResponse.json({ videos: data ?? [] });
}
