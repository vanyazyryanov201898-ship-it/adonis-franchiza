export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { SPARTAN_CHARACTER_URL } from "@/lib/data/assets";

const CREDENTIALS = process.env.HIGGSFIELD_API_KEY ?? "";
const WORKSPACE_ID = "40e3dc18-a260-4432-87d5-ebc004e59b54";
const BASE_URL = "https://platform.higgsfield.ai";

function headers() {
  return { "Authorization": `Key ${CREDENTIALS}`, "Content-Type": "application/json" };
}

export async function GET() {
  const out: Record<string, unknown> = {
    api_key_prefix: CREDENTIALS ? CREDENTIALS.slice(0, 12) + "..." : "MISSING",
  };

  // 1. POST /v1/job-sets — real generate call with image
  const body = {
    model: "kling3_0",
    workspace_id: WORKSPACE_ID,
    params: {
      prompt: "diagnostic test spartan warrior animation",
      duration: 5,
      aspect_ratio: "9:16",
      input_images: [{ type: "image_url", image_url: SPARTAN_CHARACTER_URL }],
    },
  };

  let jobId: string | null = null;
  try {
    const r = await fetch(`${BASE_URL}/v1/job-sets`, {
      method: "POST", headers: headers(), body: JSON.stringify(body),
    });
    const text = await r.text();
    out.generate_status = r.status;
    out.generate_raw = text.slice(0, 800);

    if (r.ok) {
      const data = JSON.parse(text);
      jobId = data.id ?? data.job_set_id ?? data.request_id ?? null;
      out.job_id = jobId;
      out.generate_keys = Object.keys(data);
    }
  } catch (e: any) {
    out.generate_error = e.message;
  }

  // 2. If job was created, check its status immediately
  if (jobId) {
    try {
      await new Promise(r => setTimeout(r, 2000)); // wait 2 sec
      const r = await fetch(`${BASE_URL}/v1/job-sets/${jobId}`, { headers: headers() });
      const text = await r.text();
      out.status_check_status = r.status;
      out.status_check_raw = text.slice(0, 800);
    } catch (e: any) {
      out.status_check_error = e.message;
    }
  }

  return NextResponse.json(out, { status: 200 });
}
