# DevOps Reference Tool

A fast, searchable command reference for DevOps engineers and sysadmins. Browse and search across 300+ real-world commands across 12 categories — with breakdowns, flags, examples, and practical tips for each one.

## Categories

| Category | Commands |
|---|---|
| Linux | 83 |
| Git | 21 |
| Docker | 18 |
| Kubernetes | 17 |
| Terraform | 18 |
| Ansible | 18 |
| AWS CLI | 18 |
| Azure CLI + PowerShell | 43 |
| Networking | 18 |
| Bash | 17 |
| PowerShell | 15 |
| Distros | 12 |

## Features

- **Search** across all commands, descriptions, and tags instantly
- **Keyboard navigation** — arrow keys to move, Enter to select
- **Command breakdown** — every flag and argument explained
- **Shareable URLs** — every command has its own link at `/c/[id]`
- **OS badges** — see which commands work on Linux, macOS, Windows, WSL
- **Package info** — know what to install before you run it
- **Difficulty levels** — beginner, intermediate, advanced

## Tech Stack

- [Next.js 15](https://nextjs.org) (App Router)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding Commands

Commands live in `data/[category].json`. Each entry follows this structure:

```json
{
  "id": "unique-slug",
  "category": "docker",
  "command": "docker ps -a",
  "title": "List all containers",
  "difficulty": "beginner",
  "description": "Show all containers including stopped ones.",
  "breakdown": [
    { "part": "docker ps", "meaning": "List running containers" },
    { "part": "-a", "meaning": "Include stopped containers" }
  ],
  "flags": [
    { "flag": "-a, --all", "description": "Show all containers", "source": "local" }
  ],
  "example": "docker ps -a --format 'table {{.Names}}\t{{.Status}}'",
  "output": "CONTAINER ID   IMAGE     STATUS\nabc123         nginx     Up 2 hours",
  "tip": "Use --format to customise columns.",
  "tags": ["containers", "list", "status"],
  "package": "docker",
  "os": ["linux", "macos", "windows", "wsl"]
}
```

To add a new category, add an entry to `src/lib/categories.ts` and a matching `data/[category].json` file — it's picked up automatically.

## License

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

AGPL-3.0
