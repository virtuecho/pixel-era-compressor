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
    try {
      const { heicTo } = await import("heic-to/next");
      return await heicTo({ blob: input, type: "bitmap" });
    } catch (error) {
      throw new Error(
        `Unable to decode HEIC/HEIF image: ${formatErrorMessage(error)}`,
      );
    }
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

function formatErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
