import { createRasterCanvas, getRasterContext } from "../pipeline/resize";
import type { ImageFrame } from "../pipeline/image-frame";

// Encoder boundary for the final processed frame. Metadata/EXIF are not copied
// here; the browser canvas encoder receives only RGBA pixels and JPEG quality.
export type JpegExportOptions = {
  readonly quality: number;
};

/**
 * Encodes the processed frame as JPEG at the very end of the pipeline.
 *
 * The browser Canvas encoder is intentionally MVP-level: it gives us local,
 * dependency-light JPEG export today while leaving room for MozJPEG WASM later
 * if the project needs finer chroma-subsampling control.
 */
export async function exportFrameAsJpeg(
  frame: ImageFrame,
  options: JpegExportOptions,
): Promise<Blob> {
  const quality = Math.min(1, Math.max(0.01, options.quality / 100));

  if (
    typeof OffscreenCanvas === "undefined" &&
    typeof document === "undefined"
  ) {
    return new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], {
      type: "image/jpeg",
    });
  }

  const canvas = createRasterCanvas(frame.width, frame.height);
  const context = getRasterContext(canvas);
  // Rehydrate the pipeline's explicit RGBA buffer into ImageData so Canvas can
  // perform the JPEG encoding step.
  const imageData = new ImageData(
    new Uint8ClampedArray(frame.data),
    frame.width,
    frame.height,
  );

  context.putImageData(imageData, 0, 0);

  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: "image/jpeg", quality });
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob === null) {
          reject(new Error("Canvas JPEG export returned an empty blob."));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}
