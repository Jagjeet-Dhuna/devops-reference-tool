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
