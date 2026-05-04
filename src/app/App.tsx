import { Camera, Loader2, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { BeforeAfterPreview } from "../components/BeforeAfterPreview";
import { ExportPanel } from "../components/ExportPanel";
import { ImageUploader } from "../components/ImageUploader";
import { PresetPicker } from "../components/PresetPicker";
import {
  cameraPresets,
  findCameraPreset,
  getDefaultCameraPreset,
} from "../imaging/presets/camera-presets";
import type { ProcessingIntensity } from "../imaging/presets/preset-types";
import type { CropMode } from "../imaging/pipeline/crop-or-fit";
import type {
  ImageWorkerRequest,
  ImageWorkerResponse,
} from "../imaging/workers/worker-protocol";

type ProcessingState =
  | { readonly status: "idle" }
  | { readonly status: "processing" }
  | { readonly status: "ready"; readonly blob: Blob }
  | { readonly status: "error"; readonly message: string };

const cropModes = [
  { value: "center-crop", label: "Center crop" },
  { value: "fit-inside", label: "Fit inside" },
  { value: "fill", label: "Fill" },
] as const satisfies readonly {
  readonly value: CropMode;
  readonly label: string;
}[];

const intensities = [
  { value: "mild", label: "Mild" },
  { value: "normal", label: "Normal" },
  { value: "strong", label: "Strong" },
] as const satisfies readonly {
  readonly value: ProcessingIntensity;
  readonly label: string;
}[];

export function App(): ReactElement {
  const workerRef = useRef<Worker | null>(null);
  const requestCounter = useRef(0);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: "idle",
  });
  const [selectedPresetId, setSelectedPresetId] = useState(
    getDefaultCameraPreset().id,
  );
  const [intensity, setIntensity] = useState<ProcessingIntensity>("normal");
  const [cropMode, setCropMode] = useState<CropMode>("center-crop");
  const preset = findCameraPreset(selectedPresetId) ?? getDefaultCameraPreset();
  const exportFilename = useMemo(() => {
    const stem = sourceFile?.name.replace(/\.[^.]+$/, "") ?? "pixel-era";
    return `${stem}-${preset.id}.jpg`;
  }, [preset.id, sourceFile?.name]);

  useEffect(() => {
    const worker = new Worker(
      new URL("../imaging/workers/image-worker.ts", import.meta.url),
      { type: "module" },
    );

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (sourceFile === null) {
      setSourceUrl(null);
      return undefined;
    }

    const nextSourceUrl = URL.createObjectURL(sourceFile);
    setSourceUrl(nextSourceUrl);

    return () => {
      URL.revokeObjectURL(nextSourceUrl);
    };
  }, [sourceFile]);

  useEffect(() => {
    if (processingState.status !== "ready") {
      setOutputUrl(null);
      return undefined;
    }

    const nextOutputUrl = URL.createObjectURL(processingState.blob);
    setOutputUrl(nextOutputUrl);

    return () => {
      URL.revokeObjectURL(nextOutputUrl);
    };
  }, [processingState]);

  useEffect(() => {
    const worker = workerRef.current;

    if (sourceFile === null || worker === null) {
      setProcessingState({
        status: sourceFile === null ? "idle" : "processing",
      });
      return undefined;
    }

    const requestId = `${String(Date.now())}-${String(requestCounter.current)}`;
    requestCounter.current += 1;
    const request: ImageWorkerRequest = {
      id: requestId,
      input: sourceFile,
      presetId: preset.id,
      options: {
        cropMode,
        intensity,
        seed: preset.year,
      },
    };

    setProcessingState({ status: "processing" });

    const handleMessage = (event: MessageEvent<ImageWorkerResponse>): void => {
      if (event.data.id !== requestId) {
        return;
      }

      if (event.data.ok) {
        setProcessingState({ status: "ready", blob: event.data.blob });
        return;
      }

      setProcessingState({ status: "error", message: event.data.message });
    };

    worker.addEventListener("message", handleMessage);
    worker.postMessage(request);

    return () => {
      worker.removeEventListener("message", handleMessage);
    };
  }, [cropMode, intensity, preset.id, preset.year, sourceFile]);

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div className="brand-mark" aria-hidden="true">
          <Camera size={22} />
        </div>
        <div>
          <h1>Pixel Era Compressor</h1>
          <p>
            2000-2013 web images, camera phones, compact cameras, and early
            iPhone-era output.
          </p>
        </div>
      </header>

      <section className="workspace">
        <aside className="control-panel" aria-label="Processing controls">
          <ImageUploader file={sourceFile} onFileSelected={setSourceFile} />

          <PresetPicker
            presets={cameraPresets}
            selectedPresetId={preset.id}
            onPresetChange={setSelectedPresetId}
          />

          <fieldset className="control-group">
            <legend>
              <SlidersHorizontal size={16} />
              Intensity
            </legend>
            <div className="segmented-control">
              {intensities.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={item.value === intensity}
                  onClick={() => {
                    setIntensity(item.value);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="control-group">
            <legend>Crop mode</legend>
            <div className="segmented-control stacked">
              {cropModes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={item.value === cropMode}
                  onClick={() => {
                    setCropMode(item.value);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>

          <dl className="preset-stats">
            <div>
              <dt>Output</dt>
              <dd>
                {preset.nativeWidth} x {preset.nativeHeight}
              </dd>
            </div>
            <div>
              <dt>JPEG</dt>
              <dd>Q{preset.isp.jpegQuality}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{preset.year}</dd>
            </div>
          </dl>
        </aside>

        <section className="preview-panel" aria-label="Image preview">
          <BeforeAfterPreview
            sourceUrl={sourceUrl}
            outputUrl={outputUrl}
            presetLabel={preset.label}
            isProcessing={processingState.status === "processing"}
          />

          {processingState.status === "error" ? (
            <p className="error-message">{processingState.message}</p>
          ) : null}

          <ExportPanel
            outputUrl={outputUrl}
            filename={exportFilename}
            disabled={processingState.status !== "ready"}
          />
        </section>
      </section>

      {processingState.status === "processing" ? (
        <div className="status-pill" role="status">
          <Loader2 size={16} className="spin" />
          Processing
        </div>
      ) : null}
    </main>
  );
}
