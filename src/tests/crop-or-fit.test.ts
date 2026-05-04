import { describe, expect, it } from "vitest";
import { computeCropOrFitPlan } from "../imaging/pipeline/crop-or-fit";

describe("computeCropOrFitPlan", () => {
  it("center crops wide input to the requested aspect ratio", () => {
    const plan = computeCropOrFitPlan(
      { width: 1920, height: 1080 },
      { width: 640, height: 480 },
      "center-crop",
    );

    expect(plan.source.x).toBeCloseTo(240);
    expect(plan.source.y).toBe(0);
    expect(plan.source.width).toBeCloseTo(1440);
    expect(plan.source.height).toBe(1080);
    expect(plan.destination.width).toBe(640);
    expect(plan.destination.height).toBe(480);
    expect(plan.fillsTargetCanvas).toBe(true);
  });

  it("fits the full source inside the target canvas", () => {
    const plan = computeCropOrFitPlan(
      { width: 1920, height: 1080 },
      { width: 640, height: 480 },
      "fit-inside",
    );

    expect(plan.source.width).toBe(1920);
    expect(plan.destination.width).toBeCloseTo(640);
    expect(plan.destination.height).toBeCloseTo(360);
    expect(plan.destination.y).toBeCloseTo(60);
    expect(plan.fillsTargetCanvas).toBe(false);
  });

  it("fills the target while preserving the source aspect ratio", () => {
    const plan = computeCropOrFitPlan(
      { width: 1920, height: 1080 },
      { width: 640, height: 480 },
      "fill",
    );

    expect(plan.source.width).toBe(1920);
    expect(plan.destination.width).toBeCloseTo(853.333, 2);
    expect(plan.destination.x).toBeCloseTo(-106.667, 2);
    expect(plan.destination.height).toBe(480);
    expect(plan.fillsTargetCanvas).toBe(true);
  });
});
