# AGENTS.md

This file is the navigation map for coding agents working on **pixel-era-compressor**.

The project simulates 2000–2013 digital photo compression and early camera-device image quality.

Agents must treat this repository as a documentation-as-code project: product rules, engineering rules, prompt templates, tests, linting, and CI are all part of the system.

---

## 1. Non-negotiable rules

1. Do not push to any remote.
   - Agents may create commits locally when asked.
   - Agents must never run `git push`.
   - Human maintainers push manually.

2. Use `pnpm`.
   - Do not use npm or yarn for install, scripts, lockfiles, or examples.
   - Keep `pnpm-lock.yaml` committed.

3. Use TypeScript for JavaScript-related work.
   - Do not write plain JavaScript unless explicitly required for tool config compatibility.
   - Enable `strict: true` in `tsconfig.json`.
   - Prefer explicit types for public APIs, presets, and processing pipeline functions.

4. Use Rust when a systems language would otherwise be C or C++.
   - Do not introduce C/C++ image-processing code.
   - Rust modules must include tests and safe interfaces.
   - WASM-facing Rust must expose typed, documented boundaries.

5. Keep commits small.
   - One logical change per commit.
   - Avoid mixing product docs, formatting, implementation, and tests in one large commit.
   - Use Conventional Commits only.

6. Code comments must be generous and useful.
   - Explain non-obvious imaging math, color transforms, compression decisions, and historical-device assumptions.
   - Do not write comments that merely repeat the code.

7. The output image must look like old digital photography.
   - Low pixels are required.
   - Visible hard jagged edges are a bug.
   - Use high-quality downscaling, soft optical degradation, sensor noise, dynamic-range loss, and JPEG artifacts in the correct order.

---

## 2. Source of truth

Use these documents before editing code:

- `docs/product/PRODUCT_SPEC.md`
  - Product goals, user-facing behavior, device presets, acceptance criteria.

- `docs/engineering/ARCHITECTURE.md`
  - Directory structure, processing pipeline, module boundaries, API patterns.

- `docs/engineering/COMMIT_CONVENTION.md`
  - Required Conventional Commit format and examples.

- `docs/engineering/CI_AND_HOOKS.md`
  - Required CI gates, pre-commit hooks, linting, formatting, and tests.

- `docs/engineering/AI_CODE_REVIEW_CHECKLIST.md`
  - Review checklist for AI-generated code.

- `docs/prompts/AGENT_TASK_TEMPLATE.md`
  - Standard task prompt template for humans instructing agents.

- `docs/prompts/CODE_REVIEW_PROMPT.md`
  - Standard code review prompt template.

When a rule in this file conflicts with a more detailed document, follow the detailed document and update this file only if the navigation map becomes misleading.

---

## 3. Project identity

Repository name:

```text
pixel-era-compressor
```

Project title:

```text
Pixel Era Compressor
```

One-line description:

```text
A 2000–2013 digital photo compression simulator for early web images, camera phones, compact digital cameras, and pre-computational iPhone-era photography.
```

Project focus:

```text
Technical image degradation from 2000–2013 digital imaging.
```

The project centers on early digital capture, early web sharing, camera-device
constraints, sensor noise, dynamic-range loss, color response, optics, ISP
behavior, and JPEG export.

---

## 4. Preferred stack

Default frontend stack:

- TypeScript
- pnpm
- Vite
- React or another explicitly chosen TS-first UI framework
- Canvas / OffscreenCanvas
- Web Workers for heavy image processing
- Vitest for unit tests
- Playwright for browser-level tests when UI is introduced
- ESLint
- Prettier
- markdownlint-cli2
- Husky + lint-staged for local hooks
- GitHub Actions for CI

Image-processing helpers may include:

- `pica` for high-quality resizing
- Canvas `toBlob("image/jpeg", quality)` for MVP JPEG export
- WASM MozJPEG later if stronger JPEG control is required

Rust is allowed for future WASM processing, but do not add Rust until there is a clear need.

---

## 5. Expected directory structure

Recommended structure:

```text
.
├── AGENTS.md
├── README.md
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── eslint.config.ts
├── prettier.config.cjs
├── docs/
│   ├── product/
│   │   └── PRODUCT_SPEC.md
│   ├── engineering/
│   │   ├── ARCHITECTURE.md
│   │   ├── COMMIT_CONVENTION.md
│   │   ├── CI_AND_HOOKS.md
│   │   └── AI_CODE_REVIEW_CHECKLIST.md
│   └── prompts/
│       ├── AGENT_TASK_TEMPLATE.md
│       └── CODE_REVIEW_PROMPT.md
├── src/
│   ├── app/
│   ├── components/
│   ├── imaging/
│   │   ├── presets/
│   │   ├── pipeline/
│   │   ├── codecs/
│   │   └── workers/
│   ├── lib/
│   └── tests/
├── scripts/
└── .github/
    └── workflows/
        └── ci.yml
```

Maintain this structure unless there is a documented architectural decision.

---

## 6. Naming conventions

Use kebab-case for files:

```text
camera-presets.ts
image-pipeline.ts
jpeg-export.ts
```

Use PascalCase for React components:

```text
PresetPicker.tsx
BeforeAfterPreview.tsx
```

Use camelCase for functions and variables:

```ts
applySensorNoise();
resizeToNativeResolution();
```

Use PascalCase for public types:

```ts
CameraPreset;
ImagePipelineStep;
CompressionProfile;
```

Use stable preset IDs in kebab-case:

```text
nokia-7650
iphone-5s
canon-eos-300d
old-web-640
```

---

## 7. API patterns

Public imaging functions should be pure when possible:

```ts
export function applyToneCurve(
  imageData: ImageData,
  options: ToneCurveOptions,
): ImageData;
```

Avoid hidden global state in imaging code.

Device presets must be data-driven:

```ts
export const cameraPresets: readonly CameraPreset[] = [...]
```

The image pipeline should be composable:

```ts
input
  -> cropOrFitToAspectRatio
  -> resizeToNativeResolution
  -> applyOpticalSoftness
  -> applySensorNoise
  -> applyToneCurve
  -> applyDeviceIspSignature
  -> encodeJpeg
```

All public pipeline steps require tests.

---

## 8. Commit rules

Use Conventional Commits:

```text
<type>(<optional scope>): <description>
```

Allowed types:

- `feat`
- `fix`
- `refactor`
- `perf`
- `style`
- `test`
- `docs`
- `build`
- `ops`
- `chore`

Examples:

```text
chore: init
docs(product): add camera preset specification
feat(presets): add iphone 3gs and nokia n95 profiles
test(imaging): cover aspect-ratio crop behavior
build(ci): add markdown and type checks
```

Descriptions must:

- Use imperative present tense.
- Start lowercase.
- Not end with a period.

Breaking changes require `!` and a `BREAKING CHANGE:` footer.

---

## 9. Required checks before committing

Run:

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm docs:lint
pnpm arch:check
```

If any command fails, fix it before committing.

---

## 10. Agent workflow

For each task:

1. Read relevant docs first.
2. Inspect the current repo state.
3. Plan small, reviewable changes.
4. Modify files.
5. Run checks.
6. Create small commits only when asked.
7. Summarize:
   - files changed
   - tests run
   - known limitations
   - next recommended step

Do not push.

---

## 11. When uncertain

For tasks asking for an "old photo look", anchor the interpretation to this
repository's 2000–2013 digital-photo style and ask for clarification when the
requested era or device model is unclear.
