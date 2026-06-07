export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/db/supabase";

const CREDENTIALS = process.env.HIGGSFIELD_API_KEY ?? "";
const BASE_URL    = "https://platform.higgsfield.ai";

export async function GET() {
  const sb = createServerClient();
  if (!sb || !CREDENTIALS) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const { data: stale, error: dbErr } = await sb
    .from("video_generations")
    .select("id, higgs_id")
    .in("status", ["processing", "queued"])
    .not("higgs_id", "is", null);

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  if (!stale?.length) return NextResponse.json({ updated: 0, checked: 0 });

  const updated: Array<{ id: string; higgs_id: string; newStatus: string; videoUrl?: string | null }> = [];

  for (const row of stale) {
    try {
      const res = await fetch(`${BASE_URL}/v1/job-sets/${row.higgs_id}`, {
        headers: { "Authorization": `Key ${CREDENTIALS}` },
      });
      if (!res.ok) continue;

      const data = await res.json();
      const jobs: any[]  = Array.isArray(data.jobs) ? data.jobs : [];
      const firstJob     = jobs.length > 0 ? jobs[0] : data;
      const rawStatus    = ((firstJob.status || data.status) ?? "").toLowerCase();

      const isDone   = ["completed", "succeeded", "done"].includes(rawStatus);
      const isFailed = ["failed", "error", "nsfw", "canceled", "cancelled"].includes(rawStatus);

      if (isDone) {
        const videoUrl: string | null =
          firstJob.results?.rawUrl ||
          firstJob.results?.url ||
          data.result_url ||
          null;
        await sb.from("video_generations").update({
          status: "completed",
          video_url: videoUrl,
          completed_at: new Date().toISOString(),
        }).eq("id", row.id);
        updated.push({ id: row.id, higgs_id: row.higgs_id, newStatus: "completed", videoUrl });
      } else if (isFailed) {
        await sb.from("video_generations").update({ status: "failed" }).eq("id", row.id);
        updated.push({ id: row.id, higgs_id: row.higgs_id, newStatus: "failed" });
      }
    } catch { /* skip on network error */ }
  }

  return NextResponse.json({ updated: updated.length, checked: stale.length, results: updated });
}
