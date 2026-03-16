export interface CommandBreakdown {
  part: string;
  meaning: string;
}

export interface CommandFlag {
  flag: string;
  description: string;
  source: "local" | "mankier";
}

export type OsTag =
  | "linux"
  | "macos"
  | "windows"
  | "wsl"
  | "alpine"
  | "debian"
  | "ubuntu"
  | "rhel"
  | "fedora"
  | "arch";

export interface Command {
  id: string;
  category: string;
  command: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  breakdown: CommandBreakdown[];
  flags?: CommandFlag[];
  example: string;
  output: string;
  tip: string;
  tags: string[];
  package?: string;
  os?: OsTag[];
  manPage?: string;
  relatedCommands?: string[];
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface ApiFlag {
  flag: string;
  description: string;
}

export interface ExplainResult {
  command: string;
  parts: CommandBreakdown[];
}
