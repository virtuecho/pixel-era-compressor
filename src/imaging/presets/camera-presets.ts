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
      lumaNoise: 0.75,
      chromaNoise: 0.45,
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
      chromaSubsampling: "4:2:0",
    },
    special: {
      flashStyle: "none",
      ccdLook: true,
      portraitTinyMode: true,
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
      lumaNoise: 0.72,
      chromaNoise: 0.42,
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
      chromaSubsampling: "4:2:0",
    },
    special: {
      flashStyle: "none",
      ccdLook: true,
      portraitTinyMode: true,
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
      lumaNoise: 0.4,
      chromaNoise: 0.22,
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
      chromaSubsampling: "4:2:0",
    },
    special: {
      flashStyle: "led",
      ccdLook: false,
    },
  },
  {
    id: "motorola-zn5",
    label: "Motorola ZN5",
    year: 2008,
    category: "phone",
    nativeWidth: 2560,
    nativeHeight: 1920,
    aspectRatio: "4:3",
    optical: {
      blurPx: 0.35,
      edgeSoftness: 0.28,
      vignette: 0.032,
      chromaticAberration: 0.035,
    },
    sensor: {
      lumaNoise: 0.35,
      chromaNoise: 0.18,
      dynamicRangeLoss: 0.3,
      highlightClip: 0.22,
      shadowCrush: 0.24,
    },
    color: {
      saturationBias: 0.08,
      contrastBias: 0.06,
      warmthBias: 0.015,
      greenMagentaBias: -0.005,
    },
    isp: {
      sharpenHalo: 0.25,
      denoiseStrength: 0.2,
      jpegQuality: 58,
      chromaSubsampling: "4:2:0",
    },
    special: {
      flashStyle: "xenon",
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
      lumaNoise: 0.28,
      chromaNoise: 0.14,
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
      chromaSubsampling: "4:2:0",
    },
    special: {
      flashStyle: "xenon",
    },
  },
  {
    id: "nokia-n86-8mp",
    label: "Nokia N86 8MP",
    year: 2009,
    category: "phone",
    nativeWidth: 3264,
    nativeHeight: 2448,
    aspectRatio: "4:3",
    optical: {
      blurPx: 0.26,
      edgeSoftness: 0.2,
      vignette: 0.03,
      chromaticAberration: 0.03,
    },
    sensor: {
      lumaNoise: 0.3,
      chromaNoise: 0.15,
      dynamicRangeLoss: 0.27,
      highlightClip: 0.17,
      shadowCrush: 0.21,
    },
    color: {
      saturationBias: 0.02,
      contrastBias: 0.05,
      warmthBias: 0.008,
      greenMagentaBias: 0,
    },
    isp: {
      sharpenHalo: 0.18,
      denoiseStrength: 0.2,
      jpegQuality: 66,
      chromaSubsampling: "4:2:0",
    },
    special: {
      flashStyle: "led",
      wideAngleLook: true,
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
      blurPx: 0.52,
      edgeSoftness: 0.42,
      vignette: 0.025,
      chromaticAberration: 0.035,
    },
    sensor: {
      lumaNoise: 0.35,
      chromaNoise: 0.18,
      dynamicRangeLoss: 0.35,
      highlightClip: 0.22,
      shadowCrush: 0.28,
    },
    color: {
      saturationBias: -0.02,
      contrastBias: 0.03,
      warmthBias: 0.005,
      greenMagentaBias: 0.005,
    },
    isp: {
      sharpenHalo: 0.1,
      denoiseStrength: 0.14,
      jpegQuality: 52,
      chromaSubsampling: "4:2:0",
    },
    special: {
      flashStyle: "none",
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
      lumaNoise: 0.26,
      chromaNoise: 0.12,
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
      chromaSubsampling: "4:2:0",
    },
    special: {
      flashStyle: "led",
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
      lumaNoise: 0.2,
      chromaNoise: 0.1,
      dynamicRangeLoss: 0.22,
      highlightClip: 0.14,
      shadowCrush: 0.17,
    },
    color: {
      saturationBias: 0.04,
      contrastBias: 0.05,
      warmthBias: 0,
      greenMagentaBias: 0,
    },
    isp: {
      sharpenHalo: 0.16,
      denoiseStrength: 0.18,
      jpegQuality: 70,
      chromaSubsampling: "4:2:0",
    },
    special: {
      flashStyle: "led",
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
      lumaNoise: 0.18,
      chromaNoise: 0.09,
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
      chromaSubsampling: "4:2:0",
    },
    special: {
      flashStyle: "led",
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
      lumaNoise: 0.14,
      chromaNoise: 0.07,
      dynamicRangeLoss: 0.16,
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
      chromaSubsampling: "4:2:0",
    },
    special: {
      flashStyle: "true-tone",
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
      lumaNoise: 0.22,
      chromaNoise: 0.1,
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
      chromaSubsampling: "4:2:2",
    },
    special: {
      flashStyle: "xenon",
      ccdLook: true,
    },
  },
  {
    id: "casio-qv-4000",
    label: "Casio QV-4000",
    year: 2001,
    category: "compact-camera",
    nativeWidth: 2240,
    nativeHeight: 1680,
    aspectRatio: "4:3",
    optical: {
      blurPx: 0.26,
      edgeSoftness: 0.22,
      vignette: 0.032,
      chromaticAberration: 0.024,
    },
    sensor: {
      lumaNoise: 0.24,
      chromaNoise: 0.11,
      dynamicRangeLoss: 0.28,
      highlightClip: 0.18,
      shadowCrush: 0.22,
    },
    color: {
      saturationBias: 0.02,
      contrastBias: 0.04,
      warmthBias: 0.008,
      greenMagentaBias: 0,
    },
    isp: {
      sharpenHalo: 0.1,
      denoiseStrength: 0.13,
      jpegQuality: 76,
      chromaSubsampling: "4:2:2",
    },
    special: {
      flashStyle: "xenon",
      ccdLook: true,
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
      lumaNoise: 0.1,
      chromaNoise: 0.04,
      dynamicRangeLoss: 0.12,
      highlightClip: 0.08,
      shadowCrush: 0.1,
    },
    color: {
      saturationBias: 0.01,
      contrastBias: 0.03,
      warmthBias: 0.006,
      greenMagentaBias: 0,
    },
    isp: {
      sharpenHalo: 0.06,
      denoiseStrength: 0.06,
      jpegQuality: 86,
      chromaSubsampling: "4:2:2",
    },
    special: {
      flashStyle: "xenon",
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
