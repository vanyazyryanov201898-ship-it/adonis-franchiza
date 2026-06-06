export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const CREDENTIALS = process.env.HIGGSFIELD_API_KEY ?? "";
const BASE_URL = "https://platform.higgsfield.ai";

function getAuthHeaders() {
  const [apiKey, apiSecret] = CREDENTIALS.split(":");
  return {
    "hf-api-key": apiKey ?? "",
    "hf-secret": apiSecret ?? "",
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!CREDENTIALS) {
    return NextResponse.json({ error: "HIGGSFIELD_API_KEY not configured" }, { status: 500 });
  }

  const { id } = params;

  try {
    // Try v1 job-sets first (matches generate v1 endpoint)
    const res = await fetch(`${BASE_URL}/v1/job-sets/${id}`, {
      headers: getAuthHeaders(),
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch {
      return NextResponse.json({ error: `Non-JSON: ${text.slice(0, 200)}` }, { status: 500 });
    }

    if (!res.ok) {
      return NextResponse.json({ error: data?.message || data?.detail || `HTTP ${res.status}` }, { status: res.status });
    }

    // v1 job-set format: { id, jobs: [{status, result_url, ...}] }
    const jobs: any[] = data.jobs ?? [];
    const firstJob = jobs[0] ?? data;
    const rawStatus: string = ((firstJob.status || data.status) ?? "").toLowerCase();

    const isDone   = rawStatus === "completed" || rawStatus === "succeeded";
    const isFailed = rawStatus === "failed" || rawStatus === "error" || rawStatus === "nsfw" || rawStatus === "canceled";

    const videoUrl: string | null =
      firstJob.result_url || firstJob.output_url || firstJob.video_url ||
      data.result_url || data.output_url ||
      (Array.isArray(data.outputs) ? data.outputs[0]?.url : null) ||
      null;

    return NextResponse.json({
      status: isDone ? "completed" : isFailed ? "failed" : "processing",
      url: isDone ? videoUrl : null,
      progress: firstJob.progress ?? data.progress ?? null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Network error" }, { status: 500 });
  }
}
