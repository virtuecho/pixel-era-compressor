import {
  clampChannel,
  clampCoordinate,
  createImageFrame,
  pixelOffset,
  type ImageFrame,
} from "./image-frame";

export type DeviceIspOptions = {
  readonly sharpenHalo: number;
  readonly denoiseStrength: number;
  readonly vignette: number;
  readonly chromaticAberration: number;
  readonly intensityScale: number;
};

/**
 * Applies a compact approximation of device-specific in-camera processing.
 *
 * The important historical behavior is the tension between denoising and
 * sharpening: old phones often smeared texture but still left small halos near
 * edges. The final vignette and tiny channel offset add optical-device
 * character.
 */
export function applyDeviceIspSignature(
  frame: ImageFrame,
  options: DeviceIspOptions,
): ImageFrame {
  const output = createImageFrame(frame.width, frame.height);
  const denoiseStrength = Math.min(
    0.55,
    Math.max(0, options.denoiseStrength * options.intensityScale),
  );
  const sharpenStrength = Math.min(
    0.85,
    Math.max(0, options.sharpenHalo * options.intensityScale),
  );
  const vignetteStrength = Math.min(
    0.35,
    Math.max(0, options.vignette * options.intensityScale),
  );
  const channelShift =
    options.chromaticAberration * options.intensityScale > 0.065 ? 1 : 0;
  const centerX = (frame.width - 1) / 2;
  const centerY = (frame.height - 1) / 2;
  const maxRadius = Math.hypot(centerX, centerY) || 1;

  for (let y = 0; y < frame.height; y += 1) {
    for (let x = 0; x < frame.width; x += 1) {
      const offset = pixelOffset(frame.width, x, y);
      const average = localAverage(frame, x, y);
      // Vignette is computed from normalized radius so presets scale across
      // VGA phone frames and larger compact-camera outputs.
      const vignetteDistance = Math.hypot(x - centerX, y - centerY) / maxRadius;
      const vignette =
        1 - vignetteStrength * vignetteDistance * vignetteDistance;
      const redOffset = pixelOffset(
        frame.width,
        clampCoordinate(x + channelShift, frame.width - 1),
        y,
      );
      const blueOffset = pixelOffset(
        frame.width,
        clampCoordinate(x - channelShift, frame.width - 1),
        y,
      );
      const shifted = [
        frame.data[redOffset],
        frame.data[offset + 1],
        frame.data[blueOffset + 2],
      ] as const;

      for (let channel = 0; channel < 3; channel += 1) {
        // Denoise pulls toward the local average; sharpening then pushes away
        // from that same average, producing old ISP smear plus edge halos.
        const denoised =
          shifted[channel] * (1 - denoiseStrength) +
          average[channel] * denoiseStrength;
        const sharpened =
          denoised + (denoised - average[channel]) * sharpenStrength;

        output.data[offset + channel] = clampChannel(sharpened * vignette);
      }

      output.data[offset + 3] = frame.data[offset + 3];
    }
  }

  return output;
}

function localAverage(
  frame: ImageFrame,
  x: number,
  y: number,
): readonly [number, number, number] {
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      const sampleX = clampCoordinate(x + dx, frame.width - 1);
      const sampleY = clampCoordinate(y + dy, frame.height - 1);
      const offset = pixelOffset(frame.width, sampleX, sampleY);

      red += frame.data[offset];
      green += frame.data[offset + 1];
      blue += frame.data[offset + 2];
      count += 1;
    }
  }

  return [red / count, green / count, blue / count];
}
