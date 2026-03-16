"use client";

import { useState, useEffect } from "react";
import { fetchExamples, fetchTldr } from "@/lib/api-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface ExamplesSectionProps {
  commandId: string;
  localExample: string;
}

// Render cheat.sh plain-text format:
// # comment lines are descriptions, other lines are commands
function CheatshView({ content }: { content: string }) {
  const lines = content
    .replace(/^#\[cheat:[^\]\n]+\]\n?/m, "") // strip #[cheat:ls] header
    .split("\n");

  const blocks: { description: string; commands: string[] }[] = [];
  let current: { description: string; commands: string[] } | null = null;

  for (const line of lines) {
    if (line.startsWith("#")) {
      const text = line.replace(/^#+\s?/, "").trim();
      if (!text) continue;
      current = { description: text, commands: [] };
      blocks.push(current);
    } else if (line.trim()) {
      if (!current) {
        current = { description: "", commands: [] };
        blocks.push(current);
      }
      current.commands.push(line.trim());
    } else {
      current = null;
    }
  }

  if (!blocks.length) return <p className="text-zinc-500 text-xs font-mono">No examples found.</p>;

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <div key={i}>
          {block.description && (
            <p className="text-zinc-400 text-xs mb-1">{block.description}</p>
          )}
          {block.commands.map((cmd, j) => (
            <code key={j} className="block text-emerald-400 text-xs font-mono bg-[#0a0a0c] px-3 py-1.5 rounded border border-zinc-800 mb-0.5">
              $ {cmd}
            </code>
          ))}
        </div>
      ))}
    </div>
  );
}

// Render tldr markdown format:
// - description: followed by `command` lines
function TldrView({ content }: { content: string }) {
  const lines = content.split("\n");
  const items: { description: string; command: string }[] = [];
  let pendingDesc = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ") || trimmed.startsWith("> ")) continue; // skip title/url lines
    if (trimmed.startsWith("- ")) {
      pendingDesc = trimmed.slice(2).replace(/:$/, "").trim();
    } else if (trimmed.startsWith("`") && trimmed.endsWith("`")) {
      items.push({ description: pendingDesc, command: trimmed.slice(1, -1) });
      pendingDesc = "";
    }
  }

  if (!items.length) return <p className="text-zinc-500 text-xs font-mono">No tldr page found.</p>;

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i}>
          {item.description && (
            <p className="text-zinc-400 text-xs mb-1">{item.description}</p>
          )}
          <code className="block text-emerald-400 text-xs font-mono bg-[#0a0a0c] px-3 py-1.5 rounded border border-zinc-800">
            $ {item.command}
          </code>
        </div>
      ))}
    </div>
  );
}

// Render curated examples: plain text lines, each line is a command
function CuratedView({ content }: { content: string }) {
  const lines = content.split("\n").filter((l) => l.trim());
  if (!lines.length) return <p className="text-zinc-500 text-xs font-mono">No example provided.</p>;
  return (
    <div className="space-y-1">
      {lines.map((line, i) => (
        <code key={i} className="block text-emerald-400 text-xs font-mono bg-[#0a0a0c] px-3 py-1.5 rounded border border-zinc-800">
          $ {line.trim()}
        </code>
      ))}
    </div>
  );
}

export function ExamplesSection({ commandId, localExample }: ExamplesSectionProps) {
  const [cheatshContent, setCheatshContent] = useState<string | null>(null);
  const [tldrContent, setTldrContent] = useState<string | null>(null);
  const [loadingCheatsh, setLoadingCheatsh] = useState(false);
  const [loadingTldr, setLoadingTldr] = useState(false);
  const [activeTab, setActiveTab] = useState("curated");

  useEffect(() => {
    setCheatshContent(null);
    setTldrContent(null);
    setActiveTab("curated");
  }, [commandId]);

  const loadCheatsh = async () => {
    if (cheatshContent !== null) return;
    setLoadingCheatsh(true);
    try {
      const examples = await fetchExamples(commandId);
      setCheatshContent(examples[0]?.content || "");
    } catch {
      setCheatshContent("");
    } finally {
      setLoadingCheatsh(false);
    }
  };

  const loadTldr = async () => {
    if (tldrContent !== null) return;
    setLoadingTldr(true);
    try {
      const content = await fetchTldr(commandId);
      setTldrContent(content || "");
    } catch {
      setTldrContent("");
    } finally {
      setLoadingTldr(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "cheatsh") loadCheatsh();
    if (tab === "tldr") loadTldr();
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3 pt-1">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3 w-48 bg-zinc-800" />
          <Skeleton className="h-7 w-full bg-zinc-800/60 rounded" />
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="curated" className="font-mono text-xs data-[state=active]:bg-zinc-800">
            Curated
          </TabsTrigger>
          <TabsTrigger value="cheatsh" className="font-mono text-xs data-[state=active]:bg-zinc-800">
            cheat.sh
          </TabsTrigger>
          <TabsTrigger value="tldr" className="font-mono text-xs data-[state=active]:bg-zinc-800">
            tldr
          </TabsTrigger>
        </TabsList>

        {/* Source descriptions */}
        <p className="text-[10px] text-zinc-600 font-mono mt-1.5 mb-3">
          {activeTab === "curated" && "Hand-picked example from this reference"}
          {activeTab === "cheatsh" && "Community cheat sheets — practical one-liners from cheat.sh"}
          {activeTab === "tldr" && "Simplified man pages with real-world examples from tldr-pages"}
        </p>

        <TabsContent value="curated" className="mt-0">
          <CuratedView content={localExample} />
        </TabsContent>

        <TabsContent value="cheatsh" className="mt-0">
          {loadingCheatsh ? (
            <LoadingSkeleton />
          ) : cheatshContent === null ? (
            <p className="text-zinc-600 text-xs font-mono">Loading…</p>
          ) : (
            <CheatshView content={cheatshContent} />
          )}
        </TabsContent>

        <TabsContent value="tldr" className="mt-0">
          {loadingTldr ? (
            <LoadingSkeleton />
          ) : tldrContent === null ? (
            <p className="text-zinc-600 text-xs font-mono">Loading…</p>
          ) : (
            <TldrView content={tldrContent} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
