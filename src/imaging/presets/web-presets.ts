import type { CameraPreset } from "./preset-types";

// Web presets model the resize-and-share targets that existed alongside camera
// devices: old display sizes, blog uploads, and early mobile upload ceilings.
export const webPresets = [
  {
    id: "old-web-640",
    label: "Old Web Display",
    year: 2001,
    category: "web-preset",
    nativeWidth: 640,
    nativeHeight: 480,
    aspectRatio: "4:3",
    optical: {
      blurPx: 0.55,
      edgeSoftness: 0.45,
      vignette: 0.02,
      chromaticAberration: 0.02,
    },
    sensor: {
      lumaNoise: 0.28,
      chromaNoise: 0.12,
      dynamicRangeLoss: 0.26,
      highlightClip: 0.18,
      shadowCrush: 0.22,
    },
    color: {
      saturationBias: -0.04,
      contrastBias: 0.02,
      warmthBias: 0.01,
      greenMagentaBias: 0,
    },
    isp: {
      sharpenHalo: 0.08,
      denoiseStrength: 0.1,
      jpegQuality: 48,
      chromaSubsampling: "4:2:0",
    },
    special: {
      flashStyle: "none",
      portraitTinyMode: true,
    },
  },
  {
    id: "old-blog-800",
    label: "Clear Old Blog",
    year: 2005,
    category: "web-preset",
    nativeWidth: 800,
    nativeHeight: 600,
    aspectRatio: "4:3",
    optical: {
      blurPx: 0.42,
      edgeSoftness: 0.34,
      vignette: 0.015,
      chromaticAberration: 0.015,
    },
    sensor: {
      lumaNoise: 0.22,
      chromaNoise: 0.1,
      dynamicRangeLoss: 0.22,
      highlightClip: 0.14,
      shadowCrush: 0.18,
    },
    color: {
      saturationBias: -0.02,
      contrastBias: 0.03,
      warmthBias: 0,
      greenMagentaBias: 0,
    },
    isp: {
      sharpenHalo: 0.1,
      denoiseStrength: 0.1,
      jpegQuality: 58,
      chromaSubsampling: "4:2:0",
    },
    special: {
      flashStyle: "none",
    },
  },
  {
    id: "early-mobile-upload-1024",
    label: "Early Mobile Upload",
    year: 2009,
    category: "web-preset",
    nativeWidth: 1024,
    nativeHeight: 768,
    aspectRatio: "4:3",
    optical: {
      blurPx: 0.36,
      edgeSoftness: 0.28,
      vignette: 0.02,
      chromaticAberration: 0.02,
    },
    sensor: {
      lumaNoise: 0.2,
      chromaNoise: 0.09,
      dynamicRangeLoss: 0.2,
      highlightClip: 0.12,
      shadowCrush: 0.16,
    },
    color: {
      saturationBias: 0,
      contrastBias: 0.04,
      warmthBias: 0.01,
      greenMagentaBias: -0.005,
    },
    isp: {
      sharpenHalo: 0.12,
      denoiseStrength: 0.12,
      jpegQuality: 64,
      chromaSubsampling: "4:2:0",
    },
    special: {
      flashStyle: "none",
    },
  },
] as const satisfies readonly CameraPreset[];
