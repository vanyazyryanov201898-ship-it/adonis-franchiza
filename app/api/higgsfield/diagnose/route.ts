export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const CREDENTIALS = process.env.HIGGSFIELD_API_KEY ?? "";
const BASE_URL = "https://platform.higgsfield.ai";

function getAuthHeaders() {
  return {
    "Authorization": `Key ${CREDENTIALS}`,
    "Content-Type": "application/json",
  };
}

export async function GET() {
  const results: Record<string, unknown> = {
    has_api_key: !!CREDENTIALS,
    api_key_prefix: CREDENTIALS ? CREDENTIALS.slice(0, 12) + "..." : "MISSING",
  };

  // 1. Test auth — list workspaces
  try {
    const r = await fetch(`${BASE_URL}/v1/workspaces`, { headers: getAuthHeaders() });
    const body = await r.text();
    results.workspaces_status = r.status;
    results.workspaces_body = body.slice(0, 500);
  } catch (e: any) {
    results.workspaces_error = e.message;
  }

  // 2. Try minimal generate call
  const testBody = {
    model: "kling3_0",
    workspace_id: "40e3dc18-a260-4432-87d5-ebc004e59b54",
    params: {
      prompt: "test video generation diagnostic",
      duration: 5,
      aspect_ratio: "9:16",
      input_images: [],
    },
  };

  try {
    const r = await fetch(`${BASE_URL}/v1/job-sets`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(testBody),
    });
    const body = await r.text();
    results.generate_status = r.status;
    results.generate_body = body.slice(0, 1000);
    results.generate_request = JSON.stringify(testBody);
  } catch (e: any) {
    results.generate_error = e.message;
  }

  return NextResponse.json(results, { status: 200 });
}
