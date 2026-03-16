interface OutputBlockProps {
  output: string;
}

export function OutputBlock({ output }: OutputBlockProps) {
  return (
    <div className="rounded-md border border-zinc-800 bg-[#0a0a0c] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border-b border-zinc-800">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="text-[10px] text-zinc-600 ml-2 font-mono">output</span>
      </div>
      <pre className="p-3 text-xs text-zinc-300 font-mono overflow-x-auto whitespace-pre">
        {output}
      </pre>
    </div>
  );
}
