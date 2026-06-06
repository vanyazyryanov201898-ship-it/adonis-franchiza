export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  const configured = !!(process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  return NextResponse.json({
    credits: configured ? "Google Cloud ($300)" : null,
    error: configured ? null : "not configured",
  });
}
