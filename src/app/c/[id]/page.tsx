import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Terminal } from "lucide-react";

import { loadCommands } from "@/lib/commands";
import { DetailPanel } from "@/components/commands/detail-panel";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const command = loadCommands().find((c) => c.id === id);
  if (!command) return { title: "Command not found — DevOps Ref" };
  return {
    title: `${command.title} (${command.id}) — DevOps Ref`,
    description: command.description,
  };
}

export default async function CommandPage({ params }: Props) {
  const { id } = await params;
  const command = loadCommands().find((c) => c.id === id) ?? null;
  if (!command) notFound();

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800 bg-[#0a0a0c] px-4 py-3 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <Terminal className="h-4 w-4 text-emerald-500" />
          <span className="font-mono text-sm font-bold text-zinc-100">DevOps Ref</span>
        </Link>
      </header>
      <div className="flex-1 overflow-auto">
        <DetailPanel command={command} />
      </div>
    </div>
  );
}
