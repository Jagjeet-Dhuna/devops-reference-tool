export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#0a0a0c] px-4 py-2 text-center">
      <p className="text-xs text-zinc-500 font-mono">
        DevOps Reference Tool &mdash; Open source command reference for DevOps engineers.{" "}
        <a
          href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_OWNER ?? ""}/${process.env.NEXT_PUBLIC_GITHUB_REPO ?? ""}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-emerald-500 underline"
        >
          Contribute on GitHub
        </a>
      </p>
    </footer>
  );
}
