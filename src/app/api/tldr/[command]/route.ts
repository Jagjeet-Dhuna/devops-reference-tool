import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/cache";

const TLDR_BASE = "https://raw.githubusercontent.com/tldr-pages/tldr/main/pages";

async function fetchTldr(command: string): Promise<string | null> {
  const dirs = ["common", "linux", "osx", "windows"];

  for (const dir of dirs) {
    try {
      const res = await fetch(`${TLDR_BASE}/${dir}/${encodeURIComponent(command)}.md`);
      if (res.ok) {
        return await res.text();
      }
    } catch {
      continue;
    }
  }

  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ command: string }> }
) {
  const { command } = await params;
  const cacheKey = `tldr:${command}`;

  const cached = getCached<string>(cacheKey);
  if (cached) {
    return NextResponse.json({ content: cached });
  }

  const content = await fetchTldr(command);

  if (!content) {
    return NextResponse.json({ content: null }, { status: 200 });
  }

  setCache(cacheKey, content);
  return NextResponse.json({ content });
}
