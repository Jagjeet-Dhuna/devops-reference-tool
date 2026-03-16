"use client";

import { useState } from "react";
import Link from "next/link";
import { Terminal, ArrowLeft } from "lucide-react";
import { fetchExplain } from "@/lib/api-client";
import { ExplainInput } from "@/components/explain/explain-input";
import { ExplainResult } from "@/components/explain/explain-result";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExplainPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    command: string;
    explanation: string | null;
    error?: string;
  } | null>(null);

  const handleExplain = async (command: string) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await fetchExplain(command);
      setResult(data);
    } catch {
      setResult({
        command,
        explanation: null,
        error: "Failed to reach the explanation service. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100">
      <header className="border-b border-zinc-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 text-sm font-mono"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-emerald-500" />
            <h1 className="text-lg font-bold font-mono">Explain Any Command</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <p className="text-zinc-400 text-sm">
            Paste any command and get a detailed breakdown of what each part does.
            Powered by ManKier.
          </p>
        </div>

        <ExplainInput onSubmit={handleExplain} loading={loading} />

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-12 bg-zinc-800" />
            <Skeleton className="h-32 bg-zinc-800" />
          </div>
        )}

        {result && !loading && (
          <ExplainResult
            command={result.command}
            explanation={result.explanation}
            error={result.error}
          />
        )}
      </main>
    </div>
  );
}
