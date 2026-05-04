import {
  clampChannel,
  createImageFrame,
  pixelOffset,
  type ImageFrame,
} from "./image-frame";

export type SensorNoiseOptions = {
  readonly lumaNoise: number;
  readonly chromaNoise: number;
  readonly intensityScale: number;
  readonly seed: number;
};

// Small integer hash used as a deterministic pseudo-random source per pixel.
// It is cheap, stable across browsers, and avoids storing a noise texture.
function hashUnit(value: number): number {
  let hash = value | 0;
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b);
  hash ^= hash >>> 16;
  return (hash >>> 0) / 0xffffffff;
}

function signedNoise(value: number): number {
  return hashUnit(value) * 2 - 1;
}

/**
 * Adds deterministic luma and chroma noise to imitate small early sensors.
 *
 * The noise is generated from pixel coordinates and a seed instead of global
 * randomness. That keeps presets repeatable in tests and makes preview/export
 * agree for the same source image.
 */
export function applySensorNoise(
  frame: ImageFrame,
  options: SensorNoiseOptions,
): ImageFrame {
  const output = createImageFrame(frame.width, frame.height);
  const lumaAmplitude = options.lumaNoise * options.intensityScale * 24;
  const chromaAmplitude = options.chromaNoise * options.intensityScale * 18;

  for (let y = 0; y < frame.height; y += 1) {
    for (let x = 0; x < frame.width; x += 1) {
      const offset = pixelOffset(frame.width, x, y);
      // Mix coordinates with the preset year seed so each device keeps a stable
      // but distinct grain pattern.
      const pixelSeed = (y * frame.width + x + 1) * 131 + options.seed * 17;
      const luma = signedNoise(pixelSeed) * lumaAmplitude;
      const chromaR = signedNoise(pixelSeed + 19) * chromaAmplitude;
      const chromaG = signedNoise(pixelSeed + 37) * chromaAmplitude * 0.72;
      const chromaB = signedNoise(pixelSeed + 53) * chromaAmplitude;

      output.data[offset] = clampChannel(frame.data[offset] + luma + chromaR);
      output.data[offset + 1] = clampChannel(
        frame.data[offset + 1] + luma + chromaG,
      );
      output.data[offset + 2] = clampChannel(
        frame.data[offset + 2] + luma + chromaB,
      );
      output.data[offset + 3] = frame.data[offset + 3];
    }
  }

  return output;
}
