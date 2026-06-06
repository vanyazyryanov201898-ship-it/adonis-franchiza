export const dynamic = "force-dynamic";
export const maxDuration = 25;

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/db/supabase";

export async function GET(req: NextRequest) {
  const db = createServerClient();
  if (!db) return NextResponse.json({ content: [], warning: "Supabase не настроен" });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "20");
  const type = searchParams.get("type");

  let query = db
    .from("generated_content")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ content: data });
}

export async function DELETE(req: NextRequest) {
  const db = createServerClient();
  if (!db) return NextResponse.json({ error: "Supabase не настроен" }, { status: 503 });

  const { id } = await req.json();
  const { error } = await db.from("generated_content").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
