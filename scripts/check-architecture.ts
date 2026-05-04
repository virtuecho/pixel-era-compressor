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

function relativePath(absolutePath: string): string {
  return relative(rootDir, absolutePath).split(sep).join("/");
}

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
const cFamilyFiles = files
  .map(relativePath)
  .filter((path) => cFamilyExtensions.has(extname(path)));

for (const path of cFamilyFiles) {
  failures.push(`C/C++ source is forbidden; use Rust if needed: ${path}`);
}

const presetIds = new Set<string>();
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
