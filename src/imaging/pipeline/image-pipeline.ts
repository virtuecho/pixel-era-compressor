import type {
  CameraPreset,
  ProcessingIntensity,
} from "../presets/preset-types";
import { intensityScale } from "../presets/preset-types";
import type { CropMode } from "./crop-or-fit";
import { applyDeviceIspSignature } from "./device-isp";
import type { ImageFrame } from "./image-frame";
import { applyOpticalSoftness } from "./optical-softness";
import { decodeImageBlob, renderImageBitmapToFrame } from "./resize";
import { applySensorNoise } from "./sensor-noise";
import { applyToneCurve } from "./tone-curve";

export type ProcessImageOptions = {
  readonly cropMode: CropMode;
  readonly intensity: ProcessingIntensity;
  readonly seed?: number;
};

export type ProcessedImage = {
  readonly frame: ImageFrame;
  readonly presetId: string;
  readonly width: number;
  readonly height: number;
  readonly jpegQuality: number;
  readonly steps: readonly string[];
};

const pipelineSteps = [
  "decode",
  "crop-or-fit",
  "high-quality-resize",
  "optical-softness",
  "sensor-noise",
  "tone-curve",
  "device-isp",
  "jpeg-export",
] as const;

/**
 * Runs the browser image pipeline through the historically important order.
 *
 * JPEG export is intentionally represented as the final metadata step but is
 * performed by the codec module. Keeping it last prevents the common mistake of
 * compressing first and then resizing, which creates modern broken artifacts.
 */
export async function processImage(
  input: Blob,
  preset: CameraPreset,
  options: ProcessImageOptions,
): Promise<ProcessedImage> {
  const image = await decodeImageBlob(input);

  try {
    // Presets store their historical native size in landscape orientation. Swap
    // dimensions for portrait inputs so a portrait source stays portrait.
    const outputSize = resolveOrientedOutputSize(
      { width: image.width, height: image.height },
      { width: preset.nativeWidth, height: preset.nativeHeight },
    );
    const resized = renderImageBitmapToFrame(
      image,
      outputSize.width,
      outputSize.height,
      options.cropMode,
    );
    return processPreparedFrame(resized, preset, options);
  } finally {
    image.close();
  }
}

export function processPreparedFrame(
  frame: ImageFrame,
  preset: CameraPreset,
  options: ProcessImageOptions,
): ProcessedImage {
  const scale = intensityScale[options.intensity];
  // The order follows the product spec: first optical limits, then sensor
  // behavior, then tone/color response, then the in-camera ISP signature.
  const softened = applyOpticalSoftness(frame, {
    blurPx: preset.optical.blurPx,
    edgeSoftness: preset.optical.edgeSoftness,
    intensityScale: scale,
  });
  const noisy = applySensorNoise(softened, {
    lumaNoise: preset.sensor.lumaNoise,
    chromaNoise: preset.sensor.chromaNoise,
    intensityScale: scale,
    seed: options.seed ?? preset.year,
  });
  const toned = applyToneCurve(noisy, {
    dynamicRangeLoss: preset.sensor.dynamicRangeLoss,
    highlightClip: preset.sensor.highlightClip,
    shadowCrush: preset.sensor.shadowCrush,
    saturationBias: preset.color.saturationBias,
    contrastBias: preset.color.contrastBias,
    warmthBias: preset.color.warmthBias,
    greenMagentaBias: preset.color.greenMagentaBias,
    intensityScale: scale,
  });
  const ispFrame = applyDeviceIspSignature(toned, {
    sharpenHalo: preset.isp.sharpenHalo,
    denoiseStrength: preset.isp.denoiseStrength,
    vignette: preset.optical.vignette,
    chromaticAberration: preset.optical.chromaticAberration,
    intensityScale: scale,
  });

  return {
    frame: ispFrame,
    presetId: preset.id,
    width: ispFrame.width,
    height: ispFrame.height,
    jpegQuality: preset.isp.jpegQuality,
    steps: pipelineSteps,
  };
}

export function resolveOrientedOutputSize(
  source: { readonly width: number; readonly height: number },
  presetSize: { readonly width: number; readonly height: number },
): { readonly width: number; readonly height: number } {
  const sourceIsPortrait = source.height > source.width;
  const presetIsPortrait = presetSize.height > presetSize.width;

  if (sourceIsPortrait === presetIsPortrait) {
    return presetSize;
  }

  return {
    width: presetSize.height,
    height: presetSize.width,
  };
}
