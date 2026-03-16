"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Terminal,
  Plus,
  Trash2,
  GitPullRequest,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { categories } from "@/lib/categories";
import { Command, OsTag } from "@/lib/types";

const OS_OPTIONS: OsTag[] = [
  "linux", "macos", "windows", "wsl", "alpine",
  "debian", "ubuntu", "rhel", "fedora", "arch",
];

interface BreakdownRow { part: string; meaning: string }
interface FlagRow { flag: string; description: string }

interface FormState {
  id: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  title: string;
  description: string;
  command: string;
  breakdown: BreakdownRow[];
  flags: FlagRow[];
  example: string;
  output: string;
  tip: string;
  tags: string;
  package: string;
  os: string[];
  manPage: string;
}

const defaultForm: FormState = {
  id: "",
  category: "linux",
  difficulty: "beginner",
  title: "",
  description: "",
  command: "",
  breakdown: [{ part: "", meaning: "" }],
  flags: [{ flag: "", description: "" }],
  example: "",
  output: "",
  tip: "",
  tags: "",
  package: "",
  os: [],
  manPage: "",
};

function formToCommand(form: FormState) {
  return {
    id: form.id,
    category: form.category,
    title: form.title,
    description: form.description,
    command: form.command,
    difficulty: form.difficulty,
    breakdown: form.breakdown.filter((b) => b.part || b.meaning),
    flags: form.flags
      .filter((f) => f.flag.trim())
      .map((f) => ({ ...f, source: "local" as const })),
    example: form.example,
    output: form.output,
    tip: form.tip,
    tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    ...(form.package ? { package: form.package } : {}),
    ...(form.os.length ? { os: form.os } : {}),
    ...(form.manPage ? { manPage: form.manPage } : {}),
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="border-b border-zinc-800 pb-2">
        <h3 className="text-sm font-mono font-semibold text-zinc-200">{title}</h3>
        {hint && <p className="text-[11px] text-zinc-600 mt-0.5 font-mono">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-mono text-zinc-400">
        {label}
        {hint && <span className="text-zinc-600 ml-2 font-normal">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500/50 placeholder:text-zinc-600 ${className ?? ""}`}
    />
  );
}

// ── Main form ────────────────────────────────────────────────────────────────

function ContributeForm() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const editCategory = searchParams.get("category");

  const [form, setForm] = useState<FormState>(defaultForm);
  const [contributor, setContributor] = useState("");
  const [showJson, setShowJson] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ url: string; number: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill if editing an existing command
  useEffect(() => {
    if (!editId || !editCategory) return;
    fetch(`/api/commands?category=${editCategory}`)
      .then((r) => r.json())
      .then((cmds: Command[]) => {
        const cmd = cmds.find((c) => c.id === editId);
        if (!cmd) return;
        setForm({
          id: cmd.id,
          category: cmd.category,
          difficulty: cmd.difficulty ?? "beginner",
          title: cmd.title,
          description: cmd.description,
          command: cmd.command,
          breakdown: cmd.breakdown.map((b) => ({ part: b.part, meaning: b.meaning })),
          flags: (cmd.flags ?? [])
            .filter((f) => f.source === "local")
            .map((f) => ({ flag: f.flag, description: f.description })),
          example: cmd.example,
          output: cmd.output ?? "",
          tip: cmd.tip ?? "",
          tags: (cmd.tags ?? []).join(", "),
          package: cmd.package ?? "",
          os: cmd.os ?? [],
          manPage: cmd.manPage ?? "",
        });
      });
  }, [editId, editCategory]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: formToCommand(form), contributor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
          <Check className="h-6 w-6 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-zinc-100 font-mono mb-2">PR Submitted!</h2>
        <p className="text-zinc-400 text-sm font-mono mb-6">
          Pull request #{result.number} is open and waiting for review.
        </p>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded font-mono text-sm hover:bg-emerald-500/20 transition-colors"
        >
          <GitPullRequest className="h-4 w-4" />
          View Pull Request on GitHub
        </a>
        <button
          onClick={() => { setResult(null); setForm(defaultForm); }}
          className="mt-4 text-xs text-zinc-500 hover:text-zinc-300 font-mono"
        >
          Submit another
        </button>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Info banner */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs font-mono text-zinc-400 flex items-start gap-3">
        <GitPullRequest className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
        <span>
          Fill in the fields below and click{" "}
          <span className="text-emerald-400">Submit Pull Request</span> — a PR will be
          opened on GitHub for review. Prefer to edit files directly?{" "}
          <a
            href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_OWNER ?? "owner"}/${process.env.NEXT_PUBLIC_GITHUB_REPO ?? "repo"}/tree/main/data`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline"
          >
            Browse data files on GitHub ↗
          </a>
        </span>
      </div>

      {/* ── Basic Info ── */}
      <Section title="Basic Info">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Command ID" hint="slug, e.g. grep">
            <TextInput
              value={form.id}
              onChange={(e) => set("id", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              placeholder="grep"
              required
            />
          </Field>
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500/50"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Difficulty">
            <select
              value={form.difficulty}
              onChange={(e) =>
                set("difficulty", e.target.value as FormState["difficulty"])
              }
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select>
          </Field>
        </div>
        <Field label="Title" hint="short human-readable name">
          <TextInput
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Search files recursively"
            required
          />
        </Field>
        <Field label="Description">
          <TextInput
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Searches for text patterns across files and directories"
            required
          />
        </Field>
        <Field label="Command" hint="full example with common flags">
          <TextInput
            value={form.command}
            onChange={(e) => set("command", e.target.value)}
            placeholder="grep -rni 'pattern' /path"
            required
          />
        </Field>
      </Section>

      {/* ── Breakdown ── */}
      <Section
        title="Command Breakdown"
        hint="Break the command into parts — each part with an explanation"
      >
        <div className="space-y-2">
          {form.breakdown.map((row, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-2 items-start">
              <TextInput
                value={row.part}
                onChange={(e) => {
                  const b = [...form.breakdown];
                  b[i] = { ...b[i], part: e.target.value };
                  set("breakdown", b);
                }}
                placeholder="grep"
                className="w-full sm:w-1/3"
              />
              <div className="flex gap-2 w-full sm:flex-1">
                <TextInput
                  value={row.meaning}
                  onChange={(e) => {
                    const b = [...form.breakdown];
                    b[i] = { ...b[i], meaning: e.target.value };
                    set("breakdown", b);
                  }}
                  placeholder="The command itself"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => set("breakdown", form.breakdown.filter((_, j) => j !== i))}
                  className="p-2 text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set("breakdown", [...form.breakdown, { part: "", meaning: "" }])}
          className="flex items-center gap-1.5 text-xs text-emerald-500 hover:text-emerald-400 font-mono transition-colors"
        >
          <Plus className="h-3 w-3" /> Add part
        </button>
      </Section>

      {/* ── Flags ── */}
      <Section title="Flags & Options" hint="Optional — list key flags">
        <div className="space-y-2">
          {form.flags.map((row, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-2 items-start">
              <TextInput
                value={row.flag}
                onChange={(e) => {
                  const f = [...form.flags];
                  f[i] = { ...f[i], flag: e.target.value };
                  set("flags", f);
                }}
                placeholder="-r, --recursive"
                className="w-full sm:w-1/3"
              />
              <div className="flex gap-2 w-full sm:flex-1">
                <TextInput
                  value={row.description}
                  onChange={(e) => {
                    const f = [...form.flags];
                    f[i] = { ...f[i], description: e.target.value };
                    set("flags", f);
                  }}
                  placeholder="Search directories recursively"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => set("flags", form.flags.filter((_, j) => j !== i))}
                  className="p-2 text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set("flags", [...form.flags, { flag: "", description: "" }])}
          className="flex items-center gap-1.5 text-xs text-emerald-500 hover:text-emerald-400 font-mono transition-colors"
        >
          <Plus className="h-3 w-3" /> Add flag
        </button>
      </Section>

      {/* ── Examples & Content ── */}
      <Section title="Examples & Content">
        <Field label="Example" hint="common usage, can be multi-line">
          <textarea
            value={form.example}
            onChange={(e) => set("example", e.target.value)}
            placeholder={`grep -rni 'TODO' ./src/\ngrep -l 'pattern' *.log`}
            rows={4}
            required
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500/50 placeholder:text-zinc-600 resize-y"
          />
        </Field>
        <Field label="Expected Output" hint="optional — what the command typically prints">
          <textarea
            value={form.output}
            onChange={(e) => set("output", e.target.value)}
            placeholder="./src/app.ts:42:  // TODO: fix this"
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500/50 placeholder:text-zinc-600 resize-y"
          />
        </Field>
        <Field label="Tip" hint="optional — helpful tip or gotcha">
          <TextInput
            value={form.tip}
            onChange={(e) => set("tip", e.target.value)}
            placeholder="Use -c to only print a count of matches"
          />
        </Field>
      </Section>

      {/* ── Metadata ── */}
      <Section title="Metadata">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Package" hint="e.g. grep, coreutils, iproute2">
            <TextInput
              value={form.package}
              onChange={(e) => set("package", e.target.value)}
              placeholder="grep"
            />
          </Field>
          <Field label="Man page section" hint="usually 1, 5, or 8">
            <TextInput
              value={form.manPage}
              onChange={(e) => set("manPage", e.target.value)}
              placeholder="1"
            />
          </Field>
        </div>
        <Field label="Tags" hint="comma-separated search keywords">
          <TextInput
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="search, find, filter, text, pattern, keyword"
          />
        </Field>
        <Field label="OS Compatibility">
          <div className="flex flex-wrap gap-2 pt-1">
            {OS_OPTIONS.map((os) => (
              <button
                key={os}
                type="button"
                onClick={() => {
                  const next = form.os.includes(os)
                    ? form.os.filter((o) => o !== os)
                    : [...form.os, os];
                  set("os", next);
                }}
                className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors ${
                  form.os.includes(os)
                    ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
                    : "text-zinc-500 border-zinc-700 hover:border-zinc-500 hover:text-zinc-300"
                }`}
              >
                {os}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* ── Contributor ── */}
      <Section title="About You" hint="optional">
        <Field label="Name or GitHub handle">
          <TextInput
            value={contributor}
            onChange={(e) => setContributor(e.target.value)}
            placeholder="@yourusername"
          />
        </Field>
      </Section>

      {/* ── JSON Preview ── */}
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowJson(!showJson)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 transition-colors"
        >
          <span>Preview JSON</span>
          {showJson ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
        {showJson && (
          <pre className="px-4 pb-4 text-xs font-mono text-zinc-400 bg-[#0a0a0c] overflow-x-auto max-h-96 overflow-y-auto">
            {JSON.stringify(formToCommand(form), null, 2)}
          </pre>
        )}
      </div>

      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-mono text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4 pb-12">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded font-mono text-sm hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GitPullRequest className="h-4 w-4" />
          {submitting ? "Creating PR…" : "Submit Pull Request"}
        </button>
        <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 font-mono transition-colors">
          ← Back
        </Link>
      </div>
    </form>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ContributePage() {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100">
      <header className="border-b border-zinc-800 bg-[#0a0a0c] px-6 py-4 flex items-center gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Terminal className="h-5 w-5 text-emerald-500" />
        <Link href="/" className="font-mono text-sm font-bold text-zinc-100 hover:text-zinc-200">
          DevOps Ref
        </Link>
        <span className="text-zinc-700 font-mono">/</span>
        <span className="font-mono text-sm text-zinc-400">contribute</span>
      </header>

      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-mono text-zinc-100 mb-2">
            Contribute a Command
          </h1>
          <p className="text-zinc-500 text-sm font-mono">
            Add a new command or improve an existing one. Your submission opens a pull request for review.
          </p>
        </div>

        <Suspense fallback={null}>
          <ContributeForm />
        </Suspense>
      </div>
    </div>
  );
}
