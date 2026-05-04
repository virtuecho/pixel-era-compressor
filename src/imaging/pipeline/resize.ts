import { decodeInputImage } from "../codecs/input-image";
import { computeCropOrFitPlan, type CropMode } from "./crop-or-fit";
import { createImageFrame, type ImageFrame } from "./image-frame";

type RasterCanvas = HTMLCanvasElement | OffscreenCanvas;
type RasterContext =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

export function createRasterCanvas(
  width: number,
  height: number,
): RasterCanvas {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }

  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  throw new Error("Canvas is not available in this environment.");
}

export function getRasterContext(canvas: RasterCanvas): RasterContext {
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (context === null) {
    throw new Error("Unable to create a 2D canvas context.");
  }

  return context;
}

/**
 * Decodes browser image input at the start of the pipeline.
 *
 * Decoding stays outside the pixel steps so tests can exercise the historical
 * degradation math with small deterministic frames while the browser uses its
 * native decoders for real JPEG/PNG/WebP files.
 */
export async function decodeImageBlob(input: Blob): Promise<ImageBitmap> {
  return decodeInputImage(input);
}

/**
 * Performs the low-pixel resize using the browser's highest-quality canvas
 * sampler before any noise, tone, or JPEG degradation is introduced.
 */
export function renderImageBitmapToFrame(
  image: ImageBitmap,
  targetWidth: number,
  targetHeight: number,
  cropMode: CropMode,
): ImageFrame {
  const canvas = createRasterCanvas(targetWidth, targetHeight);
  const context = getRasterContext(canvas);
  const plan = computeCropOrFitPlan(
    { width: image.width, height: image.height },
    { width: targetWidth, height: targetHeight },
    cropMode,
  );

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.fillStyle = "rgb(8 8 8)";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.drawImage(
    image,
    plan.source.x,
    plan.source.y,
    plan.source.width,
    plan.source.height,
    plan.destination.x,
    plan.destination.y,
    plan.destination.width,
    plan.destination.height,
  );

  const imageData = context.getImageData(0, 0, targetWidth, targetHeight);
  return createImageFrame(
    imageData.width,
    imageData.height,
    new Uint8ClampedArray(imageData.data),
  );
}
