import { CommandBreakdown } from "@/lib/types";

interface BreakdownRowProps {
  item: CommandBreakdown;
  index: number;
}

export function BreakdownRow({ item, index }: BreakdownRowProps) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="text-zinc-600 font-mono text-xs w-5 shrink-0 text-right mt-0.5">
        {index + 1}
      </span>
      <code className="text-emerald-400 font-mono text-xs sm:text-sm shrink-0 bg-emerald-500/5 px-1.5 py-0.5 rounded">
        {item.part}
      </code>
      <span className="text-zinc-400 text-xs sm:text-sm">{item.meaning}</span>
    </div>
  );
}
