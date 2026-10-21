import type { CameraPreset } from "./preset-types";
import { webPresets } from "./web-presets";

// Device presets are ordered roughly by category and era in data, then sorted
// again in the picker. The numeric profiles feed the pipeline directly.
const devicePresets = [
  {
    id: "nokia-7650",
    label: "Nokia 7650",
    year: 2002,
    category: "phone",
    nativeWidth: 640,
    nativeHeight: 480,
    aspectRatio: "4:3",
    optical: {
      blurPx: 0.95,
      edgeSoftness: 0.8,
      vignette: 0.05,
      chromaticAberration: 0.08,
    },
    sensor: {
      // VGA originals are soft and low in detail; retain texture mainly in
      // shadows instead of laying heavy grain across every midtone.
      lumaNoise: 0.45,
      chromaNoise: 0.24,
      midtoneNoiseFloor: 0.38,
      detailNoiseSuppression: 0.04,
      dynamicRangeLoss: 0.55,
      highlightClip: 0.42,
      shadowCrush: 0.48,
    },
    color: {
      saturationBias: -0.1,
      contrastBias: -0.06,
      warmthBias: 0.02,
      greenMagentaBias: 0.02,
    },
    isp: {
      sharpenHalo: 0.05,
      denoiseStrength: 0.08,
      jpegQuality: 34,
    },
  },
  {
    id: "nokia-3660",
    label: "Nokia 3660",
    year: 2003,
    category: "phone",
    nativeWidth: 640,
    nativeHeight: 480,
    aspectRatio: "4:3",
    optical: {
      blurPx: 0.9,
      edgeSoftness: 0.76,
      vignette: 0.045,
      chromaticAberration: 0.07,
    },
    sensor: {
      // The 3660 keeps the same VGA ceiling, with a restrained sensor-noise
      // floor and little detail masking to avoid inventing a modern ISP.
      lumaNoise: 0.42,
      chromaNoise: 0.22,
      midtoneNoiseFloor: 0.42,
      detailNoiseSuppression: 0.06,
      dynamicRangeLoss: 0.52,
      highlightClip: 0.4,
      shadowCrush: 0.45,
    },
    color: {
      saturationBias: -0.08,
      contrastBias: -0.05,
      warmthBias: 0.015,
      greenMagentaBias: 0.015,
    },
    isp: {
      sharpenHalo: 0.05,
      denoiseStrength: 0.08,
      jpegQuality: 36,
    },
  },
  {
    id: "nokia-n95",
    label: "Nokia N95",
    year: 2007,
    category: "phone",
    nativeWidth: 2592,
    nativeHeight: 1944,
    aspectRatio: "4:3",
    optical: {
      blurPx: 0.45,
      edgeSoftness: 0.36,
      vignette: 0.035,
      chromaticAberration: 0.045,
    },
    sensor: {
      // Original N95 samples show aggressive edge enhancement alongside
      // noise reduction; preserve some grain but keep it off fine edges.
      lumaNoise: 0.34,
      chromaNoise: 0.16,
      midtoneNoiseFloor: 0.5,
      detailNoiseSuppression: 0.18,
      dynamicRangeLoss: 0.35,
      highlightClip: 0.24,
      shadowCrush: 0.28,
    },
    color: {
      saturationBias: 0.03,
      contrastBias: 0.05,
      warmthBias: 0.01,
      greenMagentaBias: 0,
    },
    isp: {
      sharpenHalo: 0.2,
      denoiseStrength: 0.18,
      jpegQuality: 56,
    },
  },
  {
    id: "sony-ericsson-c905",
    label: "Sony Ericsson C905",
    year: 2008,
    category: "phone",
    nativeWidth: 3264,
    nativeHeight: 2448,
    aspectRatio: "4:3",
    optical: {
      blurPx: 0.28,
      edgeSoftness: 0.22,
      vignette: 0.028,
      chromaticAberration: 0.028,
    },
    sensor: {
      // Full-size C905 samples are relatively clean in ordinary daylight;
      // use modest noise with moderate detail-aware suppression.
      lumaNoise: 0.2,
      chromaNoise: 0.08,
      midtoneNoiseFloor: 0.48,
      detailNoiseSuppression: 0.22,
      dynamicRangeLoss: 0.28,
      highlightClip: 0.18,
      shadowCrush: 0.22,
    },
    color: {
      saturationBias: 0.05,
      contrastBias: 0.06,
      warmthBias: 0.005,
      greenMagentaBias: -0.005,
    },
    isp: {
      sharpenHalo: 0.2,
      denoiseStrength: 0.22,
      jpegQuality: 64,
    },
  },
  {
    id: "iphone-3gs",
    label: "iPhone 3GS",
    year: 2009,
    category: "phone",
    nativeWidth: 2048,
    nativeHeight: 1536,
    aspectRatio: "4:3",
    optical: {
      blurPx: 0.3,
      edgeSoftness: 0.2,
      vignette: 0.025,
      chromaticAberration: 0.035,
    },
    sensor: {
      lumaNoise: 0.16,
      chromaNoise: 0.04,
      midtoneNoiseFloor: 0.76,
      noiseCorrelation: 0.28,
      detailNoiseSuppression: 0.78,
      dynamicRangeLoss: 0.18,
      highlightClip: 0.22,
      clipHighlightsToWhite: true,
      shadowCrush: 0.36,
    },
    color: {
      saturationBias: 0.04,
      contrastBias: 0.07,
      warmthBias: 0.012,
      greenMagentaBias: 0.005,
    },
    isp: {
      sharpenHalo: 0.16,
      denoiseStrength: 0.08,
      jpegQuality: 68,
    },
  },
  {
    id: "iphone-4",
    label: "iPhone 4",
    year: 2010,
    category: "phone",
    nativeWidth: 2592,
    nativeHeight: 1936,
    aspectRatio: "4:3",
    optical: {
      blurPx: 0.34,
      edgeSoftness: 0.27,
      vignette: 0.02,
      chromaticAberration: 0.025,
    },
    sensor: {
      // Same-scene reviews show finer, cleaner luminance grain than the 3GS,
      // with little chroma noise; keep the profile mostly luminance-led.
      lumaNoise: 0.14,
      chromaNoise: 0.045,
      midtoneNoiseFloor: 0.5,
      detailNoiseSuppression: 0.24,
      dynamicRangeLoss: 0.25,
      highlightClip: 0.16,
      shadowCrush: 0.2,
    },
    color: {
      saturationBias: 0.02,
      contrastBias: 0.05,
      warmthBias: 0.002,
      greenMagentaBias: 0,
    },
    isp: {
      sharpenHalo: 0.18,
      denoiseStrength: 0.18,
      jpegQuality: 62,
    },
  },
  {
    id: "iphone-4s",
    label: "iPhone 4S",
    year: 2011,
    category: "phone",
    nativeWidth: 3264,
    nativeHeight: 2448,
    aspectRatio: "4:3",
    optical: {
      blurPx: 0.24,
      edgeSoftness: 0.2,
      vignette: 0.018,
      chromaticAberration: 0.02,
    },
    sensor: {
      // Reviews show wider usable range than the iPhone 4 and reduced color
      // noise, while low-light detail still receives noticeable smoothing.
      lumaNoise: 0.12,
      chromaNoise: 0.05,
      midtoneNoiseFloor: 0.46,
      detailNoiseSuppression: 0.4,
      dynamicRangeLoss: 0.16,
      highlightClip: 0.12,
      shadowCrush: 0.12,
    },
    color: {
      saturationBias: 0.02,
      contrastBias: 0.03,
      warmthBias: 0,
      greenMagentaBias: 0,
    },
    isp: {
      sharpenHalo: 0.16,
      denoiseStrength: 0.18,
      jpegQuality: 70,
    },
  },
  {
    id: "iphone-5",
    label: "iPhone 5",
    year: 2012,
    category: "phone",
    nativeWidth: 3264,
    nativeHeight: 2448,
    aspectRatio: "4:3",
    optical: {
      blurPx: 0.22,
      edgeSoftness: 0.18,
      vignette: 0.016,
      chromaticAberration: 0.018,
    },
    sensor: {
      // The iPhone 5 applies stronger low-light noise reduction than the 4S;
      // texture in focused detail should stay cleaner than flat dark areas.
      lumaNoise: 0.11,
      chromaNoise: 0.04,
      midtoneNoiseFloor: 0.4,
      detailNoiseSuppression: 0.58,
      dynamicRangeLoss: 0.2,
      highlightClip: 0.12,
      shadowCrush: 0.15,
    },
    color: {
      saturationBias: 0.04,
      contrastBias: 0.05,
      warmthBias: 0,
      greenMagentaBias: 0,
    },
    isp: {
      sharpenHalo: 0.14,
      denoiseStrength: 0.18,
      jpegQuality: 72,
    },
  },
  {
    id: "iphone-5s",
    label: "iPhone 5s",
    year: 2013,
    category: "phone",
    nativeWidth: 3264,
    nativeHeight: 2448,
    aspectRatio: "4:3",
    optical: {
      blurPx: 0.18,
      edgeSoftness: 0.16,
      vignette: 0.014,
      chromaticAberration: 0.015,
    },
    sensor: {
      // The 5s preserves luminance texture in skies and shadows instead of
      // heavily smoothing it; its improved sensitivity allows less noise.
      lumaNoise: 0.1,
      chromaNoise: 0.03,
      midtoneNoiseFloor: 0.64,
      detailNoiseSuppression: 0.05,
      dynamicRangeLoss: 0.18,
      highlightClip: 0.1,
      shadowCrush: 0.12,
    },
    color: {
      saturationBias: 0.03,
      contrastBias: 0.04,
      warmthBias: 0,
      greenMagentaBias: 0,
    },
    isp: {
      sharpenHalo: 0.12,
      denoiseStrength: 0.16,
      jpegQuality: 76,
    },
  },
  {
    id: "canon-powershot-g1",
    label: "Canon PowerShot G1",
    year: 2000,
    category: "compact-camera",
    nativeWidth: 2048,
    nativeHeight: 1536,
    aspectRatio: "4:3",
    optical: {
      blurPx: 0.3,
      edgeSoftness: 0.24,
      vignette: 0.03,
      chromaticAberration: 0.025,
    },
    sensor: {
      // G1 samples show long-exposure dark-frame subtraction; that is tied to
      // shutter time, so this general profile stays clean without fake hot
      // pixels and limits noise mainly in detail-bearing areas.
      lumaNoise: 0.18,
      chromaNoise: 0.07,
      midtoneNoiseFloor: 0.46,
      detailNoiseSuppression: 0.12,
      dynamicRangeLoss: 0.26,
      highlightClip: 0.17,
      shadowCrush: 0.2,
    },
    color: {
      saturationBias: -0.03,
      contrastBias: 0.03,
      warmthBias: 0.01,
      greenMagentaBias: 0,
    },
    isp: {
      sharpenHalo: 0.08,
      denoiseStrength: 0.12,
      jpegQuality: 78,
    },
  },
  {
    id: "canon-eos-300d",
    label: "Canon EOS 300D / Digital Rebel",
    year: 2003,
    category: "dslr",
    nativeWidth: 3072,
    nativeHeight: 2048,
    aspectRatio: "3:2",
    optical: {
      blurPx: 0.12,
      edgeSoftness: 0.1,
      vignette: 0.02,
      chromaticAberration: 0.014,
    },
    sensor: {
      // The larger CMOS DSLR sensor is quieter; its default Parameter 1 JPEG
      // is modeled through stronger contrast, saturation, and sharpening.
      lumaNoise: 0.08,
      chromaNoise: 0.03,
      midtoneNoiseFloor: 0.3,
      detailNoiseSuppression: 0.02,
      dynamicRangeLoss: 0.12,
      highlightClip: 0.08,
      shadowCrush: 0.1,
    },
    color: {
      saturationBias: 0.06,
      contrastBias: 0.07,
      warmthBias: 0.006,
      greenMagentaBias: 0,
    },
    isp: {
      sharpenHalo: 0.1,
      denoiseStrength: 0.06,
      jpegQuality: 86,
    },
  },
] as const satisfies readonly CameraPreset[];

export const cameraPresets = [
  ...webPresets,
  ...devicePresets,
] as const satisfies readonly CameraPreset[];

export type CameraPresetId = (typeof cameraPresets)[number]["id"];

// Lookup by stable preset ID. UI and worker code both use IDs rather than array
// positions so sorting cannot change behavior.
export function findCameraPreset(id: string): CameraPreset | undefined {
  return cameraPresets.find((preset) => preset.id === id);
}

// The product's first-run default is an early iPhone look, with a safe fallback
// for tests or future preset edits.
export function getDefaultCameraPreset(): CameraPreset {
  return findCameraPreset("iphone-3gs") ?? cameraPresets[0];
}

// Era sorting keeps devices from being ordered alphabetically inside categories;
// model labels are only tie-breakers within the same year.
export function compareCameraPresetsByEra(
  left: CameraPreset,
  right: CameraPreset,
): number {
  return (
    left.year - right.year ||
    left.label.localeCompare(right.label) ||
    left.id.localeCompare(right.id)
  );
}

export function sortCameraPresetsByEra(
  presets: readonly CameraPreset[],
): CameraPreset[] {
  return [...presets].sort(compareCameraPresetsByEra);
}
