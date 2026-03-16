# Contributing to DevOps Ref

Thanks for your interest in contributing! This project is built by the community, and every contribution helps.

## Adding a New Command

1. **Fork** this repository
2. **Edit** the appropriate file in `data/` (e.g., `data/docker.json` for Docker commands)
3. **Add** your command object following the schema below
4. **Submit** a Pull Request

### Command Schema

Each command entry must include:

```json
{
  "id": "unique-slug",
  "category": "linux|bash|terraform|docker|kubernetes|git|networking|ansible",
  "command": "full command syntax",
  "title": "Short human-readable title",
  "difficulty": "beginner|intermediate|advanced",
  "description": "What this command does (at least 10 characters)",
  "breakdown": [
    { "part": "-flag", "meaning": "What this part does" }
  ],
  "flags": [
    { "flag": "-f, --flag", "description": "Flag description", "source": "local" }
  ],
  "example": "A real-world usage example",
  "output": "Expected terminal output",
  "tip": "A pro tip for using this command",
  "tags": ["relevant", "tags"]
}
```

### Guidelines

- **`id`** must be unique, lowercase, using hyphens (e.g., `docker-run`, `kubectl-get-pods`)
- **`category`** must match one of the 8 valid categories
- **`breakdown`** must have at least one entry explaining each part of the command
- **`tags`** must have at least one tag
- **`source`** for flags should be `"local"` for manually curated entries
- Keep descriptions concise but informative
- Include realistic output examples
- Tips should provide actionable advice

### Optional Fields

- `manPage` — Man page section number (e.g., `"1"`)
- `relatedCommands` — Array of related command IDs

## Adding a New Category

1. Add the category definition to `src/lib/categories.ts`
2. Create a new `data/{category}.json` file
3. Add the category ID to the enum in `data/_schema.json`
4. Submit a PR

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

## Validation

All PRs are automatically validated by CI:
- JSON files are checked against `data/_schema.json`
- Duplicate IDs are detected
- Invalid category references are caught

Make sure your JSON is valid before submitting!
