export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const CREDENTIALS = process.env.HIGGSFIELD_API_KEY;
const BASE_URL = "https://platform.higgsfield.ai";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!CREDENTIALS) {
    return NextResponse.json({ error: "HIGGSFIELD_API_KEY not configured" }, { status: 500 });
  }

  const { id } = params;

  try {
    const res = await fetch(`${BASE_URL}/requests/${id}/status`, {
      headers: { "Authorization": `Key ${CREDENTIALS}` },
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch {
      return NextResponse.json({ error: `Non-JSON: ${text.slice(0, 200)}` }, { status: 500 });
    }

    if (!res.ok) {
      return NextResponse.json({ error: data?.message || data?.detail || `HTTP ${res.status}` }, { status: res.status });
    }

    const rawStatus: string = (data.status || "").toLowerCase();
    const isDone   = rawStatus === "completed" || rawStatus === "succeeded";
    const isFailed = rawStatus === "failed" || rawStatus === "error" || rawStatus === "nsfw";

    const videoUrl: string | null =
      data.result_url ||
      data.output_url ||
      data.video_url ||
      (data.video?.url) ||
      (Array.isArray(data.outputs) ? data.outputs[0]?.url : null) ||
      null;

    return NextResponse.json({
      status: isDone ? "completed" : isFailed ? "failed" : "processing",
      url: isDone ? videoUrl : null,
      progress: data.progress ?? null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Network error" }, { status: 500 });
  }
}
