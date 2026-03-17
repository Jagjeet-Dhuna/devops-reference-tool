"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Terminal, GitPullRequest, X, PanelLeft, PanelLeftClose } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  commandCount: number;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function TopBar({ searchQuery, onSearchChange, commandCount, sidebarOpen, onToggleSidebar }: TopBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // "/" focuses search (unless already in an input/textarea)
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Esc clears and blurs
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        onSearchChange("");
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSearchChange]);

  return (
    <header className="border-b border-zinc-800 bg-[#0c0c0e] px-3 sm:px-4 py-2.5 sm:py-3">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sidebar toggle — tablet/desktop only */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden sm:flex items-center justify-center h-8 w-8 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors shrink-0"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen
              ? <PanelLeftClose className="h-4 w-4" />
              : <PanelLeft className="h-4 w-4" />
            }
          </button>
        )}

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Terminal className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
          <h1 className="text-base sm:text-lg font-bold text-zinc-100 font-mono leading-none">
            DevOps Ref
          </h1>
          <Badge
            variant="secondary"
            className="bg-zinc-800 text-zinc-400 text-xs hidden sm:inline-flex"
          >
            {commandCount}
          </Badge>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands… (press /)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-8 sm:pl-9 sm:pr-9 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-100 placeholder:text-zinc-500 font-mono text-xs sm:text-sm h-8 sm:h-9 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => { onSearchChange(""); inputRef.current?.focus(); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Contribute */}
        <Link
          href="/contribute"
          className="shrink-0 flex items-center gap-1.5 text-zinc-500 hover:text-emerald-400 font-mono transition-colors"
          title="Contribute a command"
        >
          <GitPullRequest className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Contribute</span>
        </Link>
      </div>
    </header>
  );
}
