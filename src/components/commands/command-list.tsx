"use client";

import { Command } from "@/lib/types";
import { CommandCard } from "./command-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface CommandListProps {
  commands: Command[];
  activeCommandId: string | null;
  onCommandSelect: (command: Command) => void;
  loading: boolean;
  filterLabel?: string;
}

export function CommandList({
  commands,
  activeCommandId,
  onCommandSelect,
  loading,
  filterLabel,
}: CommandListProps) {
  if (loading) {
    return (
      <div className="p-3 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-3/4 bg-zinc-800" />
            <Skeleton className="h-3 w-full bg-zinc-800" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter context strip */}
      {filterLabel && (
        <div className="shrink-0 px-3 py-1.5 border-b border-zinc-800 bg-[#0c0c0e]">
          <p className="text-[11px] font-mono text-zinc-500">{filterLabel}</p>
        </div>
      )}

      {commands.length === 0 ? (
        <div className="flex items-center justify-center flex-1 text-zinc-500 font-mono text-sm p-4">
          No commands found
        </div>
      ) : (
        <ScrollArea className="flex-1">
          {commands.map((cmd) => (
            <CommandCard
              key={`${cmd.category}-${cmd.id}`}
              command={cmd}
              isActive={activeCommandId === cmd.id}
              onClick={() => onCommandSelect(cmd)}
            />
          ))}
        </ScrollArea>
      )}
    </div>
  );
}
