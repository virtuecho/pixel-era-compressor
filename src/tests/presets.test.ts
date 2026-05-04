import { describe, expect, it } from "vitest";
import {
  cameraPresets,
  sortCameraPresetsByEra,
} from "../imaging/presets/camera-presets";
import { aspectRatioValue } from "../imaging/presets/preset-types";

// A small required set keeps the MVP product surface from accidentally dropping
// important web, phone, compact-camera, or DSLR presets.
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

// Preset tests validate structural integrity, not exact visual taste. Individual
// values can evolve as long as IDs, dimensions, and ordering stay sane.
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

  it("sorts visible presets by era within every category", () => {
    const categories = new Set(cameraPresets.map((preset) => preset.category));

    for (const category of categories) {
      const sortedPresets = sortCameraPresetsByEra(
        cameraPresets.filter((preset) => preset.category === category),
      );

      for (let index = 1; index < sortedPresets.length; index += 1) {
        expect(sortedPresets[index - 1].year).toBeLessThanOrEqual(
          sortedPresets[index].year,
        );
      }
    }
  });
});
