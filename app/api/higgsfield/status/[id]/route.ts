export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.HIGGSFIELD_API_KEY;
const BASE_URL = "https://api.higgsfield.ai";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!API_KEY) {
    return NextResponse.json({ error: "HIGGSFIELD_API_KEY not configured" }, { status: 500 });
  }

  const { id } = params;

  try {
    const res = await fetch(`${BASE_URL}/v2/requests/status/${id}`, {
      headers: { "Authorization": `Bearer ${API_KEY}` },
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch {
      return NextResponse.json({ error: `Non-JSON: ${text.slice(0, 200)}` }, { status: 500 });
    }

    if (!res.ok) {
      return NextResponse.json({ error: data?.message || `HTTP ${res.status}` }, { status: res.status });
    }

    // Normalize response: status can be "completed"/"succeeded"/"done"
    const status: string = (data.status || "").toLowerCase();
    const isDone = status === "completed" || status === "succeeded" || status === "done";
    const isFailed = status === "failed" || status === "error";

    const videoUrl: string | null =
      data.output_url || data.video_url || data.url ||
      (Array.isArray(data.outputs) ? data.outputs[0]?.url : null) ||
      null;

    return NextResponse.json({
      status: isDone ? "completed" : isFailed ? "failed" : "processing",
      url: isDone ? videoUrl : null,
      progress: data.progress ?? null,
      raw: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Network error" }, { status: 500 });
  }
}
