# Pixel Era Compressor

A 2000–2013 digital photo compression simulator for early web images, camera phones, compact digital cameras, and pre-computational iPhone-era photography.

This is not a Y2K fashion filter.

## What it does

Pixel Era Compressor turns modern images into historically plausible early digital photos by simulating:

- low native resolution
- soft optics
- sensor noise
- limited dynamic range
- early JPEG compression
- device-specific image processing

## Core devices

- Nokia 7650
- Nokia 3660
- Nokia N95
- Motorola ZN5
- Sony Ericsson C905
- Nokia N86 8MP
- iPhone 3GS
- iPhone 4
- iPhone 4S
- iPhone 5
- iPhone 5s
- Canon PowerShot G1
- Casio QV-4000
- Canon EOS 300D

## Development

Use pnpm.

```bash
pnpm install
pnpm dev
pnpm check
```

Agents must not push. Human maintainers push manually.

## Input formats

The browser app accepts common raster image formats such as JPEG, PNG, WebP,
GIF, AVIF, BMP, and SVG. HEIC and HEIF uploads are decoded in the image worker
before the Pixel Era processing pipeline runs.

HEIC/HEIF needs a separate decode step because browser support is uneven:
Chromium-based browsers often cannot decode iPhone HEIC files directly through
`createImageBitmap()`. The app converts HEIC/HEIF to an `ImageBitmap` at the
codec boundary, then sends it through the same crop, resize, optical softness,
sensor noise, tone, ISP, and JPEG export pipeline as every other input format.
This is a compatibility path, not a separate visual effect.
