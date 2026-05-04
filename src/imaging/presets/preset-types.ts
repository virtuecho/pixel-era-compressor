export type PresetCategory = "web-preset" | "phone" | "compact-camera" | "dslr";

export type AspectRatio = "4:3" | "3:2";

export type ChromaSubsampling = "4:2:0" | "4:2:2";

export type FlashStyle = "none" | "led" | "xenon" | "true-tone";

export type OpticalProfile = {
  readonly blurPx: number;
  readonly edgeSoftness: number;
  readonly vignette: number;
  readonly chromaticAberration: number;
};

export type SensorProfile = {
  readonly lumaNoise: number;
  readonly chromaNoise: number;
  readonly dynamicRangeLoss: number;
  readonly highlightClip: number;
  readonly shadowCrush: number;
};

export type ColorProfile = {
  readonly saturationBias: number;
  readonly contrastBias: number;
  readonly warmthBias: number;
  readonly greenMagentaBias: number;
};

export type IspProfile = {
  readonly sharpenHalo: number;
  readonly denoiseStrength: number;
  readonly jpegQuality: number;
  readonly chromaSubsampling: ChromaSubsampling;
};

export type SpecialProfile = {
  readonly flashStyle?: FlashStyle;
  readonly ccdLook?: boolean;
  readonly wideAngleLook?: boolean;
  readonly portraitTinyMode?: boolean;
};

export type CameraPreset = {
  readonly id: string;
  readonly label: string;
  readonly year: number;
  readonly category: PresetCategory;
  readonly nativeWidth: number;
  readonly nativeHeight: number;
  readonly aspectRatio: AspectRatio;
  readonly optical: OpticalProfile;
  readonly sensor: SensorProfile;
  readonly color: ColorProfile;
  readonly isp: IspProfile;
  readonly special?: SpecialProfile;
};

export type ProcessingIntensity = "mild" | "normal" | "strong";

export const intensityScale = {
  mild: 0.65,
  normal: 1,
  strong: 1.35,
} as const satisfies Record<ProcessingIntensity, number>;

export function aspectRatioValue(aspectRatio: AspectRatio): number {
  return aspectRatio === "4:3" ? 4 / 3 : 3 / 2;
}
