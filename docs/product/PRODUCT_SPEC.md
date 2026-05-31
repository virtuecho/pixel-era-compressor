# Pixel Era Compressor Product Specification

## 1. Summary

**Pixel Era Compressor** is a browser-based digital photo compression and degradation tool.

It recreates the look of digital photos from **2000 to 2013**, including:

- early web images
- old blog photos
- early mobile uploads
- Nokia / Sony Ericsson / Motorola camera phone images
- early iPhone photos from iPhone 3GS through iPhone 5s
- early consumer digital cameras
- early DSLR output such as Canon EOS 300D

The product simulates the technical limits of early digital photography.

---

## 2. Product positioning

### Repository name

```text
pixel-era-compressor
```

### Project title

```text
Pixel Era Compressor
```

### English tagline

```text
A 2000–2013 digital photo compression simulator for early web images, camera phones, compact digital cameras, and pre-computational iPhone-era photography.
```

### Chinese tagline

```text
一个用于模拟 2000–2013 年早期网页、拍照手机、消费级数码相机与前计算摄影时代 iPhone 画质的照片压缩工具。
```

---

## 3. User problem

Modern image compressors often emphasize these artifacts:

```text
hard jagged edges
blocky compression
over-sharp contours
obvious modern software artifacts
```

Real old digital photos from the product era usually combined:

```text
low resolution
soft edges
limited detail
visible sensor noise
limited dynamic range
early JPEG artifacts
unstable white balance
device-specific color and sharpening
```

The tool should make photos look as if they were captured or uploaded during the
2000–2013 digital-photo era.

---

## 4. Product goals

1. Provide one-click device and era presets.
2. Preserve historically accurate output dimensions.
3. Avoid visible jagged edges after compression.
4. Simulate realistic old-device imperfections.
5. Export JPEG by default.
6. Process one or more uploaded images with the same selected preset and export
   each result.
7. Provide an installable browser app shell when the browser supports PWA
   installation.
8. Run locally in the browser whenever possible.
9. Provide enough engineering structure for agents to continue development safely.

---

## 5. Product focus

The product centers on:

- 2000–2013 digital capture and upload constraints
- early web and blog JPEG sharing
- phone, compact camera, and early DSLR presets
- historically plausible output sizes and JPEG quality
- sensor noise, dynamic-range loss, color drift, softness, and ISP signatures

---

## 6. Core output presets

### 6.1 Web and upload presets

| Preset ID                  | Label               | Output size | Ratio | Purpose                                      |
| -------------------------- | ------------------- | ----------: | ----: | -------------------------------------------- |
| `old-web-640`              | Old Web Display     |   640 × 480 |   4:3 | early web and forum display image            |
| `old-blog-800`             | Clear Old Blog      |   800 × 600 |   4:3 | clearer blog article image                   |
| `early-mobile-upload-1024` | Early Mobile Upload |  1024 × 768 |   4:3 | early phone or camera upload resized for web |

### 6.2 Phone presets

| Preset ID            | Device             | Year | Output size | Ratio | Main camera notes              |
| -------------------- | ------------------ | ---: | ----------: | ----: | ------------------------------ |
| `nokia-7650`         | Nokia 7650         | 2002 |   640 × 480 |   4:3 | 0.3MP VGA                      |
| `nokia-3660`         | Nokia 3660         | 2003 |   640 × 480 |   4:3 | 0.3MP VGA                      |
| `nokia-n95`          | Nokia N95          | 2007 | 2592 × 1944 |   4:3 | 5MP Carl Zeiss AF              |
| `motorola-zn5`       | Motorola ZN5       | 2008 | 2560 × 1920 |   4:3 | 5MP Kodak imaging, xenon flash |
| `sony-ericsson-c905` | Sony Ericsson C905 | 2008 | 3264 × 2448 |   4:3 | 8.1MP Cyber-shot, xenon flash  |
| `nokia-n86-8mp`      | Nokia N86 8MP      | 2009 | 3264 × 2448 |   4:3 | 8MP Carl Zeiss, 28mm wide lens |
| `iphone-3gs`         | iPhone 3GS         | 2009 | 2048 × 1536 |   4:3 | 3MP still camera               |
| `iphone-4`           | iPhone 4           | 2010 | 2592 × 1936 |  ~4:3 | 5MP still camera               |
| `iphone-4s`          | iPhone 4S          | 2011 | 3264 × 2448 |   4:3 | 8MP camera                     |
| `iphone-5`           | iPhone 5           | 2012 | 3264 × 2448 |   4:3 | 8MP iSight camera              |
| `iphone-5s`          | iPhone 5s          | 2013 | 3264 × 2448 |   4:3 | 8MP, 1.5µm pixels, f/2.2       |

