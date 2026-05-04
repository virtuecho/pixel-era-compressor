// ImageFrame is the pipeline's explicit RGBA pixel buffer. Browser APIs provide
// ImageBitmap and ImageData, but the processing steps use this small shape so
// tests can build deterministic frames without a DOM.
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

  // Fail early on malformed buffers; most pixel math assumes exact RGBA length
  // and would otherwise produce hard-to-read downstream errors.
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

// Clone before no-op or low-strength branches so callers can treat processing
// steps as pure transformations.
export function cloneImageFrame(frame: ImageFrame): ImageFrame {
  return createImageFrame(
    frame.width,
    frame.height,
    new Uint8ClampedArray(frame.data),
  );
}

// Pixel operations can overshoot through contrast, sharpening, or noise. Clamp
// every channel back into byte space before writing the final frame.
export function clampChannel(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(255, Math.max(0, Math.round(value)));
}

// Convert 2D pixel coordinates into the flat RGBA buffer offset.
export function pixelOffset(width: number, x: number, y: number): number {
  return (y * width + x) * 4;
}

// Edge sampling uses clamped coordinates so blur, denoise, and channel shifts do
// not need separate border branches.
export function clampCoordinate(value: number, maxInclusive: number): number {
  return Math.min(maxInclusive, Math.max(0, value));
}
