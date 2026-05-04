export type ImageFrame = {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8ClampedArray;
};

export function createImageFrame(
  width: number,
  height: number,
  data?: Uint8ClampedArray,
): ImageFrame {
  const expectedLength = width * height * 4;

  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    throw new Error("Image frame dimensions must be whole pixels.");
  }

  if (width <= 0 || height <= 0) {
    throw new Error("Image frame dimensions must be positive.");
  }

  if (data !== undefined && data.length !== expectedLength) {
    throw new Error(
      `Image frame data length ${String(data.length)} did not match ${String(
        expectedLength,
      )}.`,
    );
  }

  return {
    width,
    height,
    data: data ?? new Uint8ClampedArray(expectedLength),
  };
}

export function cloneImageFrame(frame: ImageFrame): ImageFrame {
  return createImageFrame(
    frame.width,
    frame.height,
    new Uint8ClampedArray(frame.data),
  );
}

export function clampChannel(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(255, Math.max(0, Math.round(value)));
}

export function pixelOffset(width: number, x: number, y: number): number {
  return (y * width + x) * 4;
}

export function clampCoordinate(value: number, maxInclusive: number): number {
  return Math.min(maxInclusive, Math.max(0, value));
}
