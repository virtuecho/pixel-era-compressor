# Architecture

## 1. Overview

Pixel Era Compressor is a browser-first TypeScript application for simulating 2000–2013 digital photo compression.

The architecture separates:

- UI
- preset data
- image-processing pipeline
- codecs/export
- workers
- tests
- documentation

The image-processing code must remain deterministic and testable.

---

## 2. Recommended stack

- TypeScript with `strict: true`
- pnpm
- Vite
- React or another TS-first UI framework
- Canvas / OffscreenCanvas
- Web Worker for expensive image processing
- Vitest
- Playwright when UI testing is introduced
- ESLint
- Prettier
- markdownlint-cli2
- Husky
- lint-staged
- GitHub Actions

---

## 3. Directory structure

```text
src/
├── app/
│   ├── App.tsx
│   └── main.tsx
├── components/
│   ├── PresetPicker.tsx
│   ├── ImageUploader.tsx
│   ├── BeforeAfterPreview.tsx
│   └── ExportPanel.tsx
├── imaging/
│   ├── presets/
│   │   ├── camera-presets.ts
│   │   ├── web-presets.ts
│   │   └── preset-types.ts
│   ├── pipeline/
│   │   ├── crop-or-fit.ts
│   │   ├── resize.ts
│   │   ├── optical-softness.ts
│   │   ├── sensor-noise.ts
│   │   ├── tone-curve.ts
│   │   ├── device-isp.ts
│   │   └── image-pipeline.ts
│   ├── codecs/
│   │   └── jpeg-export.ts
│   └── workers/
│       ├── image-worker.ts
│       └── worker-protocol.ts
├── lib/
│   ├── assert-never.ts
│   └── result.ts
└── tests/
    ├── presets.test.ts
    ├── crop-or-fit.test.ts
    └── pipeline.test.ts
```

---

## 4. Public API patterns

### 4.1 Preset model

All presets are data. Avoid encoding device assumptions directly inside UI components.

```ts
export type CameraPreset = {
  readonly id: string;
  readonly label: string;
  readonly year: number;
  readonly category: "web-preset" | "phone" | "compact-camera" | "dslr";
  readonly nativeWidth: number;
  readonly nativeHeight: number;
  readonly aspectRatio: "4:3" | "3:2";
  readonly optical: OpticalProfile;
  readonly sensor: SensorProfile;
  readonly color: ColorProfile;
  readonly isp: IspProfile;
  readonly special?: SpecialProfile;
};
```

### 4.2 Pipeline model

The image pipeline should be composed from named steps.

```ts
export async function processImage(
  input: Blob,
  preset: CameraPreset,
  options: ProcessImageOptions,
): Promise<ProcessedImage>;
```

### 4.3 Result model

Prefer explicit result objects for operations that can fail.

```ts
export type Result<T, E extends Error = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
```

---

## 5. Image-processing pipeline

Required order:

```text
decode
-> crop or fit
-> high-quality resize
-> optical softness
-> sensor noise
-> tone curve
-> color shift
-> device ISP
-> JPEG export
```

Do not move JPEG export earlier in the pipeline.

---

## 6. Testing strategy

Unit tests should cover:

- preset dimensions
- aspect ratios
- crop behavior
- noise functions staying within valid channel ranges
- tone curve output staying within 0–255
- pipeline returns expected metadata
- JPEG export returns a Blob with `image/jpeg`

Integration tests should cover:

- upload -> process -> preview
- preset change updates output dimensions
- export produces a downloadable file

---

## 7. Architecture constraints

These constraints should be enforced by CI or scripts:

1. No `.js` files in `src/`, except explicitly allowlisted build config edge cases.
2. No `npm` or `yarn` lockfiles.
3. `pnpm-lock.yaml` must exist.
4. `tsconfig.json` must keep `strict: true`.
5. Preset IDs must be unique.
6. Preset files must not import React/UI modules.
7. UI components must not directly implement pixel-level image processing.
8. Agents must not add C or C++ source files.
9. Rust is allowed only under a documented `wasm/` or `crates/` directory.

---

## 8. Performance guidance

- Use Web Workers for large images.
- Avoid blocking the main thread during processing.
- Prefer streaming/progressive user feedback for heavy operations.
- Avoid repeated full-image copies when possible.
- Benchmark before adding WASM complexity.

---

## 9. Comments and documentation

Every pipeline step must include:

- what the step simulates
- why it exists historically
- what parameters control it
- what visual artifacts are expected
- what failure looks like

Example comment style:

```ts
/**
 * Applies a very small Gaussian-like softness after high-quality downscaling.
 *
 * This is not a blur filter for aesthetics. It exists to avoid modern hard
 * stair-step edges and to imitate the limited optical resolving power of
 * early camera phones and compact digital cameras.
 */
```
