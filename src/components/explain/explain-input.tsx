"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ExplainInputProps {
  onSubmit: (command: string) => void;
  loading: boolean;
}

const suggestions = [
  "docker run -d -p 8080:80 nginx",
  "kubectl get pods -n production -o wide",
  "grep -rni 'error' /var/log/",
  "terraform plan -out=tfplan",
  "git rebase -i HEAD~3",
  "curl -X POST -H 'Content-Type: application/json' -d '{}'  url",
];

export function ExplainInput({ onSubmit, loading }: ExplainInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          placeholder="Type any command to explain... e.g. docker run -d -p 8080:80 nginx"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pr-12 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 font-mono text-sm h-12 focus-visible:ring-emerald-500/50"
        />
        <button
          type="submit"
          disabled={!value.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowRight className="h-4 w-4 text-white" />
        </button>
      </form>

      <div>
        <p className="text-xs text-zinc-600 font-mono mb-2">Try these:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                setValue(cmd);
                onSubmit(cmd);
              }}
              className="text-xs font-mono px-2 py-1 rounded bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors truncate max-w-xs"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
