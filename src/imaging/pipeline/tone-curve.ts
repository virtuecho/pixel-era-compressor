import {
  clampChannel,
  createImageFrame,
  pixelOffset,
  type ImageFrame,
} from "./image-frame";

export type ToneCurveOptions = {
  readonly dynamicRangeLoss: number;
  readonly highlightClip: number;
  readonly shadowCrush: number;
  readonly saturationBias: number;
  readonly contrastBias: number;
  readonly warmthBias: number;
  readonly greenMagentaBias: number;
  readonly intensityScale: number;
};

function crushShadow(
  value: number,
  threshold: number,
  strength: number,
): number {
  if (value >= threshold) {
    return value;
  }

  const normalized = value / Math.max(1, threshold);
  return value * (1 - strength * (1 - normalized));
}

/**
 * Reduces dynamic range and applies mild color drift after noise is present.
 *
 * Early small-sensor JPEGs often clipped bright areas, lost shadow separation,
 * and carried unstable white balance. This step models those limits without
 * turning the output into a stylized film or VHS effect.
 */
export function applyToneCurve(
  frame: ImageFrame,
  options: ToneCurveOptions,
): ImageFrame {
  const output = createImageFrame(frame.width, frame.height);
  const dynamicRangeScale =
    1 -
    Math.min(0.42, options.dynamicRangeLoss * options.intensityScale * 0.36);
  const highlightCeiling =
    255 - Math.min(52, options.highlightClip * options.intensityScale * 58);
  const shadowThreshold = Math.min(
    92,
    options.shadowCrush * options.intensityScale * 96,
  );
  const shadowStrength = Math.min(
    0.62,
    options.shadowCrush * options.intensityScale * 0.76,
  );
  const contrast = 1 + options.contrastBias * options.intensityScale;
  const saturation = Math.max(
    0,
    1 + options.saturationBias * options.intensityScale,
  );
  const warmth = options.warmthBias * options.intensityScale * 28;
  const greenMagenta = options.greenMagentaBias * options.intensityScale * 34;

  for (let y = 0; y < frame.height; y += 1) {
    for (let x = 0; x < frame.width; x += 1) {
      const offset = pixelOffset(frame.width, x, y);
      const red = transformChannel(
        frame.data[offset],
        highlightCeiling,
        shadowThreshold,
        shadowStrength,
        contrast,
        dynamicRangeScale,
      );
      const green = transformChannel(
        frame.data[offset + 1],
        highlightCeiling,
        shadowThreshold,
        shadowStrength,
        contrast,
        dynamicRangeScale,
      );
      const blue = transformChannel(
        frame.data[offset + 2],
        highlightCeiling,
        shadowThreshold,
        shadowStrength,
        contrast,
        dynamicRangeScale,
      );
      const luma = red * 0.299 + green * 0.587 + blue * 0.114;

      output.data[offset] = clampChannel(
        luma + (red - luma) * saturation + warmth - greenMagenta * 0.5,
      );
      output.data[offset + 1] = clampChannel(
        luma + (green - luma) * saturation + greenMagenta,
      );
      output.data[offset + 2] = clampChannel(
        luma + (blue - luma) * saturation - warmth - greenMagenta * 0.5,
      );
      output.data[offset + 3] = frame.data[offset + 3];
    }
  }

  return output;
}

function transformChannel(
  value: number,
  highlightCeiling: number,
  shadowThreshold: number,
  shadowStrength: number,
  contrast: number,
  dynamicRangeScale: number,
): number {
  const clipped = Math.min(highlightCeiling, value);
  const crushed = crushShadow(clipped, shadowThreshold, shadowStrength);
  const contrasted = (crushed - 128) * contrast + 128;
  return (contrasted - 128) * dynamicRangeScale + 128;
}
