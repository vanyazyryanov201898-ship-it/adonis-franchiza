export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getGoogleAccessToken } from "@/lib/google-client";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const LOCATION = "us-central1";
const VEO_MODEL = "veo-002";

export async function POST(req: NextRequest) {
  if (!PROJECT_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return NextResponse.json({ error: "Google Cloud не настроен (GOOGLE_CLOUD_PROJECT / GOOGLE_SERVICE_ACCOUNT_JSON)" }, { status: 500 });
  }

  const { prompt, aspect_ratio = "9:16", duration = 8 } = await req.json() as {
    prompt: string;
    model?: string;
    aspect_ratio?: string;
    duration?: number;
    image_url?: string;
  };

  if (!prompt) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  try {
    const token = await getGoogleAccessToken();

    const res = await fetch(
      `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${VEO_MODEL}:predictLongRunning`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            aspectRatio: aspect_ratio,
            sampleCount: 1,
            durationSeconds: Math.min(duration || 8, 30),
          },
        }),
      }
    );

    const text = await res.text();
    let json: any;
    try { json = JSON.parse(text); } catch {
      return NextResponse.json({ error: `Non-JSON (${res.status}): ${text.slice(0, 300)}` }, { status: 500 });
    }

    if (!res.ok) {
      const msg = json?.error?.message || json?.message || JSON.stringify(json).slice(0, 300);
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    // name: "projects/.../locations/.../operations/OPERATION_ID"
    const operationId = (json.name as string)?.split("/").pop();
    if (!operationId) {
      return NextResponse.json(
        { error: `Veo не вернул operation ID: ${JSON.stringify(json).slice(0, 200)}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ id: operationId, status: "queued" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Network error" }, { status: 500 });
  }
}
