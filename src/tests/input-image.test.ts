import { describe, expect, it } from "vitest";
import {
  createDisplayableInputPreviewBlob,
  isHeicContainerBlob,
  readIsoBmffBrands,
  supportedInputImageAccept,
} from "../imaging/codecs/input-image";

function createFtypBlob(
  primaryBrand: string,
  compatibleBrands: readonly string[] = [],
  type = "",
): Blob {
  const bytes = new Uint8Array(16 + compatibleBrands.length * 4);
  const boxSize = bytes.length;

  bytes[0] = (boxSize >>> 24) & 0xff;
  bytes[1] = (boxSize >>> 16) & 0xff;
  bytes[2] = (boxSize >>> 8) & 0xff;
  bytes[3] = boxSize & 0xff;
  writeAscii(bytes, 4, "ftyp");
  writeAscii(bytes, 8, primaryBrand);

  for (const [index, brand] of compatibleBrands.entries()) {
    writeAscii(bytes, 16 + index * 4, brand);
  }

  return new Blob([bytes], { type });
}

function writeAscii(bytes: Uint8Array, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    bytes[offset + index] = value.charCodeAt(index);
  }
}

describe("input image decoding", () => {
  it("exposes common image formats plus HEIC and HEIF to the file picker", () => {
    expect(supportedInputImageAccept).toContain("image/jpeg");
    expect(supportedInputImageAccept).toContain("image/png");
    expect(supportedInputImageAccept).toContain("image/webp");
    expect(supportedInputImageAccept).toContain("image/avif");
    expect(supportedInputImageAccept).toContain(".heic");
    expect(supportedInputImageAccept).toContain(".heif");
  });

  it("reads ISO BMFF brands from an ftyp header", async () => {
    const header = new Uint8Array(
      await createFtypBlob("heic", ["mif1"]).arrayBuffer(),
    );

    expect(readIsoBmffBrands(header)).toEqual(["heic", "mif1"]);
  });

  it("detects HEIC and HEIF input even when MIME metadata is missing", async () => {
    await expect(isHeicContainerBlob(createFtypBlob("heic"))).resolves.toBe(
      true,
    );
    await expect(isHeicContainerBlob(createFtypBlob("mif1"))).resolves.toBe(
      true,
    );
  });

  it("does not route AVIF containers through the HEIC decoder", async () => {
    await expect(
      isHeicContainerBlob(createFtypBlob("avif", ["mif1"])),
    ).resolves.toBe(false);
  });

  it("detects HEIC and HEIF by MIME type", async () => {
    await expect(
      isHeicContainerBlob(new Blob([], { type: "image/heic" })),
    ).resolves.toBe(true);
    await expect(
      isHeicContainerBlob(new Blob([], { type: "image/heif" })),
    ).resolves.toBe(true);
  });

  it("uses browser-native image blobs directly for previews", async () => {
    const pngBlob = new Blob(["preview"], { type: "image/png" });

    await expect(createDisplayableInputPreviewBlob(pngBlob)).resolves.toBe(
      pngBlob,
    );
  });
});
