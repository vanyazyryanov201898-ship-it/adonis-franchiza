export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getGoogleAccessToken } from "@/lib/google-client";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const LOCATION = "us-central1";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const token = await getGoogleAccessToken();

    const res = await fetch(
      `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/operations/${id}`,
      {
        headers: { "Authorization": `Bearer ${token}` },
      }
    );

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch {
      return NextResponse.json({ error: `Non-JSON: ${text.slice(0, 200)}` }, { status: 500 });
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.message || `HTTP ${res.status}` },
        { status: res.status }
      );
    }

    if (!data.done) {
      return NextResponse.json({
        status: "processing",
        progress: data.metadata?.progressPercentage ?? null,
        raw: data,
      });
    }

    if (data.error) {
      return NextResponse.json({ status: "failed", error: data.error.message });
    }

    const predictions: any[] = data.response?.predictions ?? [];
    const prediction = predictions[0] ?? {};

    let videoUrl: string | null = null;
    if (prediction.videoUri) {
      videoUrl = prediction.videoUri;
    } else if (prediction.bytesBase64Encoded) {
      videoUrl = `data:video/mp4;base64,${prediction.bytesBase64Encoded}`;
    }

    return NextResponse.json({
      status: "completed",
      url: videoUrl,
      progress: null,
      raw: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Network error" }, { status: 500 });
  }
}
