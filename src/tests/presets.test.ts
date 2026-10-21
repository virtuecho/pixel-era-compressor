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
  "nokia-3660",
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

  it("keeps one phone per year and one compact camera", () => {
    const phones = cameraPresets.filter(
      (preset) => preset.category === "phone",
    );
    const compactCameras = cameraPresets.filter(
      (preset) => preset.category === "compact-camera",
    );

    expect(new Set(phones.map((preset) => preset.year)).size).toBe(
      phones.length,
    );
    expect(compactCameras).toHaveLength(1);
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

  it("gives each physical camera an explicit noise response profile", () => {
    const physicalCameras = cameraPresets.filter(
      (preset) => preset.category !== "web-preset",
    );

    for (const preset of physicalCameras) {
      expect(preset.sensor.midtoneNoiseFloor).toBeDefined();
      expect(preset.sensor.detailNoiseSuppression).toBeDefined();
      expect(preset.sensor.midtoneNoiseFloor).toBeGreaterThanOrEqual(0);
      expect(preset.sensor.midtoneNoiseFloor).toBeLessThanOrEqual(1);
      expect(preset.sensor.detailNoiseSuppression).toBeGreaterThanOrEqual(0);
      expect(preset.sensor.detailNoiseSuppression).toBeLessThanOrEqual(0.9);
    }

    const iphone3gs = physicalCameras.find(
      (preset) => preset.id === "iphone-3gs",
    );

    expect(iphone3gs?.sensor).toMatchObject({
      lumaNoise: 0.16,
      chromaNoise: 0.04,
      midtoneNoiseFloor: 0.76,
      noiseCorrelation: 0.28,
      detailNoiseSuppression: 0.78,
    });
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
