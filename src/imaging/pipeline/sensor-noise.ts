import {
  clampChannel,
  createImageFrame,
  pixelOffset,
  type ImageFrame,
} from "./image-frame";

export type SensorNoiseOptions = {
  readonly lumaNoise: number;
  readonly chromaNoise: number;
  readonly noiseCorrelation?: number;
  readonly detailNoiseSuppression?: number;
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

function localDetailStrength(frame: ImageFrame, x: number, y: number): number {
  let minimumLuma = 255;
  let maximumLuma = 0;
  let minimumRed = 255;
  let maximumRed = 0;
  let minimumGreen = 255;
  let maximumGreen = 0;
  let minimumBlue = 255;
  let maximumBlue = 0;

  // Measure detail from the clean, pre-noise image so the added grain cannot
  // raise its own suppression mask. Clamping the window keeps edge pixels safe.
  for (
    let sampleY = Math.max(0, y - 1);
    sampleY <= Math.min(frame.height - 1, y + 1);
    sampleY += 1
  ) {
    for (
      let sampleX = Math.max(0, x - 1);
      sampleX <= Math.min(frame.width - 1, x + 1);
      sampleX += 1
    ) {
      const sampleOffset = pixelOffset(frame.width, sampleX, sampleY);
      const red = frame.data[sampleOffset];
      const green = frame.data[sampleOffset + 1];
      const blue = frame.data[sampleOffset + 2];
      const luma = red * 0.299 + green * 0.587 + blue * 0.114;

      minimumLuma = Math.min(minimumLuma, luma);
      maximumLuma = Math.max(maximumLuma, luma);
      minimumRed = Math.min(minimumRed, red);
      maximumRed = Math.max(maximumRed, red);
      minimumGreen = Math.min(minimumGreen, green);
      maximumGreen = Math.max(maximumGreen, green);
      minimumBlue = Math.min(minimumBlue, blue);
      maximumBlue = Math.max(maximumBlue, blue);
    }
  }

  // A channel range also detects colored detail whose luminance barely changes.
  const channelRange = Math.max(
    maximumRed - minimumRed,
    maximumGreen - minimumGreen,
    maximumBlue - minimumBlue,
  );
  const detailRange = Math.max(maximumLuma - minimumLuma, channelRange * 0.6);

  return smoothstep(5, 28, detailRange);
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
 * Some device profiles also suppress added noise around existing local detail,
 * approximating the detail-preserving denoising of an early camera ISP.
 */
export function applySensorNoise(
  frame: ImageFrame,
  options: SensorNoiseOptions,
): ImageFrame {
  const output = createImageFrame(frame.width, frame.height);
  const lumaAmplitude = options.lumaNoise * 24;
  const chromaAmplitude = options.chromaNoise * 18;
  const noiseCorrelation = Math.min(
    0.5,
    Math.max(0, options.noiseCorrelation ?? 0),
  );
  const detailNoiseSuppression = Math.min(
    0.9,
    Math.max(0, options.detailNoiseSuppression ?? 0),
  );

  for (let y = 0; y < frame.height; y += 1) {
    for (let x = 0; x < frame.width; x += 1) {
      const offset = pixelOffset(frame.width, x, y);
      // Mix coordinates with the preset year seed so each device keeps a stable
      // but distinct digital noise texture.
      const pixelSeed = (y * frame.width + x + 1) * 131 + options.seed * 17;
      let lumaTexture = signedNoise(pixelSeed);

      if (noiseCorrelation > 0) {
        // Small sensors and demosaicing create some neighboring-pixel
        // correlation. Keep a fine-grain component so the result does not turn
        // into visible blocks or a blur pass.
        const neighborNoise =
          (signedNoise(pixelSeed - 131) +
            signedNoise(pixelSeed + 131) +
            signedNoise(pixelSeed - frame.width * 131) +
            signedNoise(pixelSeed + frame.width * 131)) /
          4;
        const noiseNormalization =
          1 /
          Math.sqrt((1 - noiseCorrelation) ** 2 + noiseCorrelation ** 2 / 4);
        lumaTexture =
          (lumaTexture * (1 - noiseCorrelation) +
            neighborNoise * noiseCorrelation) *
          noiseNormalization;
      }

      const weights = toneNoiseWeights(
        relativeLuma(
          frame.data[offset],
          frame.data[offset + 1],
          frame.data[offset + 2],
        ),
      );
      const detailStrength =
        detailNoiseSuppression > 0 ? localDetailStrength(frame, x, y) : 0;
      const detailWeight = 1 - detailNoiseSuppression * detailStrength;
      const luma = lumaTexture * lumaAmplitude * weights.luma * detailWeight;
      const chromaR =
        signedNoise(pixelSeed + 19) *
        chromaAmplitude *
        weights.chroma *
        detailWeight;
      const chromaG =
        signedNoise(pixelSeed + 37) *
        chromaAmplitude *
        weights.chroma *
        detailWeight *
        0.72;
      const chromaB =
        signedNoise(pixelSeed + 53) *
        chromaAmplitude *
        weights.chroma *
        detailWeight;

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
