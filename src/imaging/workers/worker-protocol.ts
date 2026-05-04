import type {
  ProcessImageOptions,
  ProcessedImage,
} from "../pipeline/image-pipeline";

// Messages sent from App to the image worker. The Blob stays original so codec
// detection and HEIC fallback behavior happen at the worker boundary.
export type ImageWorkerRequest = {
  readonly id: string;
  readonly input: Blob;
  readonly presetId: string;
  readonly options: ProcessImageOptions;
};

// Worker success returns both the encoded JPEG Blob and UI-facing metadata about
// the processing run. The metadata is not embedded into the Blob.
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
