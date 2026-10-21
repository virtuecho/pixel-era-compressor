import { describe, expect, it } from "vitest";
import { exportFrameAsJpeg } from "../imaging/codecs/jpeg-export";
import { findCameraPreset } from "../imaging/presets/camera-presets";
import { applyDeviceIspSignature } from "../imaging/pipeline/device-isp";
import {
  createImageFrame,
  type ImageFrame,
} from "../imaging/pipeline/image-frame";
import {
  processPreparedFrame,
  resolveOrientedOutputSize,
} from "../imaging/pipeline/image-pipeline";
import { applyOpticalSoftness } from "../imaging/pipeline/optical-softness";
import { applySensorNoise } from "../imaging/pipeline/sensor-noise";
import { applyToneCurve } from "../imaging/pipeline/tone-curve";

// Tiny deterministic frame used to test pixel transformations without relying
// on browser decoders, fixture files, or canvas rendering.
function sampleFrame(): ImageFrame {
  return createImageFrame(
    3,
    3,
    new Uint8ClampedArray([
      0, 8, 16, 255, 32, 40, 48, 255, 64, 72, 80, 255, 96, 104, 112, 255, 128,
      136, 144, 255, 160, 168, 176, 255, 192, 200, 208, 255, 224, 232, 240, 255,
      250, 252, 254, 255,
    ]),
  );
}

function flatGrayFrame(
  width: number,
  height: number,
  grayLevel = 128,
): ImageFrame {
  const data = new Uint8ClampedArray(width * height * 4);

  for (let offset = 0; offset < data.length; offset += 4) {
    data[offset] = grayLevel;
    data[offset + 1] = grayLevel;
    data[offset + 2] = grayLevel;
    data[offset + 3] = 255;
  }

  return createImageFrame(width, height, data);
}

function shadowAndTextureFrame(width: number, height: number): ImageFrame {
  const data = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const isTexturedPatch = x >= 2 && x < width / 2 - 2;
      const value = isTexturedPatch && (x + y) % 2 === 0 ? 84 : 52;

      data[offset] = isTexturedPatch ? value : 68;
      data[offset + 1] = isTexturedPatch ? value : 68;
      data[offset + 2] = isTexturedPatch ? value : 68;
      data[offset + 3] = 255;
    }
  }

  return createImageFrame(width, height, data);
}

function averageRedNoise(
  frame: ImageFrame,
  xStart: number,
  xEnd: number,
): number {
  let totalNoise = 0;
  let sampleCount = 0;

  for (let y = 2; y < frame.height - 2; y += 1) {
    for (let x = xStart; x < xEnd; x += 1) {
      const offset = (y * frame.width + x) * 4;
      const expected = x < frame.width / 2 ? ((x + y) % 2 === 0 ? 84 : 52) : 68;

      totalNoise += Math.abs(frame.data[offset] - expected);
      sampleCount += 1;
    }
  }

  return totalNoise / sampleCount;
}

function horizontalNoiseVariation(frame: ImageFrame): number {
  let variation = 0;

  for (let y = 0; y < frame.height; y += 1) {
    for (let x = 1; x < frame.width; x += 1) {
      const current = (y * frame.width + x) * 4;
      const previous = (y * frame.width + x - 1) * 4;
      variation += Math.abs(frame.data[current] - frame.data[previous]);
    }
  }

  return variation;
}

// Most pipeline tests care that math stays in valid RGBA byte space. Exact
// image aesthetics are preset-tuning concerns rather than unit-test fixtures.
function expectValidChannels(frame: ImageFrame): void {
  expect(frame.data).toHaveLength(frame.width * frame.height * 4);

  for (const value of frame.data) {
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(255);
  }
}

