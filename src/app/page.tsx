"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Command } from "@/lib/types";
import { useCommands } from "@/hooks/use-commands";
import { categories } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/layout/top-bar";
import { CategorySidebar } from "@/components/layout/category-sidebar";
import { Footer } from "@/components/layout/footer";
import { CommandList } from "@/components/commands/command-list";
import { DetailPanel } from "@/components/commands/detail-panel";

const MOBILE_OS = ["linux", "macos", "windows", "alpine", "wsl"];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeOs, setActiveOs] = useState<string | null>(null);
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { commands, loading } = useCommands({
    category: activeCategory || undefined,
    search: searchQuery || undefined,
    os: activeOs || undefined,
  });

  const { commands: allCmds } = useCommands({});
  const allCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allCmds.forEach((cmd) => {
      counts[cmd.category] = (counts[cmd.category] || 0) + 1;
    });
    return counts;
  }, [allCmds]);

  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);
    setSelectedCommand(null);
  };

  // Keyboard arrow navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "SELECT") return;
      if (commands.length === 0) return;
      e.preventDefault();
      const currentIndex = selectedCommand
        ? commands.findIndex(
            (c) => c.id === selectedCommand.id && c.category === selectedCommand.category
          )
        : -1;
      const nextIndex =
        e.key === "ArrowDown"
          ? Math.min(currentIndex + 1, commands.length - 1)
          : Math.max(currentIndex - 1, 0);
      const next = commands[nextIndex];
      setSelectedCommand(next);
      document
        .querySelector(`[data-command-id="${next.category}-${next.id}"]`)
        ?.scrollIntoView({ block: "nearest" });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commands, selectedCommand]);

  // Build the filter context label for the list panel
  const filterLabel = (() => {
    const parts: string[] = [];
    if (activeCategory) parts.push(activeCategory);
    if (activeOs) parts.push(activeOs);
    const count = `${commands.length} result${commands.length !== 1 ? "s" : ""}`;
    return parts.length ? `${count} · ${parts.join(" · ")}` : undefined;
  })();

  return (
    <div className="flex flex-col h-screen bg-[#0c0c0e] text-zinc-100">
      <TopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        commandCount={commands.length}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
      />

      {/* ── Mobile filter bars (hidden on sm+) ─────────────────────────────── */}
      <div className="sm:hidden border-b border-zinc-800 bg-[#0a0a0c]">
        {/* Toggle row */}
        <button
          onClick={() => setFiltersOpen(o => !o)}
          className="w-full flex items-center justify-between px-3 py-2"
        >
          <span className="text-xs font-mono text-zinc-500">Filters</span>
          <div className="flex items-center gap-2">
            {(activeCategory || activeOs) && (
              <span className="text-xs font-mono text-zinc-400">
                {[activeCategory, activeOs].filter(Boolean).join(" · ")}
              </span>
            )}
            {filtersOpen
              ? <ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
              : <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
            }
          </div>
        </button>

        {/* Collapsible chip rows */}
        {filtersOpen && (
          <>
            {/* Category chips */}
            <div className="flex overflow-x-auto gap-1.5 px-3 pb-1.5 no-scrollbar">
              <button
                onClick={() => handleCategoryChange(null)}
                className={cn(
                  "shrink-0 px-3 py-1 rounded-full text-xs font-mono border transition-colors",
                  activeCategory === null
                    ? "bg-zinc-700 text-zinc-100 border-zinc-600"
                    : "text-zinc-400 border-zinc-700 hover:border-zinc-500"
                )}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={cn(
                    "shrink-0 px-3 py-1 rounded-full text-xs font-mono border transition-colors",
                    activeCategory === cat.id
                      ? "border-transparent"
                      : "text-zinc-400 border-zinc-700 hover:border-zinc-500"
                  )}
                  style={
                    activeCategory === cat.id
                      ? {
                          backgroundColor: `${cat.color}22`,
                          color: cat.color,
                          borderColor: `${cat.color}44`,
                        }
                      : undefined
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* OS filter chips */}
            <div className="flex overflow-x-auto gap-1.5 px-3 pb-2 no-scrollbar">
              <button
                onClick={() => setActiveOs(null)}
                className={cn(
                  "shrink-0 px-2.5 py-0.5 rounded text-[11px] font-mono border transition-colors",
                  activeOs === null
                    ? "bg-zinc-800 text-zinc-200 border-zinc-600"
                    : "text-zinc-500 border-zinc-800"
                )}
              >
                All OS
              </button>
              {MOBILE_OS.map((os) => (
                <button
                  key={os}
                  onClick={() => setActiveOs(activeOs === os ? null : os)}
                  className={cn(
                    "shrink-0 px-2.5 py-0.5 rounded text-[11px] font-mono border transition-colors",
                    activeOs === os
                      ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
                      : "text-zinc-500 border-zinc-800"
                  )}
                >
                  {os}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on mobile */}
        <CategorySidebar
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          commandCounts={allCounts}
          activeOs={activeOs}
          onOsChange={setActiveOs}
          isOpen={sidebarOpen}
        />

        {/* Command list — desktop middle panel */}
        <div className="h-full w-72 lg:w-80 border-r border-zinc-800 bg-[#0c0c0e] overflow-hidden shrink-0 hidden sm:block">
          <CommandList
            commands={commands}
            activeCommandId={selectedCommand?.id || null}
            onCommandSelect={setSelectedCommand}
            loading={loading}
            filterLabel={filterLabel}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-hidden bg-[#0e0e10]">
          {/* Mobile: full-screen list or detail */}
          <div className="sm:hidden h-full flex flex-col">
            {selectedCommand ? (
              <>
                {/* Back bar */}
                <button
                  onClick={() => setSelectedCommand(null)}
                  className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-[#0c0c0e] shrink-0 w-full text-left"
                >
                  <ArrowLeft className="h-4 w-4 text-emerald-500 shrink-0" />
                  <code className="text-xs font-mono text-zinc-300 truncate">
                    $ {selectedCommand.id.replace(/-/g, ' ')}
                  </code>
                </button>
                <div className="flex-1 overflow-hidden">
                  <DetailPanel command={selectedCommand} />
                </div>
              </>
            ) : (
              <CommandList
                commands={commands}
                activeCommandId={null}
                onCommandSelect={setSelectedCommand}
                loading={loading}
              />
            )}
          </div>

          {/* Desktop: always show detail panel */}
          <div className="hidden sm:block h-full">
            <DetailPanel command={selectedCommand} />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
