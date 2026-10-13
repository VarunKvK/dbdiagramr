// Action entry: read PR event + inputs, gather migration files at base and
// head SHAs, render the comment, then create or update the sticky comment.
import { execFileSync } from "node:child_process";
import { readFileSync, appendFileSync } from "node:fs";
import { parseFileMap, renderComment, COMMENT_MARKER } from "./core";
import { globToRegExp } from "./lib/glob";

// --- tiny @actions/core replacement (zero dependencies) -------------------

function getInput(name: string, fallback = ""): string {
  const key = `INPUT_${name.replace(/ /g, "_").toUpperCase()}`;
  const alt = `INPUT_${name.replace(/[- ]/g, "_").toUpperCase()}`;
  return process.env[key]?.trim() || process.env[alt]?.trim() || fallback;
}

function setOutput(name: string, value: string): void {
  const file = process.env.GITHUB_OUTPUT;
  if (file) appendFileSync(file, `${name}=${value}\n`);
}

function info(msg: string): void {
  process.stdout.write(`::notice::${msg}\n`);
}

function fail(msg: string): never {
  process.stdout.write(`::error::${msg}\n`);
  process.exit(1);
}

// --- git helpers ----------------------------------------------------------

function git(args: string[], opts: { maxBuffer?: number } = {}): string {
  return execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: opts.maxBuffer ?? 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function gitTry(args: string[]): string | null {
  try {
    return git(args);
  } catch {
    return null;
  }
}

function ensureCommit(sha: string): void {
  if (gitTry(["cat-file", "-e", `${sha}^{commit}`]) !== null) return;
  info(`Commit ${sha.slice(0, 7)} not present locally — fetching (needs a checkout with fetch-depth: 0, or network access).`);
  gitTry(["fetch", "--no-tags", "--depth=1", "origin", sha]);
  if (gitTry(["cat-file", "-e", `${sha}^{commit}`]) === null)
    fail(
      `Cannot read ${sha.slice(0, 7)}. Use actions/checkout with fetch-depth: 0 so the base commit exists.`
    );
}

function listTree(sha: string): string[] {
  const out = git(["ls-tree", "-r", "-z", "--name-only", sha], { maxBuffer: 32 * 1024 * 1024 });
  return out.split("\0").filter(Boolean);
}

function showFile(sha: string, path: string): string | null {
  return gitTry(["show", `${sha}:${path}`]);
}

// --- GitHub comment API (zero dependencies) -------------------------------

type GhComment = { id: number; body?: string };

const API = process.env.GITHUB_API_URL || "https://api.github.com";

async function api<T>(token: string, method: string, url: string, body?: unknown): Promise<T> {
  url = url.replace("https://api.github.com", API);
  const res = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "pr-schema-diff-erd",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    fail(`GitHub API ${method} ${url} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

// --- main -----------------------------------------------------------------

async function main(): Promise<void> {
  const glob = getInput("migrations-path", "**/migrations/**/*.sql");
  const token =
    getInput("github-token") || process.env.GITHUB_TOKEN || "";
  if (!token) fail("Missing github-token input.");

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) fail("GITHUB_EVENT_PATH not set — run this on pull_request events.");
  const event = JSON.parse(readFileSync(eventPath, "utf8"));
  const pr = event.pull_request;
  if (!pr) fail("Not a pull_request event.");
  const repo = event.repository?.full_name;
  if (!repo) fail("repository.full_name missing from event payload.");
  const prNumber = pr.number;
  const repoUrl = event.repository?.html_url ?? `https://github.com/${repo}`;

  const baseSha = pr.base.sha as string;
  const headSha = pr.head.sha as string;
  ensureCommit(baseSha);
  ensureCommit(headSha);

  // Changed files between the two SHAs (any file, then filter by glob).
  const changedRaw = git(["diff", "--name-only", "-z", baseSha, headSha], {
    maxBuffer: 16 * 1024 * 1024,
  });
  const changed = changedRaw.split("\0").filter(Boolean);
  const re = globToRegExp(glob);
  const changedSql = changed.filter((p) => re.test(p.replace(/\\/g, "/")));
  if (changedSql.length === 0) {
    setOutput("changed", "false");
    info("No migration files changed — nothing to do.");
    return;
  }
  setOutput("changed", "true");

  const baseFiles = listTree(baseSha).filter((p) => re.test(p.replace(/\\/g, "/")));
  const headFiles = listTree(headSha).filter((p) => re.test(p.replace(/\\/g, "/")));

  const baseSet = new Set(baseFiles);
  const headSet = new Set(headFiles);
  const added = headFiles.filter((p) => !baseSet.has(p));
  const removed = baseFiles.filter((p) => !headSet.has(p));
  const modified = headFiles.filter((p) => {
    if (!baseSet.has(p)) return false;
    return showFile(baseSha, p) !== showFile(headSha, p);
  });

  const baseMap = new Map<string, string>();
  const headMap = new Map<string, string>();
  for (const p of baseFiles) {
    const c = showFile(baseSha, p);
    if (c !== null) baseMap.set(p, c);
  }
  for (const p of headFiles) {
    const c = showFile(headSha, p);
    if (c !== null) headMap.set(p, c);
  }

  const comment = renderComment({
    baseSha,
    headSha,
    stats: { added, modified, removed },
    base: parseFileMap(baseMap),
    head: parseFileMap(headMap),
    repoUrl,
  });

  // Sticky comment: reuse ours if present.
  const perPage = 100;
  const first = await api<GhComment[]>(
    token, "GET",
    `https://api.github.com/repos/${repo}/issues/${prNumber}/comments?per_page=${perPage}`
  );
  const existing = first.find((c) => (c.body ?? "").includes(COMMENT_MARKER));
  if (existing) {
    await api(token, "PATCH", `https://api.github.com/repos/${repo}/issues/comments/${existing.id}`, {
      body: comment,
    });
    info(`Updated schema-diff comment ${existing.id} on PR #${prNumber}.`);
  } else {
    await api(token, "POST", `https://api.github.com/repos/${repo}/issues/${prNumber}/comments`, {
      body: comment,
    });
    info(`Posted schema-diff comment on PR #${prNumber}.`);
  }
}

main().catch((err) => fail(String(err instanceof Error ? err.stack ?? err.message : err)));
