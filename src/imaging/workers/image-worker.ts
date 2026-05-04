import { exportFrameAsJpeg } from "../codecs/jpeg-export";
import { findCameraPreset } from "../presets/camera-presets";
import { processImage } from "../pipeline/image-pipeline";
import type {
  ImageWorkerRequest,
  ImageWorkerResponse,
} from "./worker-protocol";

globalThis.addEventListener(
  "message",
  (event: MessageEvent<ImageWorkerRequest>) => {
    void handleRequest(event.data);
  },
);

async function handleRequest(request: ImageWorkerRequest): Promise<void> {
  const preset = findCameraPreset(request.presetId);

  if (preset === undefined) {
    postResponse({
      id: request.id,
      ok: false,
      message: `Unknown camera preset: ${request.presetId}`,
    });
    return;
  }

  try {
    const processed = await processImage(
      request.input,
      preset,
      request.options,
    );
    const blob = await exportFrameAsJpeg(processed.frame, {
      quality: processed.jpegQuality,
    });
    const metadata = {
      presetId: processed.presetId,
      width: processed.width,
      height: processed.height,
      jpegQuality: processed.jpegQuality,
      steps: processed.steps,
    };

    postResponse({
      id: request.id,
      ok: true,
      blob,
      metadata,
    });
  } catch (error) {
    postResponse({
      id: request.id,
      ok: false,
      message: error instanceof Error ? error.message : "Image worker failed.",
    });
  }
}

function postResponse(response: ImageWorkerResponse): void {
  globalThis.postMessage(response);
}
