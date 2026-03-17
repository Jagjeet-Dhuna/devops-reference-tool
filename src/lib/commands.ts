import { Command } from "./types";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

export function loadCommands(category?: string): Command[] {
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json") && !f.startsWith("_"));

  let commands: Command[] = [];

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed: Command[] = JSON.parse(raw);
    commands = commands.concat(parsed);
  }

  if (category) {
    commands = commands.filter((c) => c.category === category);
  }

  return commands;
}

const STOP_WORDS = new Set([
  "how", "to", "do", "i", "a", "an", "the", "in", "into", "for", "with",
  "on", "at", "of", "is", "it", "my", "can", "use", "get", "what", "does",
  "where", "why", "when", "which", "who", "will", "me", "please", "want",
  "need", "show", "list",
]);

export function searchCommands(
  commands: Command[],
  query: string
): Command[] {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9-]/g, ""))
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  // Fallback to full-string match if query has no scoring words (e.g. "how to")
  if (words.length === 0) {
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.command.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        (c.package?.toLowerCase().includes(q) ?? false)
    );
  }

  const scored = commands.map((c) => {
    const title = c.title.toLowerCase();
    const command = c.command.toLowerCase();
    const tags = c.tags.map((t) => t.toLowerCase());
    const category = c.category.toLowerCase();
    const pkg = (c.package ?? "").toLowerCase();
    const description = c.description.toLowerCase();

    let score = 0;
    for (const word of words) {
      if (title.includes(word))                  score += 10;
      if (command.includes(word))                score += 8;
      if (tags.some((t) => t.includes(word)))    score += 6;
      if (category.includes(word))               score += 5;
      if (pkg.includes(word))                    score += 4;
      if (description.includes(word))            score += 2;
    }
    return { c, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.c);
}

// Multi-word CLI tools whose subcommand matters for tldr/man lookups
const MULTI_WORD_TOOLS = new Set([
  "git", "docker", "kubectl", "aws", "az", "terraform", "ansible",
  "systemctl", "journalctl", "npm", "yarn", "pip", "pip3",
  "cargo", "go", "helm", "vault",
]);

/**
 * Derive the correct lookup name for tldr-pages, ManKier, and cheat.sh from
 * the raw command string. Examples:
 *   "ping -c 4 8.8.8.8"            → "ping"
 *   "git log --oneline --graph"     → "git-log"
 *   "docker run -d -p 8080:80 ..."  → "docker-run"
 *   "kubectl get pods -n ns"        → "kubectl-get"
 *   "aws configure"                 → "aws-configure"
 */
export function deriveApiName(commandString: string): string {
  const tokens = commandString.split(/\s+/).filter((t) => t.length > 0);
  // Strip flag tokens and value-only tokens
  const nonFlags = tokens.filter(
    (t) => !t.startsWith("-") && !t.startsWith("{") && !t.includes("=") && t !== "|" && t !== ">" && t !== "<"
  );

  if (nonFlags.length === 0) return tokens[0]?.toLowerCase() ?? commandString;

  const base = nonFlags[0].toLowerCase();

  if (MULTI_WORD_TOOLS.has(base) && nonFlags[1]) {
    return `${base}-${nonFlags[1].toLowerCase()}`;
  }

  return base;
}

export function filterCommands(
  commands: Command[],
  options: {
    category?: string;
    search?: string;
    difficulty?: string;
    tag?: string;
    os?: string;
  }
): Command[] {
  let result = commands;

  if (options.category) {
    result = result.filter((c) => c.category === options.category);
  }

  if (options.difficulty) {
    result = result.filter((c) => c.difficulty === options.difficulty);
  }

  if (options.tag) {
    result = result.filter((c) => c.tags.includes(options.tag!));
  }

  if (options.os) {
    result = result.filter((c) => c.os?.includes(options.os as never));
  }

  if (options.search) {
    result = searchCommands(result, options.search);
  }

  return result;
}
