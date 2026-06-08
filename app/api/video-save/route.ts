export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/db/supabase";

// POST — insert new video_generation record, return { id }
export async function POST(req: NextRequest) {
  const sb = createServerClient();
  if (!sb) return NextResponse.json({ id: null });

  const body = await req.json();
  const { data, error } = await sb
    .from("video_generations")
    .insert(body)
    .select("id")
    .single();

  if (error) {
    console.error("video-save POST error:", error.message);
    return NextResponse.json({ id: null, error: error.message });
  }
  return NextResponse.json({ id: data?.id ?? null });
}

// PATCH — update existing record by id
export async function PATCH(req: NextRequest) {
  const sb = createServerClient();
  if (!sb) return NextResponse.json({ ok: false });

  const { id, updates } = await req.json() as { id: string; updates: Record<string, unknown> };
  if (!id) return NextResponse.json({ ok: false, error: "id required" });

  const { error } = await sb
    .from("video_generations")
    .update(updates)
    .eq("id", id);

  if (error) console.error("video-save PATCH error:", error.message);
  return NextResponse.json({ ok: !error });
}
