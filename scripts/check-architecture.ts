import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";
import { cameraPresets } from "../src/imaging/presets/camera-presets";

type TsConfig = {
  readonly compilerOptions?: {
    readonly strict?: unknown;
  };
};

const rootDir = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  "coverage",
  "dist",
  "node_modules",
]);
const failures: string[] = [];

// Recursively gather repository files while skipping generated or vendored
// directories that should not participate in architecture checks.
function walk(directory: string): string[] {
  const entries = readdirSync(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = join(directory, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      if (!ignoredDirectories.has(entry)) {
        files.push(...walk(absolutePath));
      }
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

// Normalize paths to slash-separated repo-relative strings so checks behave the
// same on macOS, Linux CI, and Windows-like environments.
function relativePath(absolutePath: string): string {
  return relative(rootDir, absolutePath).split(sep).join("/");
}

// Required/forbidden file helpers keep the rule declarations readable below.
function requireFile(path: string, message: string): void {
  if (!existsSync(join(rootDir, path))) {
    failures.push(message);
  }
}

function forbidFile(path: string, message: string): void {
  if (existsSync(join(rootDir, path))) {
    failures.push(message);
  }
}

requireFile("pnpm-lock.yaml", "pnpm-lock.yaml must exist.");
forbidFile("package-lock.json", "package-lock.json is forbidden; use pnpm.");
forbidFile("yarn.lock", "yarn.lock is forbidden; use pnpm.");

// TypeScript strict mode is a project invariant because imaging boundaries and
// preset data depend on narrow, explicit types.
const tsconfigPath = join(rootDir, "tsconfig.json");
if (existsSync(tsconfigPath)) {
  const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf8")) as TsConfig;

  if (tsconfig.compilerOptions?.strict !== true) {
    failures.push('tsconfig.json must keep "strict": true.');
  }
} else {
  failures.push("tsconfig.json must exist.");
}

const files = walk(rootDir);
// Runtime source must stay TypeScript-only under src/.
const jsSourceFiles = files
  .map(relativePath)
  .filter((path) => path.startsWith("src/") && extname(path) === ".js");

for (const path of jsSourceFiles) {
  failures.push(`Plain JavaScript is not allowed under src/: ${path}`);
}

const cFamilyExtensions = new Set([
  ".c",
  ".cc",
  ".cpp",
  ".cxx",
  ".h",
  ".hh",
  ".hpp",
]);
// Native image-processing code should be Rust/WASM if it appears later, never
// C or C++ checked into this project.
const cFamilyFiles = files
  .map(relativePath)
  .filter((path) => cFamilyExtensions.has(extname(path)));

for (const path of cFamilyFiles) {
  failures.push(`C/C++ source is forbidden; use Rust if needed: ${path}`);
}

const presetIds = new Set<string>();
// Preset IDs are public stable values used by UI state, filenames, and worker
// requests, so duplicates are architecture failures.
for (const preset of cameraPresets) {
  if (presetIds.has(preset.id)) {
    failures.push(`Duplicate preset id: ${preset.id}`);
  }

  presetIds.add(preset.id);
}

const imagingFiles = files
  .map(relativePath)
  .filter((path) => path.startsWith("src/imaging/") && path.endsWith(".ts"));

for (const path of imagingFiles) {
  const source = readFileSync(join(rootDir, path), "utf8");

  // Imaging modules must stay UI-agnostic so workers and tests can use them
  // without pulling React or component code into the processing layer.
  if (
    /from\s+["'][^"']*(?:components|app)\//u.test(source) ||
    /from\s+["']react/u.test(source)
  ) {
    failures.push(`Imaging modules must not import UI modules: ${path}`);
  }
}

const componentFiles = files
  .map(relativePath)
  .filter(
    (path) => path.startsWith("src/components/") && path.endsWith(".tsx"),
  );
const pixelStepPattern =
  /imaging\/pipeline\/(?:device-isp|image-frame|optical-softness|resize|sensor-noise|tone-curve)/u;

for (const path of componentFiles) {
  const source = readFileSync(join(rootDir, path), "utf8");

  // Components may call high-level codec/preset helpers, but pixel-level math
  // should remain behind the worker/pipeline boundary.
  if (pixelStepPattern.test(source)) {
    failures.push(`UI components must not import pixel-level steps: ${path}`);
  }
}

if (failures.length > 0) {
  console.error("Architecture check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("Architecture check passed.");
}
