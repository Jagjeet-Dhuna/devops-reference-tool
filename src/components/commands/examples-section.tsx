"use client";

import { useState, useEffect } from "react";
import { fetchExamples, fetchTldr } from "@/lib/api-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExamplesSectionProps {
  commandId: string;
  localExample: string;
  category?: string;
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
function CuratedView({ content, prompt }: { content: string; prompt: string }) {
  const lines = content.split("\n").filter((l) => l.trim());
  if (!lines.length) return <p className="text-zinc-500 text-xs font-mono">No example provided.</p>;
  return (
    <div className="space-y-1">
      {lines.map((line, i) => (
        <code key={i} className="block text-emerald-400 text-xs font-mono bg-[#0a0a0c] px-3 py-1.5 rounded border border-zinc-800">
          {prompt} {line.trim()}
        </code>
      ))}
    </div>
  );
}

export function ExamplesSection({ commandId, localExample, category }: ExamplesSectionProps) {
  const prompt = category === "powershell" ? ">" : "$";
  // null = not yet fetched; "" = fetched but empty; string = has content
  const [cheatshContent, setCheatshContent] = useState<string | null>(null);
  const [tldrContent, setTldrContent] = useState<string | null>(null);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("curated");

  // Pre-fetch both sources in the background on mount so we can show/hide tabs
  useEffect(() => {
    setCheatshContent(null);
    setTldrContent(null);
    setSourcesLoading(true);
    setActiveTab("curated");

    let cancelled = false;

    Promise.all([
      fetchExamples(commandId).catch(() => []),
      fetchTldr(commandId).catch(() => null),
    ]).then(([examples, tldr]) => {
      if (cancelled) return;
      setCheatshContent(
        Array.isArray(examples) && examples[0]?.content ? examples[0].content : ""
      );
      setTldrContent(typeof tldr === "string" && tldr ? tldr : "");
      setSourcesLoading(false);
    });

    return () => { cancelled = true; };
  }, [commandId]);

  const hasCheatsh = typeof cheatshContent === "string" && cheatshContent.length > 0;
  const hasTldr = typeof tldrContent === "string" && tldrContent.length > 0;

  const handleTabChange = (tab: string) => setActiveTab(tab);

  return (
    <div>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="curated" className="font-mono text-xs data-[state=active]:bg-zinc-800">
            Curated
          </TabsTrigger>
          {/* Only render external source tabs when they have content */}
          {!sourcesLoading && hasCheatsh && (
            <TabsTrigger value="cheatsh" className="font-mono text-xs data-[state=active]:bg-zinc-800">
              cheat.sh
            </TabsTrigger>
          )}
          {!sourcesLoading && hasTldr && (
            <TabsTrigger value="tldr" className="font-mono text-xs data-[state=active]:bg-zinc-800">
              tldr
            </TabsTrigger>
          )}
        </TabsList>

        {/* Source descriptions */}
        <p className="text-[10px] text-zinc-600 font-mono mt-1.5 mb-3">
          {activeTab === "curated" && "Hand-picked example from this reference"}
          {activeTab === "cheatsh" && "Community cheat sheets — practical one-liners from cheat.sh"}
          {activeTab === "tldr" && "Simplified man pages with real-world examples from tldr-pages"}
        </p>

        <TabsContent value="curated" className="mt-0">
          <CuratedView content={localExample} prompt={prompt} />
        </TabsContent>

        {hasCheatsh && (
          <TabsContent value="cheatsh" className="mt-0">
            <CheatshView content={cheatshContent!} />
          </TabsContent>
        )}

        {hasTldr && (
          <TabsContent value="tldr" className="mt-0">
            <TldrView content={tldrContent!} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
