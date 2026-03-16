"use client";

import {
  Terminal,
  Network,
  Layers,
  Cloud,
  CloudCog,
  Code2,
  type LucideIcon,
} from "lucide-react";
import {
  SiDocker,
  SiKubernetes,
  SiTerraform,
  SiAnsible,
  SiGit,
  SiLinux,
  SiGnubash,
} from "react-icons/si";
import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/categories";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const lucideIconMap: Record<string, LucideIcon> = {
  Network,
  Layers,
  Cloud,
  CloudCog,
  Code2,
};

// Brand logos via react-icons/si — keyed by category id
// AWS, Azure, PowerShell not available in react-icons v5 si subset — Lucide fallback used
const brandIconMap: Record<string, IconType> = {
  linux:      SiLinux,
  bash:       SiGnubash,
  docker:     SiDocker,
  kubernetes: SiKubernetes,
  terraform:  SiTerraform,
  ansible:    SiAnsible,
  git:        SiGit,
};

const OS_OPTIONS = [
  { value: "linux",  label: "Linux" },
  { value: "macos",  label: "macOS" },
  { value: "alpine", label: "Alpine" },
  { value: "wsl",    label: "WSL" },
];

interface CategorySidebarProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  commandCounts: Record<string, number>;
  activeOs: string | null;
  onOsChange: (os: string | null) => void;
}

export function CategorySidebar({
  activeCategory,
  onCategoryChange,
  commandCounts,
  activeOs,
  onOsChange,
}: CategorySidebarProps) {
  return (
    <aside className="hidden sm:flex flex-col overflow-hidden border-r border-zinc-800 bg-[#0a0a0c] w-14 lg:w-48 shrink-0">
      <div className="p-2 lg:p-3">
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            "w-full flex items-center gap-3 px-2 lg:px-3 py-2 rounded-md text-sm font-mono transition-colors",
            activeCategory === null
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          )}
        >
          <Terminal className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">All Commands</span>
        </button>
      </div>

      <div className="h-px bg-zinc-800 mx-2" />

      <nav className="flex-1 p-2 lg:p-3 space-y-1 overflow-y-auto">
        {categories.map((cat) => {
          const BrandIcon = brandIconMap[cat.id];
          const FallbackIcon = lucideIconMap[cat.icon] || Terminal;
          const isActive = activeCategory === cat.id;
          const count = commandCounts[cat.id] || 0;
          const iconColor = isActive ? cat.color : undefined;

          return (
            <Tooltip key={cat.id}>
              <TooltipTrigger
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-2 lg:px-3 py-2 rounded-md text-sm font-mono transition-colors",
                  isActive
                    ? "text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                )}
                style={
                  isActive
                    ? { backgroundColor: `${cat.color}20`, color: cat.color }
                    : undefined
                }
              >
                {BrandIcon
                  ? <BrandIcon className="h-5 w-5 shrink-0" style={{ color: iconColor }} />
                  : <FallbackIcon className="h-5 w-5 shrink-0" style={{ color: iconColor }} />
                }
                <span className="hidden lg:inline flex-1 text-left">{cat.label}</span>
                {count > 0 && (
                  <span className="hidden lg:inline text-xs text-zinc-500">
                    {count}
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent side="right" className="lg:hidden">
                {cat.label} ({count})
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* OS filter — expanded sidebar only */}
      <div className="hidden lg:block">
        <div className="h-px bg-zinc-800 mx-2" />
        <div className="p-3 space-y-1.5">
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest px-1">
            Platform
          </p>
          <button
            onClick={() => onOsChange(null)}
            className={cn(
              "w-full text-left px-2 py-1.5 rounded text-xs font-mono transition-colors",
              activeOs === null
                ? "bg-zinc-800 text-zinc-200"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            )}
          >
            All platforms
          </button>
          {OS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onOsChange(activeOs === opt.value ? null : opt.value)}
              className={cn(
                "w-full text-left px-2 py-1.5 rounded text-xs font-mono transition-colors",
                activeOs === opt.value
                  ? "bg-violet-500/15 text-violet-300"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
