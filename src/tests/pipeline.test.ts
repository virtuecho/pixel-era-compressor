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
      intensityScale: 1,
    });

    expectValidChannels(output);
  });

  it("keeps sensor noise deterministic and bounded", () => {
    const first = applySensorNoise(sampleFrame(), {
      lumaNoise: 0.75,
      chromaNoise: 0.45,
      intensityScale: 1,
      seed: 2002,
    });
    const second = applySensorNoise(sampleFrame(), {
      lumaNoise: 0.75,
      chromaNoise: 0.45,
      intensityScale: 1,
      seed: 2002,
    });

    expect(first.data).toEqual(second.data);
    expectValidChannels(first);
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
      intensityScale: 1,
    });

    expectValidChannels(output);
  });

  it("keeps device ISP output within valid channel bounds", () => {
    const output = applyDeviceIspSignature(sampleFrame(), {
      sharpenHalo: 0.2,
      denoiseStrength: 0.18,
      vignette: 0.05,
      chromaticAberration: 0.08,
      intensityScale: 1,
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
      intensity: "normal",
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
