export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/db/supabase";

export async function GET() {
  const db = createServerClient();
  if (!db) return NextResponse.json({ videos: [], warning: "Supabase не настроен" });

  const { data, error } = await db
    .from("video_queue")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ videos: data });
}

export async function POST(req: NextRequest) {
  const db = createServerClient();
  if (!db) return NextResponse.json({ error: "Supabase не настроен" }, { status: 503 });

  const body = await req.json();
  const { data, error } = await db
    .from("video_queue")
    .insert({ ...body, status: "queued", progress: 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ video: data });
}

export async function PATCH(req: NextRequest) {
  const db = createServerClient();
  if (!db) return NextResponse.json({ error: "Supabase не настроен" }, { status: 503 });

  const { id, ...updates } = await req.json();
  const { data, error } = await db
    .from("video_queue")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ video: data });
}
