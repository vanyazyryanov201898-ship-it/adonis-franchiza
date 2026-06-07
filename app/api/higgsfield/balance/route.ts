export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const CREDENTIALS = process.env.HIGGSFIELD_API_KEY ?? "";
const BASE_URL = "https://platform.higgsfield.ai";

export async function GET() {
  if (!CREDENTIALS) {
    return NextResponse.json({ credits: null, error: "HIGGSFIELD_API_KEY not configured" });
  }

  try {
    const workspaceId = CREDENTIALS.split(":")[0];
    const res = await fetch(`${BASE_URL}/v1/job-sets`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${CREDENTIALS}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "kling3_0",
        workspace_id: workspaceId,
        params: { prompt: "balance_check", input_images: [], duration: 1, aspect_ratio: "1:1" },
        dry_run: true,
      }),
    });

    // If auth works (even if endpoint errors), we know key is valid
    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ credits: null, error: "Invalid API key" });
    }

    return NextResponse.json({ credits: "OK" });
  } catch (err: any) {
    return NextResponse.json({ credits: null, error: err.message });
  }
}
