import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/cache";

interface ManKierResponse {
  anchors?: Array<{
    anchor: string;
    description: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ command: string }> }
) {
  const { command } = await params;
  const cacheKey = `mankier:flags:${command}`;

  const cached = getCached<Array<{ flag: string; description: string }>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const res = await fetch(
      `https://www.mankier.com/api/v2/mans/${encodeURIComponent(command)}.1`,
      { headers: { Accept: "application/json" } }
    );

    if (!res.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const data: ManKierResponse = await res.json();
    const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").trim();
    const flags = (data.anchors || [])
      .map((a) => ({ flag: stripHtml(a.anchor), description: stripHtml(a.description) }))
      .filter((a) => a.flag.startsWith("-"));

    setCache(cacheKey, flags);
    return NextResponse.json(flags);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
