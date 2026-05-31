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

function relativeLuma(red: number, green: number, blue: number): number {
  return (red * 0.299 + green * 0.587 + blue * 0.114) / 255;
}

function smoothstep(edgeStart: number, edgeEnd: number, value: number): number {
  const normalized = Math.min(
    1,
    Math.max(0, (value - edgeStart) / (edgeEnd - edgeStart)),
  );

  return normalized * normalized * (3 - 2 * normalized);
}

function midtonePresence(normalizedLuma: number): number {
  return 1 - Math.min(1, Math.abs(normalizedLuma - 0.42) / 0.42);
}

function toneNoiseWeights(normalizedLuma: number): {
  readonly luma: number;
  readonly chroma: number;
} {
  const shadowPressure = 1 - smoothstep(0.1, 0.46, normalizedLuma);
  const midtoneTexture = 0.76 + midtonePresence(normalizedLuma) * 0.24;
  const highlightCleanliness =
    1 - smoothstep(0.66, 0.98, normalizedLuma) * 0.84;

  return {
    luma: (1 + shadowPressure * 0.52) * midtoneTexture * highlightCleanliness,
    chroma: (1 + shadowPressure * 0.95) * midtoneTexture * highlightCleanliness,
  };
}

/**
 * Adds deterministic luma and chroma noise to imitate small early sensors.
 *
 * The noise is generated from pixel coordinates and a seed instead of global
 * randomness. That keeps presets repeatable in tests and makes preview/export
 * agree for the same source image.
 *
 * Early digital sensors showed tone-dependent noise: shadows and low midtones
 * had the weakest signal-to-noise ratio and exposed more luma and chroma
 * texture, while bright and clipped regions were cleaner.
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
      // but distinct digital noise texture.
      const pixelSeed = (y * frame.width + x + 1) * 131 + options.seed * 17;
      const weights = toneNoiseWeights(
        relativeLuma(
          frame.data[offset],
          frame.data[offset + 1],
          frame.data[offset + 2],
        ),
      );
      const luma = signedNoise(pixelSeed) * lumaAmplitude * weights.luma;
      const chromaR =
        signedNoise(pixelSeed + 19) * chromaAmplitude * weights.chroma;
      const chromaG =
        signedNoise(pixelSeed + 37) * chromaAmplitude * weights.chroma * 0.72;
      const chromaB =
        signedNoise(pixelSeed + 53) * chromaAmplitude * weights.chroma;

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