### 6.3 Digital camera presets

| Preset ID            | Device                         | Year | Output size | Ratio | Notes                              |
| -------------------- | ------------------------------ | ---: | ----------: | ----: | ---------------------------------- |
| `canon-powershot-g1` | Canon PowerShot G1             | 2000 | 2048 × 1536 |   4:3 | 3.34MP 1/1.8 inch CCD, RAW support |
| `casio-qv-4000`      | Casio QV-4000                  | 2001 | 2240 × 1680 |   4:3 | 4.1MP compact digital camera       |
| `canon-eos-300d`     | Canon EOS 300D / Digital Rebel | 2003 | 3072 × 2048 |   3:2 | 6.3MP APS-C CMOS DSLR              |

---

## 7. Image-processing philosophy

### 7.1 Required pipeline order

The correct pipeline is:

```text
input image
-> decode
-> crop or fit to target aspect ratio
-> high-quality downscale
-> lens softness simulation
-> tone-aware sensor noise simulation
-> dynamic range degradation
-> color and white-balance shift
-> device-specific ISP signature
-> JPEG encoding
-> export
```

The incorrect pipeline is:

```text
input image
-> rough resize
-> very low JPEG quality
-> export
```

The required pipeline preserves the visual order of old digital photography.

### 7.2 Sensor noise distribution

Sensor noise distribution follows per-pixel tone.

For old digital devices:

- Shadows and low midtones carry the strongest luma and chroma noise because
  small sensors had weak signal-to-noise ratio in low light.
- Midtones remain a visible texture carrier, especially on early phones and
  compact cameras.
- Bright areas are cleaner, and clipped highlights should become comparatively
  smooth.

Preset `lumaNoise` and `chromaNoise` values define the device's base noise
strength. The pipeline derives per-pixel weights from luminance so the same
preset does not add identical noise to shadows, midtones, and highlights.

---

## 8. Anti-jagged-edge requirement

Hard jagged edges are a product bug.

To avoid them:

1. Always use high-quality downscaling.
2. Never use nearest-neighbor scaling by default.
3. Apply subtle optical softness after resize.
4. Avoid excessive sharpening.
5. Preview output at 100% and compare edge regions.
6. Treat visible stair-step contours as a failed result.

---

## 9. Device style model

Each preset should include these categories of parameters:

```ts
type CameraPreset = {
  id: string;
  label: string;
  year: number;
  category: "web-preset" | "phone" | "compact-camera" | "dslr";
  nativeWidth: number;
  nativeHeight: number;
  aspectRatio: "4:3" | "3:2";

  optical: {
    blurPx: number;
    edgeSoftness: number;
    vignette: number;
    chromaticAberration: number;
  };

  sensor: {
    lumaNoise: number;
    chromaNoise: number;
    dynamicRangeLoss: number;
    highlightClip: number;
    shadowCrush: number;
  };

  color: {
    saturationBias: number;
    contrastBias: number;
    warmthBias: number;
    greenMagentaBias: number;
  };

  isp: {
    sharpenHalo: number;
    denoiseStrength: number;
    jpegQuality: number;
    chromaSubsampling: "4:2:0" | "4:2:2";
  };

  special?: {
    flashStyle?: "none" | "led" | "xenon" | "true-tone";
    ccdLook?: boolean;
    wideAngleLook?: boolean;
    portraitTinyMode?: boolean;
  };
};
```

---

## 10. Initial preset parameter table

These are engineering defaults for the first implementation. They are not claimed as manufacturer specifications.

