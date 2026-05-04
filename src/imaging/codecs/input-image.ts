const heicMimeTypes = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

const heicBrands = new Set([
  "heic",
  "heix",
  "hevc",
  "hevx",
  "heim",
  "heis",
  "hevm",
  "hevs",
]);

const genericHeifPrimaryBrands = new Set(["mif1", "msf1"]);
const avifBrands = new Set(["avif", "avis"]);
const previewMaxEdgePx = 1600;
const previewJpegQuality = 0.82;

type RasterCanvas = HTMLCanvasElement | OffscreenCanvas;
type RasterContext =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

export const supportedInputImageAccept = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/bmp",
  "image/svg+xml",
  "image/heic",
  "image/heif",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".bmp",
  ".svg",
  ".heic",
  ".heif",
].join(",");

/**
 * Detects HEIC/HEIF containers before browser decode.
 *
 * Chromium-based browsers generally cannot create an ImageBitmap directly from
 * iPhone HEIC files, and MIME types are often empty after drag/drop. Reading the
 * ISO BMFF `ftyp` brands lets the worker route HEIC/HEIF through libheif while
 * leaving AVIF and other browser-native formats on the normal decode path.
 */
export async function isHeicContainerBlob(input: Blob): Promise<boolean> {
  if (heicMimeTypes.has(input.type.toLowerCase())) {
    return true;
  }

  const brands = readIsoBmffBrands(
    new Uint8Array(await input.slice(0, 64).arrayBuffer()),
  );

  if (brands.length === 0 || brands.some((brand) => avifBrands.has(brand))) {
    return false;
  }

  const primaryBrand = brands[0];

  return (
    brands.some((brand) => heicBrands.has(brand)) ||
    genericHeifPrimaryBrands.has(primaryBrand)
  );
}

export async function decodeInputImage(input: Blob): Promise<ImageBitmap> {
  if (await isHeicContainerBlob(input)) {
    return decodeHeicInputImage(input);
  }

  if (typeof createImageBitmap === "undefined") {
    throw new Error("createImageBitmap is not available in this environment.");
  }

  try {
    return await createImageBitmap(input);
  } catch (error) {
    throw new Error(`Unable to decode image: ${formatErrorMessage(error)}`);
  }
}

export async function createDisplayableInputPreviewBlob(
  input: Blob,
): Promise<Blob> {
  if (!(await isHeicContainerBlob(input))) {
    return input;
  }

  let image: ImageBitmap | null = null;

  try {
    image = await decodeHeicInputImage(input);
    return await renderImageBitmapToPreviewBlob(image);
  } catch (error) {
    throw new Error(
      `Unable to create HEIC/HEIF preview: ${formatErrorMessage(error)}`,
    );
  } finally {
    image?.close();
  }
}

export function readIsoBmffBrands(header: Uint8Array): readonly string[] {
  if (header.length < 12 || readAscii(header, 4, 8) !== "ftyp") {
    return [];
  }

  const brands = [readAscii(header, 8, 12)];

  for (let offset = 16; offset + 4 <= header.length; offset += 4) {
    const brand = readAscii(header, offset, offset + 4);

    if (/^[a-zA-Z0-9 ]{4}$/u.test(brand)) {
      brands.push(brand.trim());
    }
  }

  return brands.filter((brand) => brand.length > 0);
}

function readAscii(
  bytes: Uint8Array,
  startInclusive: number,
  endExclusive: number,
): string {
  return String.fromCharCode(...bytes.slice(startInclusive, endExclusive));
}

async function decodeHeicInputImage(input: Blob): Promise<ImageBitmap> {
  try {
    const { heicTo } = await import("heic-to/next");
    return await heicTo({ blob: input, type: "bitmap" });
  } catch (error) {
    throw new Error(
      `Unable to decode HEIC/HEIF image: ${formatErrorMessage(error)}`,
    );
  }
}

/**
 * Builds a lightweight display fallback for browsers that cannot show HEIC.
 * The processing pipeline still receives the untouched input blob.
 */
async function renderImageBitmapToPreviewBlob(
  image: ImageBitmap,
): Promise<Blob> {
  const { width, height } = resolvePreviewSize(image.width, image.height);
  const canvas = createRasterCanvas(width, height);
  const context = getRasterContext(canvas);

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);

  if (isOffscreenRasterCanvas(canvas)) {
    return canvas.convertToBlob({
      type: "image/jpeg",
      quality: previewJpegQuality,
    });
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob: Blob | null) => {
        if (blob === null) {
          reject(new Error("Unable to encode HEIC/HEIF preview."));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      previewJpegQuality,
    );
  });
}

function resolvePreviewSize(
  sourceWidth: number,
  sourceHeight: number,
): { readonly width: number; readonly height: number } {
  const scale = Math.min(
    1,
    previewMaxEdgePx / Math.max(sourceWidth, sourceHeight),
  );

  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale)),
  };
}

function createRasterCanvas(width: number, height: number): RasterCanvas {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }

  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  throw new Error("Canvas preview encoding is not available.");
}

function getRasterContext(canvas: RasterCanvas): RasterContext {
  const context = canvas.getContext("2d");

  if (context === null) {
    throw new Error("Unable to create a 2D canvas context.");
  }

  return context;
}

function isOffscreenRasterCanvas(
  canvas: RasterCanvas,
): canvas is OffscreenCanvas {
  return (
    typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas
  );
}

function formatErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
