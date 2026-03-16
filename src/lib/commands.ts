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

export function searchCommands(
  commands: Command[],
  query: string
): Command[] {
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
