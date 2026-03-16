interface ExplainResultProps {
  command: string;
  explanation: string | null;
  error?: string;
}

export function ExplainResult({ command, explanation, error }: ExplainResultProps) {
  if (error) {
    return (
      <div className="rounded-md border border-red-500/20 bg-red-500/5 p-4">
        <p className="text-sm text-red-400 font-mono">{error}</p>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-sm text-zinc-500 font-mono">No explanation available for this command.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-zinc-800 bg-[#0a0a0c] p-4">
        <code className="text-sm text-emerald-400 font-mono">$ {command}</code>
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
        <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
          {explanation}
        </pre>
      </div>
    </div>
  );
}
