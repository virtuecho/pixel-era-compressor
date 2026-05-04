import { readFileSync } from "node:fs";

const messagePath = process.argv.at(2);

if (messagePath === undefined) {
  console.error("Commit message path was not provided.");
  process.exit(1);
}

const firstLine = readFileSync(messagePath, "utf8").split(/\r?\n/u)[0] ?? "";
const conventionalHeader =
  /^(feat|fix|refactor|perf|style|test|docs|build|ops|chore)(?:\([a-z0-9-]+\))?!?: [a-z].*[^.]$/u;
const allowedGitGeneratedHeader =
  /^(?:Merge branch '.+'|Merge pull request #\d+ from .+|Revert ".+")$/u;

if (
  conventionalHeader.test(firstLine) ||
  allowedGitGeneratedHeader.test(firstLine)
) {
  process.exit(0);
}

console.error(
  "Commit message must use the documented Conventional Commit form.",
);
console.error("Examples: chore: init, feat(presets): add iphone 3gs profile");
process.exit(1);