// Pipeline tests cover each public step and the composed metadata contract used
// by the worker.
describe("pipeline steps", () => {
  it("keeps optical softness output within valid channel bounds", () => {
    const output = applyOpticalSoftness(sampleFrame(), {
      blurPx: 0.8,
      edgeSoftness: 0.7,
    });

    expectValidChannels(output);
  });

  it("keeps sensor noise deterministic and bounded", () => {
    const first = applySensorNoise(sampleFrame(), {
      lumaNoise: 0.75,
      chromaNoise: 0.45,
      seed: 2002,
    });
    const second = applySensorNoise(sampleFrame(), {
      lumaNoise: 0.75,
      chromaNoise: 0.45,
      seed: 2002,
    });

    expect(first.data).toEqual(second.data);
    expectValidChannels(first);
  });

  it("adds subtle spatial correlation to the 3GS luminance texture", () => {
    const frame = flatGrayFrame(24, 24);
    const baseOptions = {
      lumaNoise: 0.42,
      chromaNoise: 0.12,
      seed: 2009,
    } as const;
    const uncorrelated = applySensorNoise(frame, {
      ...baseOptions,
      noiseCorrelation: 0,
    });
    const correlated = applySensorNoise(frame, {
      ...baseOptions,
      noiseCorrelation: 0.28,
    });

    expect(horizontalNoiseVariation(correlated)).toBeLessThan(
      horizontalNoiseVariation(uncorrelated),
    );
  });

  it("keeps 3GS noise restrained on evenly lit surfaces", () => {
    const preset = findCameraPreset("iphone-3gs");

    if (!preset) {
      throw new Error("The iPhone 3GS preset must be available for this test.");
    }

    const frame = flatGrayFrame(48, 48, 200);
    const output = applySensorNoise(frame, {
      lumaNoise: preset.sensor.lumaNoise,
      chromaNoise: preset.sensor.chromaNoise,
      noiseCorrelation: preset.sensor.noiseCorrelation,
      detailNoiseSuppression: preset.sensor.detailNoiseSuppression,
      seed: preset.year,
    });
    let totalRedNoise = 0;

    for (let offset = 0; offset < output.data.length; offset += 4) {
      totalRedNoise += Math.abs(output.data[offset] - frame.data[offset]);
    }

    expect(totalRedNoise / (frame.width * frame.height)).toBeLessThan(1.3);
  });

  it("reduces 3GS noise on local detail while preserving smooth shadow noise", () => {
    const frame = shadowAndTextureFrame(32, 16);
    const baseOptions = {
      lumaNoise: 0.42,
      chromaNoise: 0.12,
      noiseCorrelation: 0.28,
      seed: 2009,
    } as const;
    const uniform = applySensorNoise(frame, baseOptions);
    const detailAware = applySensorNoise(frame, {
      ...baseOptions,
      detailNoiseSuppression: 0.78,
    });

    expect(averageRedNoise(detailAware, 2, 14)).toBeLessThan(
      averageRedNoise(uniform, 2, 14),
    );
    expect(averageRedNoise(detailAware, 18, 30)).toBeCloseTo(
      averageRedNoise(uniform, 18, 30),
      8,
    );
  });

  it("keeps tone curve output within valid channel bounds", () => {
    const output = applyToneCurve(sampleFrame(), {
      dynamicRangeLoss: 0.55,
      highlightClip: 0.42,
      shadowCrush: 0.48,
      saturationBias: -0.1,
      contrastBias: -0.06,
      warmthBias: 0.02,
      greenMagentaBias: 0.02,
    });

    expectValidChannels(output);
  });

  it("keeps device ISP output within valid channel bounds", () => {
    const output = applyDeviceIspSignature(sampleFrame(), {
      sharpenHalo: 0.2,
      denoiseStrength: 0.18,
      vignette: 0.05,
      chromaticAberration: 0.08,
    });

    expectValidChannels(output);
  });

  it("returns expected metadata from the composed frame pipeline", () => {
    const preset = findCameraPreset("nokia-7650");

    expect(preset).toBeDefined();

    if (preset === undefined) {
      throw new Error("Missing nokia-7650 preset.");
    }

    const processed = processPreparedFrame(sampleFrame(), preset, {
      cropMode: "center-crop",
      seed: 2002,
    });

    expect(processed.presetId).toBe("nokia-7650");
    expect(processed.jpegQuality).toBe(34);
    expect(processed.steps).toEqual([
      "decode",
      "crop-or-fit",
      "high-quality-resize",
      "optical-softness",
      "sensor-noise",
      "tone-curve",
      "device-isp",
      "jpeg-export",
    ]);
    expectValidChannels(processed.frame);
  });

  it("clips 3GS highlights to white in the composed pipeline", () => {
    const preset = findCameraPreset("iphone-3gs");

    expect(preset).toBeDefined();

    if (preset === undefined) {
      throw new Error("Missing iphone-3gs preset.");
    }

    const frame = createImageFrame(
      1,
      1,
      new Uint8ClampedArray([240, 240, 240, 255]),
    );
    const processed = processPreparedFrame(frame, preset, {
      cropMode: "center-crop",
      seed: 2009,
    });

    expect([...processed.frame.data.slice(0, 3)]).toEqual([255, 255, 255]);
  });

  it("matches preset dimensions to the decoded image orientation", () => {
    const landscapePresetSize = { width: 4, height: 3 } as const;
    const portraitOutput = resolveOrientedOutputSize(
      { width: 3, height: 4 },
      landscapePresetSize,
    );
    const landscapeOutput = resolveOrientedOutputSize(
      { width: 4, height: 3 },
      landscapePresetSize,
    );

    expect(portraitOutput.height).toBeGreaterThan(portraitOutput.width);
    expect(landscapeOutput.width).toBeGreaterThan(landscapeOutput.height);
    expect([portraitOutput.width, portraitOutput.height].sort()).toEqual(
      [landscapePresetSize.width, landscapePresetSize.height].sort(),
    );
    expect(landscapeOutput).toEqual(landscapePresetSize);
  });

  it("exports a JPEG blob", async () => {
    const blob = await exportFrameAsJpeg(sampleFrame(), { quality: 70 });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("image/jpeg");
  });
});
