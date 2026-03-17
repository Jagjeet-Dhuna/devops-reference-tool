"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink, Package, Monitor, GitPullRequest } from "lucide-react";
import { Command } from "@/lib/types";
import { categories } from "@/lib/categories";
import { deriveApiName } from "@/lib/command-utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BreakdownRow } from "./breakdown-row";
import { FlagsSection } from "./flags-section";
import { ExamplesSection } from "./examples-section";
import { OutputBlock } from "./output-block";
import { TipBlock } from "./tip-block";

interface DetailPanelProps {
  command: Command | null;
}


export function DetailPanel({ command }: DetailPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!command) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <div className="text-center space-y-5 max-w-xs">
          <div className="space-y-1.5">
            <p className="text-zinc-400 font-mono text-sm">Pick a command to explore</p>
            <p className="text-zinc-600 text-xs font-mono">
              Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">/</kbd> to search
            </p>
          </div>
          <div className="space-y-1.5 text-left">
            {[
              { cmd: "ls -lah", hint: "list files with sizes" },
              { cmd: "grep -rni", hint: "search file contents" },
              { cmd: "docker ps", hint: "list running containers" },
              { cmd: "kubectl get pods", hint: "list k8s pods" },
            ].map(({ cmd, hint }) => (
              <div key={cmd} className="flex items-center gap-3 px-3 py-1.5 rounded bg-zinc-900/50 border border-zinc-800/50">
                <code className="text-emerald-500 text-xs font-mono">$ {cmd}</code>
                <span className="text-zinc-600 text-xs font-mono ml-auto">{hint}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const category = categories.find((c) => c.id === command.category);
  const apiName = deriveApiName(command.command);

  const difficultyStyle: Record<string, string> = {
    beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    advanced: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const copyCommand = async () => {
    await navigator.clipboard.writeText(command.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {category && (
                <Badge
                  variant="outline"
                  className="text-xs border"
                  style={{
                    color: category.color,
                    borderColor: `${category.color}40`,
                    backgroundColor: `${category.color}10`,
                  }}
                >
                  {category.label}
                </Badge>
              )}
              {command.difficulty && (
                <Badge
                  variant="outline"
                  className={`text-xs border ${difficultyStyle[command.difficulty] ?? ""}`}
                >
                  {command.difficulty}
                </Badge>
              )}
            </div>
            <Link
              href={`/contribute?id=${command.id}&category=${command.category}`}
              className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-emerald-500 font-mono transition-colors shrink-0"
            >
              <GitPullRequest className="h-3 w-3" />
              <span className="hidden sm:inline">Edit</span>
            </Link>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100 font-mono">
            {command.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">{command.description}</p>
        </div>

        {/* Command block */}
        <div className="relative group">
          <div className="rounded-md border border-zinc-800 bg-[#0a0a0c] p-3 sm:p-4 overflow-x-auto">
            <code className="text-xs sm:text-sm text-emerald-400 font-mono whitespace-nowrap">
              {command.category === "powershell" ? ">" : "$"} {command.command}
            </code>
          </div>
          <button
            onClick={copyCommand}
            className="absolute top-2 right-2 p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 sm:opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy command"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-zinc-400" />
            )}
          </button>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-zinc-300 font-mono mb-2">
            Command Breakdown
          </h4>
          <div className="space-y-0.5">
            {command.breakdown.map((item, i) => (
              <BreakdownRow key={i} item={item} index={i} />
            ))}
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Flags */}
        <FlagsSection commandId={apiName} localFlags={command.flags} />

        <Separator className="bg-zinc-800" />

        {/* Examples */}
        <div>
          <h4 className="text-sm font-medium text-zinc-300 font-mono mb-2">
            Examples
          </h4>
          <ExamplesSection commandId={apiName} localExample={command.example} category={command.category} />
        </div>

        <Separator className="bg-zinc-800" />

        {/* Output */}
        {command.output && (
          <div>
            <h4 className="text-sm font-medium text-zinc-300 font-mono mb-2">
              Expected Output
            </h4>
            <OutputBlock output={command.output} />
          </div>
        )}

        {/* Tip */}
        {command.tip && (
          <TipBlock tip={command.tip} />
        )}

        {/* Package + OS meta row */}
        {(command.package || (command.os && command.os.length > 0)) && (
          <div className="space-y-2">
            {command.package && (
              <div className="flex items-center gap-2 flex-wrap">
                <Package className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                <Badge
                  variant="outline"
                  className="bg-sky-500/10 text-sky-400 border-sky-500/20 text-xs font-mono"
                >
                  {command.package}
                </Badge>
              </div>
            )}
            {command.os && command.os.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Monitor className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                {command.os.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs font-mono"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {command.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {command.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-zinc-800/50 text-zinc-500 text-xs font-mono"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Man page link */}
        {command.manPage && (
          <a
            href={`https://www.mankier.com/${command.manPage}/${apiName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-emerald-500 font-mono"
          >
            <ExternalLink className="h-3 w-3" />
            View full man page
          </a>
        )}
      </div>
    </ScrollArea>
  );
}
