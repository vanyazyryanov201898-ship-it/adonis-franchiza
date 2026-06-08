export const dynamic = "force-dynamic";
export const maxDuration = 30;

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: 502 });
    }

    const headers = new Headers();
    headers.set("Content-Type", upstream.headers.get("Content-Type") || "video/mp4");
    headers.set("Content-Disposition", 'attachment; filename="adonis-video.mp4"');
    const cl = upstream.headers.get("Content-Length");
    if (cl) headers.set("Content-Length", cl);

    return new NextResponse(upstream.body, { headers });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
