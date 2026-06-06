export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const CREDENTIALS = process.env.HIGGSFIELD_API_KEY;
const BASE_URL = "https://platform.higgsfield.ai";

export async function GET() {
  if (!CREDENTIALS) {
    return NextResponse.json({ credits: null, error: "HIGGSFIELD_API_KEY not configured" });
  }

  try {
    const res = await fetch(`${BASE_URL}/credits`, {
      headers: { "Authorization": `Key ${CREDENTIALS}` },
    });

    if (!res.ok) {
      return NextResponse.json({ credits: null, error: `HTTP ${res.status}` });
    }

    const data = await res.json();
    return NextResponse.json({ credits: data.credits ?? data.balance ?? null });
  } catch (err: any) {
    return NextResponse.json({ credits: null, error: err.message });
  }
}