| Preset ID            | Blur px | Luma noise | Chroma noise | DR loss | Saturation bias | Sharpen halo | JPEG Q |
| -------------------- | ------: | ---------: | -----------: | ------: | --------------: | -----------: | -----: |
| `nokia-7650`         |    0.95 |       0.75 |         0.45 |    0.55 |           -0.10 |         0.05 |     34 |
| `nokia-3660`         |    0.90 |       0.72 |         0.42 |    0.52 |           -0.08 |         0.05 |     36 |
| `nokia-n95`          |    0.45 |       0.40 |         0.22 |    0.35 |           +0.03 |         0.20 |     56 |
| `motorola-zn5`       |    0.35 |       0.35 |         0.18 |    0.30 |           +0.08 |         0.25 |     58 |
| `sony-ericsson-c905` |    0.28 |       0.28 |         0.14 |    0.28 |           +0.05 |         0.20 |     64 |
| `nokia-n86-8mp`      |    0.26 |       0.30 |         0.15 |    0.27 |           +0.02 |         0.18 |     66 |
| `iphone-3gs`         |    0.52 |       0.35 |         0.18 |    0.35 |           -0.02 |         0.10 |     52 |
| `iphone-4`           |    0.34 |       0.26 |         0.12 |    0.25 |           +0.02 |         0.18 |     62 |
| `iphone-4s`          |    0.24 |       0.20 |         0.10 |    0.22 |           +0.04 |         0.16 |     70 |
| `iphone-5`           |    0.22 |       0.18 |         0.09 |    0.20 |           +0.04 |         0.14 |     72 |
| `iphone-5s`          |    0.18 |       0.14 |         0.07 |    0.16 |           +0.03 |         0.12 |     76 |
| `canon-powershot-g1` |    0.30 |       0.22 |         0.10 |    0.26 |           -0.03 |         0.08 |     78 |
| `casio-qv-4000`      |    0.26 |       0.24 |         0.11 |    0.28 |           +0.02 |         0.10 |     76 |
| `canon-eos-300d`     |    0.12 |       0.10 |         0.04 |    0.12 |           +0.01 |         0.06 |     86 |

---

## 11. User-facing controls

### 11.1 Required controls

- Upload image
- Choose preset
- Choose intensity:
  - Mild
  - Normal
  - Strong
- Choose crop mode:
  - center crop
  - fit inside
  - fill
- Export JPEG
- Compare before / after

### 11.2 Advanced controls

- Softness
- Luma noise
- Chroma noise
- JPEG quality
- Dynamic range loss
- Highlight clipping
- Shadow crush
- Saturation
- Color temperature
- Vignette
- Device sharpening
- Flash simulation

---

## 12. MVP acceptance criteria

MVP is acceptable when:

1. The app runs with `pnpm dev`.
2. The test suite runs with `pnpm test`.
3. TypeScript strict mode passes with `pnpm typecheck`.
4. Linting passes with `pnpm lint`.
5. Markdown docs pass with `pnpm docs:lint`.
6. At least these presets exist:
   - `old-web-640`
   - `old-blog-800`
   - `early-mobile-upload-1024`
   - `nokia-7650`
   - `nokia-n95`
   - `iphone-3gs`
   - `iphone-4`
   - `iphone-5s`
   - `canon-powershot-g1`
   - `canon-eos-300d`
7. Exported images do not show obvious hard jagged edges.
8. Output looks like low-pixel old digital photography.

---

## 13. Future roadmap

### Phase 1: MVP

- Upload image
- Batch upload and shared-setting conversion
- Preset selection
- High-quality resize
- Softness, tone-aware sensor noise, tone curve
- JPEG export
- Basic tests

### Phase 2: Device fidelity

- Add all device presets
- Add device-specific color signatures
- Add xenon / LED / True Tone flash styles
- Add CCD / CMOS differences

### Phase 3: Advanced export

- WASM MozJPEG
- EXIF simulation
- ZIP archive export for large batches
- Preset JSON import/export

### Phase 4: Documentation and examples

- Add sample images
- Add visual comparison gallery
- Add per-device historical notes
