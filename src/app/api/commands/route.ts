import { NextRequest, NextResponse } from "next/server";
import { loadCommands, filterCommands } from "@/lib/commands";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;
  const difficulty = searchParams.get("difficulty") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const os = searchParams.get("os") || undefined;

  const allCommands = loadCommands();
  const filtered = filterCommands(allCommands, {
    category,
    search,
    difficulty,
    tag,
    os,
  });

  return NextResponse.json(filtered);
}
