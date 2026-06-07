export const dynamic = "force-dynamic";
export const maxDuration = 900; // 15 min — Railway supports long-running requests

import { NextRequest } from "next/server";

const CREDENTIALS = process.env.HIGGSFIELD_API_KEY ?? "";
const BASE_URL     = "https://platform.higgsfield.ai";

function hfHeaders() {
  return { "Authorization": `Key ${CREDENTIALS}` };
}

function sseEvent(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const stream = new ReadableStream({
    async start(controller) {
      const MAX_MS   = 15 * 60 * 1000; // 15 min hard cap
      const INTERVAL = 2_000;           // poll every 2 seconds
      const startedAt = Date.now();
      let consecutiveErrors = 0;

      while (Date.now() - startedAt < MAX_MS) {
        try {
          const res  = await fetch(`${BASE_URL}/v1/job-sets/${id}`, { headers: hfHeaders() });
          const data = await res.json();

          if (!res.ok) {
            consecutiveErrors++;
            if (consecutiveErrors >= 5) {
              controller.enqueue(sseEvent({ status: "failed", error: `HTTP ${res.status}` }));
              break;
            }
            await new Promise(r => setTimeout(r, INTERVAL));
            continue;
          }

          consecutiveErrors = 0;
          const jobs: any[] = Array.isArray(data.jobs) ? data.jobs : [];
          const firstJob    = jobs.length > 0 ? jobs[0] : data;
          const rawStatus   = ((firstJob.status || data.status) ?? "").toLowerCase();

          if (["completed", "succeeded", "done"].includes(rawStatus)) {
            const url: string | null =
              firstJob.results?.rawUrl ||
              firstJob.results?.url    ||
              data.result_url          ||
              null;
            controller.enqueue(sseEvent({ status: "completed", url }));
            break;
          }

          if (["failed", "error", "nsfw", "canceled", "cancelled"].includes(rawStatus)) {
            controller.enqueue(sseEvent({ status: "failed", rawStatus }));
            break;
          }

          // Still processing — send a heartbeat so the browser knows we're alive
          controller.enqueue(sseEvent({ status: "processing" }));
        } catch {
          consecutiveErrors++;
          if (consecutiveErrors >= 5) {
            controller.enqueue(sseEvent({ status: "failed", error: "network" }));
            break;
          }
        }

        await new Promise(r => setTimeout(r, INTERVAL));
      }

      // Timeout
      if (Date.now() - startedAt >= MAX_MS) {
        controller.enqueue(sseEvent({ status: "failed", error: "timeout" }));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache, no-store",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no", // disable Nginx buffering on Railway
    },
  });
}
