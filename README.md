# Pixel Era Compressor

<img
  src="public/favicon/android-chrome-192x192.png"
  alt="Pixel Era Compressor logo"
  width="120"
  height="120"
/>

Pixel Era Compressor is a 2000-2013 digital photo compression simulator for
early web images, camera phones, compact digital cameras, and
pre-computational iPhone-era photography.

It is a small browser app for making modern images feel like they came from old
digital cameras, early phone uploads, and blog-era JPEG workflows.

## What It Simulates

Real early digital photos were not just “bad JPEGs.” They usually had low
native resolution, soft optics, noisy sensors, limited dynamic range, uneven
white balance, and device-specific sharpening.

Pixel Era Compressor keeps that order of operations intact:

```text
decode
-> crop or fit
-> high-quality resize
-> optical softness
-> sensor noise
-> tone and color shift
-> device ISP signature
-> JPEG export
```

## What You Can Do

- Drop one image or many images into the app.
- Pick an era, phone, compact camera, DSLR, or early-web preset.
- Process everything locally in the browser.
- Export JPEG results one by one or export every ready image.
- Upload HEIC/HEIF files from modern phones; the app converts them at the codec
  boundary before the normal Pixel Era pipeline runs.
- Install the site as a Progressive Web App on supported desktop and mobile
  browsers.

## Settings

- Preset chooses the historical output profile. It controls the device or web
  target, output pixel size, year, JPEG quality, optical softness, sensor noise,
  tone curve, color bias, and device ISP signature.
- Format is currently JPEG. The app exports JPEG because early web and camera
  phone photos were usually shared as JPEG files.
- Quality shows the preset's JPEG quality value. It is preset-driven rather
  than a separate manual slider, so a Nokia 7650-style output and an iPhone
  5s-style output do not compress the image in the same way.
- Intensity controls how strongly the selected preset is applied. Mild keeps
  the look subtle, with less softness, noise, tone compression, and ISP
  character. Normal is the intended default balance for the preset. Strong
  pushes the same preset harder for more obvious old-device degradation.
- Crop mode controls how the source image is mapped into the preset's output
  shape. Center crop fills the output and trims from the center when needed.
  Fit inside keeps the whole source visible and may leave dark padding. Fill
  stretches the whole source image to the output shape without cropping or
  padding.

## Included Presets

Phone presets include Nokia 7650, Nokia 3660, Nokia N95, Motorola ZN5, Sony
Ericsson C905, Nokia N86 8MP, iPhone 3GS, iPhone 4, iPhone 4S, iPhone 5, and
iPhone 5s.

Camera and web presets include Canon PowerShot G1, Casio QV-4000, Canon EOS
300D / Digital Rebel, Old Web Display, Clear Old Blog, and Early Mobile Upload.

## Local Development

Use pnpm.

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts the Vite development server. It is meant for local work and
keeps running until you stop it.

For the full local gate, run:

```bash
pnpm check
pnpm build
```

Preview the production build locally with:

```bash
pnpm preview
```

## Deployment

This is a Vite static app. Deployment should build the project, write static
files into `dist`, then exit.

Use this shape for any static host or self-hosted server:

```bash
pnpm install --frozen-lockfile
pnpm build
```

Then serve the generated `dist` directory.

`pnpm dev` is only for local development. It starts a Vite development server
and keeps running, so it should not be used as a deployment build command.

The GitHub Actions workflow also runs `pnpm build` after checks, so CI catches
production build failures before deployment.

## Install as an App

Pixel Era Compressor ships as an installable Progressive Web App. In supported
desktop and mobile browsers, use the browser's install, add-to-home-screen, or
share-menu install action after opening the production site.

The installed app still runs the same local browser pipeline: batch uploads,
HEIC/HEIF decoding, previews, and JPEG exports happen on-device.

## Browser Support

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

## Input Formats

The browser app accepts common raster image formats such as JPEG, PNG, WebP,
GIF, AVIF, BMP, and SVG. HEIC and HEIF uploads are decoded in the image worker
before the Pixel Era processing pipeline runs.

HEIC/HEIF needs a separate decode step because browser support is uneven:
Chromium-based browsers often cannot decode iPhone HEIC files directly through
`createImageBitmap()`. The app converts HEIC/HEIF to an `ImageBitmap` at the
codec boundary, then sends it through the same crop, resize, optical softness,
sensor noise, tone, ISP, and JPEG export pipeline as every other input format.
This is a compatibility path, not a separate visual effect.

## Agent Notes

Agents must not push. Human maintainers push manually.
