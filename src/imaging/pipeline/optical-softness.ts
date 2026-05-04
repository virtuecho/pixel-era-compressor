import {
  clampChannel,
  cloneImageFrame,
  createImageFrame,
  pixelOffset,
  type ImageFrame,
} from "./image-frame";

export type OpticalSoftnessOptions = {
  readonly blurPx: number;
  readonly edgeSoftness: number;
  readonly intensityScale: number;
};

/**
 * Applies a subtle Gaussian-like softness after high-quality downscaling.
 *
 * This is not an aesthetic blur pass. It simulates limited lens resolving power
 * from early camera phones and compact digital cameras, and it helps prevent the
 * hard stair-step contours that make an image look like broken modern resize.
 */
export function applyOpticalSoftness(
  frame: ImageFrame,
  options: OpticalSoftnessOptions,
): ImageFrame {
  const blurStrength = Math.min(
    0.88,
    Math.max(
      0,
      (options.blurPx * 0.55 + options.edgeSoftness * 0.35) *
        options.intensityScale,
    ),
  );

  if (blurStrength <= 0.001) {
    return cloneImageFrame(frame);
  }

  const output = createImageFrame(frame.width, frame.height);
  const source = frame.data;
  const target = output.data;

  for (let y = 0; y < frame.height; y += 1) {
    for (let x = 0; x < frame.width; x += 1) {
      const center = pixelOffset(frame.width, x, y);
      const left = pixelOffset(frame.width, Math.max(0, x - 1), y);
      const right = pixelOffset(
        frame.width,
        Math.min(frame.width - 1, x + 1),
        y,
      );
      const top = pixelOffset(frame.width, x, Math.max(0, y - 1));
      const bottom = pixelOffset(
        frame.width,
        x,
        Math.min(frame.height - 1, y + 1),
      );

      for (let channel = 0; channel < 3; channel += 1) {
        const crossAverage =
          (source[left + channel] +
            source[right + channel] +
            source[top + channel] +
            source[bottom + channel]) /
          4;
        target[center + channel] = clampChannel(
          source[center + channel] * (1 - blurStrength) +
            crossAverage * blurStrength,
        );
      }

      target[center + 3] = source[center + 3];
    }
  }

  return output;
}
