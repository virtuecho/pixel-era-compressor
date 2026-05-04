import type {
  ProcessImageOptions,
  ProcessedImage,
} from "../pipeline/image-pipeline";

export type ImageWorkerRequest = {
  readonly id: string;
  readonly input: Blob;
  readonly presetId: string;
  readonly options: ProcessImageOptions;
};

export type ImageWorkerSuccess = {
  readonly id: string;
  readonly ok: true;
  readonly blob: Blob;
  readonly metadata: Omit<ProcessedImage, "frame">;
};

export type ImageWorkerFailure = {
  readonly id: string;
  readonly ok: false;
  readonly message: string;
};

export type ImageWorkerResponse = ImageWorkerSuccess | ImageWorkerFailure;
