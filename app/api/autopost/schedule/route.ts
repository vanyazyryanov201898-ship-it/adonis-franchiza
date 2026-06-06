export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/db/supabase";

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase не настроен" }, { status: 500 });
  }

  const body = await req.json() as {
    content: string;
    topic?: string;
    platform?: string;
    direction_id?: string;
    scheduled_at: string;   // ISO 8601
    viral_score?: number;
  };

  if (!body.content || !body.scheduled_at) {
    return NextResponse.json({ error: "content и scheduled_at обязательны" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("scheduled_posts")
    .insert({
      content:      body.content,
      title:        body.topic?.slice(0, 200) ?? "Пост",
      platform:     body.platform ?? "telegram",
      direction_id: body.direction_id ?? "posts",
      scheduled_at: body.scheduled_at,
      status:       "scheduled",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
