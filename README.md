# DevOps Reference Tool

I built this mostly for myself — I wanted a clean, fast way to look up commands, read flag explanations, and explore CLI tools from any device (especially a tablet or phone where copy-pasting from a terminal isn't an option). It grew from there into something I thought might be useful to others too.

**Built with AI assistance.** The majority of this tool — code, command data, and content — was built in collaboration with [Claude](https://claude.ai) by Anthropic. The ideas, direction, and editorial judgment are mine; Claude did the heavy lifting.

---

A searchable command reference for DevOps engineers and sysadmins. Browse 300+ real-world commands across 12 categories — with breakdowns, flags, examples, and practical tips for each one.

## Categories

| Category | Commands |
|---|---|
| Linux | 83 |
| Git | 26 |
| Docker | 22 |
| Kubernetes | 21 |
| Terraform | 18 |
| Ansible | 18 |
| AWS CLI | 25 |
| Azure CLI | 46 |
| Networking | 18 |
| Bash | 18 |
| PowerShell | 17 |
| Distros | 12 |

## Features

- **Search** across all commands, descriptions, and tags instantly
- **Keyboard navigation** — arrow keys to move, Enter to select, `/` to search
- **Command breakdown** — every flag and argument explained inline
- **External sources** — pulls in cheat.sh and tldr-pages examples where available
- **Shareable URLs** — every command has its own link at `/c/[id]`
- **OS badges** — see which commands work on Linux, macOS, Windows, WSL
- **Package info** — know what to install before you run it
- **Difficulty levels** — beginner, intermediate, advanced

## Contributing

If this is useful to you, feel free to add more commands or entire new sections. All command data lives in `data/[category].json` — it's plain JSON, no build step needed to add entries.

Each command follows this structure:

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

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- [Next.js 15](https://nextjs.org) (App Router)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)

## License

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

AGPL-3.0
