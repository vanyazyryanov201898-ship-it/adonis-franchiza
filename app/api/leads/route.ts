export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/db/supabase";

export async function GET() {
  const db = createServerClient();
  if (!db) return NextResponse.json({ leads: [], warning: "Supabase не настроен" });

  const { data, error } = await db
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data });
}

export async function POST(req: NextRequest) {
  const db = createServerClient();
  if (!db) return NextResponse.json({ error: "Supabase не настроен" }, { status: 503 });

  const body = await req.json();
  const { data, error } = await db.from("leads").insert(body).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lead: data });
}

export async function PATCH(req: NextRequest) {
  const db = createServerClient();
  if (!db) return NextResponse.json({ error: "Supabase не настроен" }, { status: 503 });

  const { id, status, notes } = await req.json();
  const { data, error } = await db
    .from("leads")
    .update({ status, notes })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lead: data });
}
