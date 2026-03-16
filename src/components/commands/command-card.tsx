"use client";

import { cn } from "@/lib/utils";
import { Command } from "@/lib/types";
import { categories } from "@/lib/categories";

interface CommandCardProps {
  command: Command;
  isActive: boolean;
  onClick: () => void;
}

export function CommandCard({ command, isActive, onClick }: CommandCardProps) {
  const category = categories.find((c) => c.id === command.category);

  return (
    <button
      data-command-id={`${command.category}-${command.id}`}
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-3 border-b border-zinc-800/50 transition-colors",
        isActive
          ? "bg-zinc-800/60 border-l-[3px]"
          : "hover:bg-zinc-800/30 border-l-[3px] border-l-transparent"
      )}
      style={
        isActive && category
          ? { borderLeftColor: category.color }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <code
          className="text-sm font-mono leading-tight truncate"
          style={{ color: category?.color ?? "#71717a" }}
        >
          $ {command.command}
        </code>
      </div>
      <p className="text-xs text-zinc-500 font-mono truncate">
        {command.title}
      </p>
    </button>
  );
}
