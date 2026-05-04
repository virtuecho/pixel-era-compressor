import { Loader2 } from "lucide-react";
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
  const outputBlob =
    processingState.status === "ready" ? processingState.blob : null;
  const exportFilename = useMemo(() => {
    const stem = sourceFile?.name.replace(/\.[^.]+$/, "") ?? "pixel-era";
    return `${stem}-${preset.id}.jpg`;
  }, [preset.id, sourceFile?.name]);
  const savedPercent =
    sourceFile !== null && outputBlob !== null
      ? Math.max(0, 1 - outputBlob.size / sourceFile.size) * 100
      : null;

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
      <section className="site-frame" aria-label="Pixel Era Compressor">
        <header className="top-bar">
          <h1>Pixel Era Compressor</h1>
          <nav className="top-nav" aria-label="Project links">
            <a
              href="https://github.com/virtuecho/pixel-era-compressor#pixel-era-compressor"
              rel="noreferrer"
              target="_blank"
            >
              About
            </a>
            <a
              href="https://github.com/virtuecho/pixel-era-compressor"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </nav>
        </header>

        <div className="upload-strip">
          <ImageUploader file={sourceFile} onFileSelected={setSourceFile} />
        </div>

        <BeforeAfterPreview
          sourceUrl={sourceUrl}
          outputUrl={outputUrl}
          presetLabel={preset.label}
          isProcessing={processingState.status === "processing"}
        />

        <section className="lower-grid">
          <section className="file-info" aria-label="File information">
            <h2>File Info</h2>
            <dl className="info-list">
              <div>
                <dt>Input</dt>
                <dd>{formatFileSummary(sourceFile)}</dd>
              </div>
              <div>
                <dt>Output</dt>
                <dd>{formatOutputSummary(outputBlob)}</dd>
              </div>
              <div>
                <dt>Saved</dt>
                <dd>
                  {savedPercent === null
                    ? "Waiting"
                    : `${savedPercent.toFixed(1)}%`}
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{formatProcessingStatus(processingState)}</dd>
              </div>
            </dl>
            {processingState.status === "error" ? (
              <p className="error-message">{processingState.message}</p>
            ) : null}
          </section>

          <aside className="settings-panel" aria-label="Processing settings">
            <h2>Settings</h2>
            <div className="settings-stack">
              <div className="static-setting">
                <span>Format</span>
                <strong>JPEG</strong>
              </div>
              <div className="static-setting">
                <span>Quality</span>
                <strong>Q{preset.isp.jpegQuality}</strong>
              </div>
            </div>

            <PresetPicker
              presets={cameraPresets}
              selectedPresetId={preset.id}
              onPresetChange={setSelectedPresetId}
            />

            <fieldset className="control-group">
              <legend>Intensity</legend>
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
                <dt>Year</dt>
                <dd>{preset.year}</dd>
              </div>
            </dl>

            <ExportPanel
              outputUrl={outputUrl}
              filename={exportFilename}
              disabled={processingState.status !== "ready"}
            />
          </aside>
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

function formatFileSummary(file: File | null): string {
  if (file === null) {
    return "No file";
  }

  const extension = file.name.split(".").at(-1)?.toUpperCase() ?? "IMAGE";
  return `${formatBytes(file.size)} ${extension}`;
}

function formatOutputSummary(blob: Blob | null): string {
  if (blob === null) {
    return "Waiting";
  }

  return `${formatBytes(blob.size)} JPG`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${String(bytes)} B`;
  }

  const units = ["KB", "MB", "GB"] as const;
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

function formatProcessingStatus(processingState: ProcessingState): string {
  switch (processingState.status) {
    case "idle":
      return "Ready";
    case "processing":
      return "Processing";
    case "ready":
      return "Complete";
    case "error":
      return "Error";
  }
}
