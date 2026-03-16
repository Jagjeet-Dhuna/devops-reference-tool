import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Missing query parameter 'q'" },
      { status: 400 }
    );
  }

  const cacheKey = `mankier:explain:${query}`;
  const cached = getCached<string>(cacheKey);
  if (cached) {
    return NextResponse.json({ command: query, explanation: cached });
  }

  try {
    const res = await fetch(
      `https://www.mankier.com/api/v2/explain/?q=${encodeURIComponent(query)}&cols=80`,
      { headers: { Accept: "text/plain" } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { command: query, explanation: null, error: "Could not explain this command" },
        { status: 200 }
      );
    }

    const text = await res.text();
    setCache(cacheKey, text);
    return NextResponse.json({ command: query, explanation: text });
  } catch {
    return NextResponse.json(
      { command: query, explanation: null, error: "Failed to reach explanation service" },
      { status: 200 }
    );
  }
}
