// Test/CLI entry: render the PR comment from two directories.
// Usage: node dist/cli.js <baseDir> <headDir> [--glob "<glob>"] [--base-sha X --head-sha Y]
import {
  collectSqlFiles,
  readFiles,
  parseFileMap,
  renderComment,
} from "./core";

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const baseDir = process.argv[2];
const headDir = process.argv[3];
if (!baseDir || !headDir) {
  console.error("Usage: cli <baseDir> <headDir> [--glob G] [--base-sha S] [--head-sha S]");
  process.exit(2);
}

const glob = arg("--glob", "**/migrations/**/*.sql");
const baseSha = arg("--base-sha", "base");
const headSha = arg("--head-sha", "head");

const basePaths = collectSqlFiles(baseDir, glob);
const headPaths = collectSqlFiles(headDir, glob);

if (basePaths.length === 0 && headPaths.length === 0) {
  console.error(`No files matched glob: ${glob}`);
  process.exit(3);
}

const baseSet = new Set(basePaths);
const headSet = new Set(headPaths);
const added = headPaths.filter((p) => !baseSet.has(p));
const removed = basePaths.filter((p) => !headSet.has(p));
const modified = headPaths.filter(
  (p) => baseSet.has(p) && readFiles(baseDir, [p]).get(p) !== readFiles(headDir, [p]).get(p)
);

const comment = renderComment({
  baseSha,
  headSha,
  stats: { added, modified, removed },
  base: parseFileMap(readFiles(baseDir, basePaths)),
  head: parseFileMap(readFiles(headDir, headPaths)),
  repoUrl: arg("--repo-url", ""),
});

process.stdout.write(comment + "\n");
