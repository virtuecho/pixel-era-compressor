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

## Install as an app

Pixel Era Compressor ships as an installable Progressive Web App. In supported
desktop and mobile browsers, use the browser's install, add-to-home-screen, or
share-menu install action after opening the production site.

The installed app still runs the same local browser pipeline: batch uploads,
HEIC/HEIF decoding, previews, and JPEG exports happen on-device.

## Browser support

Pixel Era Compressor targets modern browsers that support Vite 7 production
bundles, module workers, `OffscreenCanvas`, worker-side `createImageBitmap()`,
and dynamic imports.

Supported browser targets:

- Chrome 107+
- Edge 107+
- Firefox 104+
- Safari 16+
- Modern Chromium-based browsers at equivalent versions, such as Brave, Opera,
  and recent Android WebView releases
- iOS and iPadOS browsers on iOS/iPadOS 16+, where Chrome and Firefox use the
  same WebKit browser engine family as Safari

Unsupported or not guaranteed:

- Internet Explorer
- Safari 15 and older
- iOS and iPadOS 15 and older
- Old Android WebView releases
- Browsers that disable workers, module workers, canvas APIs, or dynamic imports

HEIC/HEIF does not require native browser HEIC support, because the app decodes
HEIC/HEIF in the worker before the normal Pixel Era processing pipeline runs.
It still requires the modern worker and canvas features listed above.

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
