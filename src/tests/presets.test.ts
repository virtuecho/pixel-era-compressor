import { describe, expect, it } from "vitest";
import { cameraPresets } from "../imaging/presets/camera-presets";
import { aspectRatioValue } from "../imaging/presets/preset-types";

const requiredPresetIds = [
  "old-web-640",
  "old-blog-800",
  "early-mobile-upload-1024",
  "nokia-7650",
  "nokia-n95",
  "iphone-3gs",
  "iphone-4",
  "iphone-5s",
  "canon-powershot-g1",
  "canon-eos-300d",
] as const;

describe("camera presets", () => {
  it("contains the MVP preset set", () => {
    const ids = new Set(cameraPresets.map((preset) => preset.id));

    for (const requiredId of requiredPresetIds) {
      expect(ids.has(requiredId)).toBe(true);
    }
  });

  it("uses unique stable IDs", () => {
    const ids = cameraPresets.map((preset) => preset.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps dimensions and aspect ratios plausible", () => {
    for (const preset of cameraPresets) {
      const actualRatio = preset.nativeWidth / preset.nativeHeight;
      const expectedRatio = aspectRatioValue(preset.aspectRatio);

      expect(preset.nativeWidth).toBeGreaterThan(0);
      expect(preset.nativeHeight).toBeGreaterThan(0);
      expect(Math.abs(actualRatio - expectedRatio)).toBeLessThan(0.02);
      expect(preset.isp.jpegQuality).toBeGreaterThanOrEqual(1);
      expect(preset.isp.jpegQuality).toBeLessThanOrEqual(100);
    }
  });
});
