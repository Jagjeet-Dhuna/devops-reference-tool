import { NextRequest, NextResponse } from "next/server";

import { categories } from "@/lib/categories";

const ALLOWED_CATEGORIES = new Set(categories.map((c) => c.id));

// In-memory rate limiter — per serverless instance (adequate deterrent at free-tier scale)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const BASE_BRANCH = process.env.GITHUB_BASE_BRANCH || "main";

function ghFetch(path: string, init?: RequestInit) {
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

export async function POST(request: NextRequest) {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return NextResponse.json(
      { error: "GitHub integration not configured. Add GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO to .env.local" },
      { status: 503 }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again in an hour." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { command, contributor } = body;

  if (!command?.id || !command?.category) {
    return NextResponse.json({ error: "Missing required fields: id and category" }, { status: 400 });
  }

  if (!ALLOWED_CATEGORIES.has(command.category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const safeId = String(command.id).toLowerCase().replace(/[^a-z0-9-_]/g, "-").slice(0, 60);
  const filePath = `data/${command.category}.json`;
  const branchName = `contrib/${safeId}-${Date.now()}`;

  try {
    // 1. Get current file content + SHA
    const fileRes = await ghFetch(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${BASE_BRANCH}`
    );

    let commands: unknown[] = [];
    let fileSha: string | undefined;

    if (fileRes.ok) {
      const fileData = await fileRes.json();
      fileSha = fileData.sha;
      commands = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf8"));
    } else if (fileRes.status !== 404) {
      throw new Error(`Failed to fetch ${filePath} from GitHub`);
    }

    // Add or replace command
    const existingIdx = (commands as Array<{ id: string }>).findIndex((c) => c.id === command.id);
    const isEdit = existingIdx >= 0;
    if (isEdit) {
      commands[existingIdx] = command;
    } else {
      commands.push(command);
    }

    const newContent = Buffer.from(JSON.stringify(commands, null, 2)).toString("base64");

    // 2. Get base branch SHA
    const branchRes = await ghFetch(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/branches/${BASE_BRANCH}`
    );
    if (!branchRes.ok) throw new Error("Failed to get base branch info");
    const branchData = await branchRes.json();
    const baseSha = branchData.commit.sha;

    // 3. Create new branch
    const createBranchRes = await ghFetch(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs`,
      {
        method: "POST",
        body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: baseSha }),
      }
    );
    if (!createBranchRes.ok) {
      const err = await createBranchRes.json();
      throw new Error(`Failed to create branch: ${err.message || JSON.stringify(err)}`);
    }

    // 4. Commit updated file to new branch
    const commitPayload: Record<string, unknown> = {
      message: `feat: ${isEdit ? "update" : "add"} \`${command.id}\` in ${command.category}`,
      content: newContent,
      branch: branchName,
    };
    if (fileSha) commitPayload.sha = fileSha;

    const commitRes = await ghFetch(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
      { method: "PUT", body: JSON.stringify(commitPayload) }
    );
    if (!commitRes.ok) {
      const err = await commitRes.json();
      throw new Error(`Failed to commit file: ${err.message || JSON.stringify(err)}`);
    }

    // 5. Create pull request
    const action = isEdit ? "Update" : "Add";
    const prBody = [
      `**${action} \`${command.id}\` in \`${command.category}\`**`,
      "",
      contributor ? `Submitted by: ${contributor}` : "Submitted via the DevOps Ref contribute form.",
      "",
      "### Details",
      `- **Title:** ${command.title}`,
      `- **Command:** \`${command.command}\``,
      `- **Category:** ${command.category}`,
      command.package ? `- **Package:** ${command.package}` : null,
      command.os?.length ? `- **OS:** ${command.os.join(", ")}` : null,
      "",
      "_Review the diff and merge if everything looks good._",
    ]
      .filter((l) => l !== null)
      .join("\n");

    const prRes = await ghFetch(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls`,
      {
        method: "POST",
        body: JSON.stringify({
          title: `${action} \`${command.id}\` command (${command.category})`,
          body: prBody,
          head: branchName,
          base: BASE_BRANCH,
        }),
      }
    );

    if (!prRes.ok) {
      const err = await prRes.json();
      throw new Error(`Failed to create PR: ${err.message || JSON.stringify(err)}`);
    }

    const prData = await prRes.json();
    return NextResponse.json({ url: prData.html_url, number: prData.number });
  } catch (err) {
    console.error("[contribute]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
