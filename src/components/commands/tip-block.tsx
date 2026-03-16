import { Lightbulb } from "lucide-react";

interface TipBlockProps {
  tip: string;
}

export function TipBlock({ tip }: TipBlockProps) {
  return (
    <div className="flex gap-3 rounded-md border border-amber-500/20 bg-amber-500/5 p-3">
      <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
      <p className="text-sm text-amber-200/80">{tip}</p>
    </div>
  );
}
