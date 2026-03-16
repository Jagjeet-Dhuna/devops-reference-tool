"use client";

import { useState, useEffect } from "react";
import { CommandFlag, ApiFlag } from "@/lib/types";
import { fetchFlags } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface FlagsSectionProps {
  commandId: string;
  localFlags?: CommandFlag[];
}

export function FlagsSection({ commandId, localFlags = [] }: FlagsSectionProps) {
  const [apiFlags, setApiFlags] = useState<ApiFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setApiFlags([]);
    setExpanded(false);
  }, [commandId]);

  const loadApiFlags = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    if (apiFlags.length > 0) {
      setExpanded(true);
      return;
    }
    setLoading(true);
    try {
      const flags = await fetchFlags(commandId);
      setApiFlags(flags);
      setExpanded(true);
    } catch {
      // Silently fail — local flags are still shown
    } finally {
      setLoading(false);
    }
  };

  const allFlags = [
    ...localFlags.map((f) => ({ ...f, source: f.source as string })),
    ...apiFlags
      .filter((af) => !localFlags.some((lf) => lf.flag.includes(af.flag)))
      .map((af) => ({ flag: af.flag, description: af.description, source: "mankier" })),
  ];

  const displayFlags = expanded ? allFlags : localFlags;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-zinc-300 font-mono">Flags & Options</h4>
        {localFlags.length > 0 && (
          <button
            onClick={loadApiFlags}
            className="text-xs text-emerald-500 hover:text-emerald-400 font-mono"
          >
            {loading ? "Loading..." : expanded ? "Show less" : "Show all flags"}
          </button>
        )}
      </div>

      {loading && !expanded ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 bg-zinc-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {displayFlags.map((flag, i) => (
            <div
              key={i}
              className="flex items-start gap-2 sm:gap-3 py-1.5 px-2 rounded hover:bg-zinc-800/30"
            >
              <code className="text-cyan-400 font-mono text-xs shrink-0 min-w-[90px] sm:min-w-[120px]">
                {flag.flag}
              </code>
              <span className="text-zinc-400 text-xs flex-1 min-w-0 break-words">{flag.description}</span>
              {flag.source === "mankier" && (
                <Badge variant="outline" className="text-[9px] text-zinc-600 border-zinc-700 shrink-0">
                  mankier
                </Badge>
              )}
            </div>
          ))}
          {displayFlags.length === 0 && (
            <p className="text-xs text-zinc-600 font-mono py-2">No flags documented yet</p>
          )}
        </div>
      )}
    </div>
  );
}
