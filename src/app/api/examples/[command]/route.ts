import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/cache";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ command: string }> }
) {
  const { command } = await params;
  const cacheKey = `cheatsh:${command}`;

  const cached = getCached<string>(cacheKey);
  if (cached) {
    return NextResponse.json([{ source: "cheat.sh", content: cached }]);
  }

  try {
    const res = await fetch(
      `https://cheat.sh/${encodeURIComponent(command)}?T&Q`,
      { headers: { "User-Agent": "curl/7.68.0", "Accept": "text/plain" } }
    );

    if (!res.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const text = await res.text();
    setCache(cacheKey, text);
    return NextResponse.json([{ source: "cheat.sh", content: text }]);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
