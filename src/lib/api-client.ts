import { Command, ApiFlag, ExplainResult } from "./types";

const BASE = "";

export async function fetchCommands(params?: {
  category?: string;
  search?: string;
  difficulty?: string;
  tag?: string;
  os?: string;
}): Promise<Command[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.difficulty) searchParams.set("difficulty", params.difficulty);
  if (params?.tag) searchParams.set("tag", params.tag);
  if (params?.os) searchParams.set("os", params.os);

  const qs = searchParams.toString();
  const res = await fetch(`${BASE}/api/commands${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch commands");
  return res.json();
}

export async function fetchFlags(command: string): Promise<ApiFlag[]> {
  const res = await fetch(`${BASE}/api/flags/${encodeURIComponent(command)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchExplain(
  query: string
): Promise<{ command: string; explanation: string | null; error?: string }> {
  const res = await fetch(
    `${BASE}/api/explain?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error("Failed to explain command");
  return res.json();
}

export async function fetchExamples(
  command: string
): Promise<{ source: string; content: string }[]> {
  const res = await fetch(
    `${BASE}/api/examples/${encodeURIComponent(command)}`
  );
  if (!res.ok) return [];
  return res.json();
}

export async function fetchTldr(command: string): Promise<string | null> {
  const res = await fetch(`${BASE}/api/tldr/${encodeURIComponent(command)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.content;
}
