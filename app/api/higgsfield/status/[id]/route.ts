export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const CREDENTIALS = process.env.HIGGSFIELD_API_KEY ?? "";
const BASE_URL = "https://platform.higgsfield.ai";

function getAuthHeaders() {
  return {
    "Authorization": `Key ${CREDENTIALS}`,
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
      return NextResponse.json({
        status: "error",
        error: data?.message || data?.detail || `HTTP ${res.status}`,
        _debug_http: res.status,
      }, { status: res.status });
    }

    // Higgsfield returns a flat job-set object: { id, status, result_url, ... }
    // Some endpoints may wrap in { jobs: [{...}] }
    const jobs: any[] = Array.isArray(data.jobs) ? data.jobs : [];
    const firstJob = jobs.length > 0 ? jobs[0] : data;
    const rawStatus: string = ((firstJob.status || data.status) ?? "").toLowerCase();

    const isDone   = rawStatus === "completed" || rawStatus === "succeeded" || rawStatus === "done";
    const isFailed = rawStatus === "failed" || rawStatus === "error" || rawStatus === "nsfw" || rawStatus === "canceled";

    // Try every known URL field — Higgsfield uses result_url on flat responses
    const videoUrl: string | null =
      data.result_url ||
      firstJob.result_url ||
      firstJob.results?.rawUrl ||
      firstJob.results?.raw?.url ||
      firstJob.results?.url ||
      firstJob.output_url || firstJob.video_url ||
      data.output_url ||
      (Array.isArray(data.outputs) ? data.outputs[0]?.url : null) ||
      null;

    return NextResponse.json({
      status: isDone ? "completed" : isFailed ? "failed" : "processing",
      url: isDone ? videoUrl : null,
      progress: firstJob.progress ?? data.progress ?? null,
      _debug: { rawStatus, isDone, hasUrl: !!videoUrl, jobsCount: jobs.length, topKeys: Object.keys(data) },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Network error" }, { status: 500 });
  }
}
