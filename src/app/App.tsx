import { Download, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { BeforeAfterPreview } from "../components/BeforeAfterPreview";
import { ExportPanel } from "../components/ExportPanel";
import { ImageUploader } from "../components/ImageUploader";
import { PresetPicker } from "../components/PresetPicker";
import { createDisplayableInputPreviewBlob } from "../imaging/codecs/input-image";
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
  ImageWorkerSuccess,
} from "../imaging/workers/worker-protocol";

type ImageJobStatus = "queued" | "processing" | "ready" | "error";

type ImageJob = {
  readonly id: string;
  readonly file: File;
  readonly configKey: string;
  readonly status: ImageJobStatus;
  readonly outputBlob: Blob | null;
  readonly outputUrl: string | null;
  readonly metadata: ImageWorkerSuccess["metadata"] | null;
  readonly errorMessage: string | null;
};

type BatchStats = {
  readonly totalCount: number;
  readonly inputBytes: number;
  readonly outputBytes: number;
  readonly readyCount: number;
  readonly processingCount: number;
  readonly queuedCount: number;
  readonly errorCount: number;
};

type ParsedWorkerRequestId = {
  readonly jobId: string;
  readonly configKey: string;
};

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

const appIntro =
  "Pixel Era Compressor is a 2000-2013 digital photo compression simulator for early web images, camera phones, compact digital cameras, and pre-computational iPhone-era photography.";

export function App(): ReactElement {
  const workerRef = useRef<Worker | null>(null);
  const requestCounter = useRef(0);
  const imageJobsRef = useRef<readonly ImageJob[]>([]);
  const processingConfigKeyRef = useRef("");
  const activeFileRef = useRef<File | null>(null);
  const sourceFallbackUrlRef = useRef<string | null>(null);
  const sourceFallbackRequestRef = useRef<File | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [imageJobs, setImageJobs] = useState<readonly ImageJob[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeSourceUrl, setActiveSourceUrl] = useState<string | null>(null);
  const [activeSourcePreviewNotice, setActiveSourcePreviewNotice] = useState<
    string | null
  >(null);
  const [isActiveSourceProcessing, setIsActiveSourceProcessing] =
    useState(false);
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState(
    getDefaultCameraPreset().id,
  );
  const [intensity, setIntensity] = useState<ProcessingIntensity>("normal");
  const [cropMode, setCropMode] = useState<CropMode>("center-crop");
  const preset = findCameraPreset(selectedPresetId) ?? getDefaultCameraPreset();
  const processingConfigKey = `${preset.id}|${intensity}|${cropMode}`;
  const activeJob = useMemo(
    () => findActiveJob(imageJobs, activeJobId),
    [activeJobId, imageJobs],
  );
  const activeFile = activeJob === null ? null : activeJob.file;
  const activeJobStatus =
    activeJob === null
      ? null
      : getCurrentJobStatus(activeJob, processingConfigKey);
  const activeOutputUrl =
    activeJob !== null && activeJobStatus === "ready"
      ? activeJob.outputUrl
      : null;
  const activeOutputBlob =
    activeJob !== null && activeJobStatus === "ready"
      ? activeJob.outputBlob
      : null;
  const exportFilename = useMemo(() => {
    return formatExportFilename(activeFile, preset.id);
  }, [activeFile, preset.id]);
  const batchStats = useMemo(
    () => getBatchStats(imageJobs, processingConfigKey),
    [imageJobs, processingConfigKey],
  );

  useEffect(() => {
    processingConfigKeyRef.current = processingConfigKey;
  }, [processingConfigKey]);

  useEffect(() => {
    imageJobsRef.current = imageJobs;
  }, [imageJobs]);

  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);

  useEffect(() => {
    const worker = new Worker(
      new URL("../imaging/workers/image-worker.ts", import.meta.url),
      { type: "module" },
    );

    function handleMessage(event: MessageEvent<ImageWorkerResponse>): void {
      handleWorkerResponse(event.data);
    }

    worker.addEventListener("message", handleMessage);
    workerRef.current = worker;
    setIsWorkerReady(true);

    return () => {
      setIsWorkerReady(false);
      worker.removeEventListener("message", handleMessage);
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      revokeJobOutputUrls(imageJobsRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeFile === null) {
      setActiveSourceUrl(null);
      setActiveSourcePreviewNotice(null);
      setIsActiveSourceProcessing(false);
      return undefined;
    }

    const directSourceUrl = URL.createObjectURL(activeFile);
    setActiveSourceUrl(directSourceUrl);
    setActiveSourcePreviewNotice(null);
    setIsActiveSourceProcessing(false);

    return () => {
      URL.revokeObjectURL(directSourceUrl);

      if (sourceFallbackUrlRef.current !== null) {
        URL.revokeObjectURL(sourceFallbackUrlRef.current);
        sourceFallbackUrlRef.current = null;
      }

      sourceFallbackRequestRef.current = null;
    };
  }, [activeFile]);

  const handleSourcePreviewError = useCallback(() => {
    const file = activeFileRef.current;

    if (
      file === null ||
      sourceFallbackRequestRef.current === file ||
      sourceFallbackUrlRef.current !== null
    ) {
      return;
    }

    sourceFallbackRequestRef.current = file;
    setActiveSourceUrl(null);
    setActiveSourcePreviewNotice(null);
    setIsActiveSourceProcessing(true);

    void createDisplayableInputPreviewBlob(file)
      .then((previewBlob) => {
        if (activeFileRef.current !== file) {
          return;
        }

        if (previewBlob === file) {
          setIsActiveSourceProcessing(false);
          return;
        }

        const nextPreviewUrl = URL.createObjectURL(previewBlob);
        sourceFallbackUrlRef.current = nextPreviewUrl;
        setActiveSourceUrl(nextPreviewUrl);
        setActiveSourcePreviewNotice(
          "browser compatibility HEIC fallback preview",
        );
        setIsActiveSourceProcessing(false);
      })
      .catch(() => {
        if (sourceFallbackRequestRef.current === file) {
          sourceFallbackRequestRef.current = null;
          setIsActiveSourceProcessing(false);
        }
      });
  }, []);

  useEffect(() => {
    if (
      imageJobs.length === 0 ||
      (activeJobId !== null && imageJobs.some((job) => job.id === activeJobId))
    ) {
      return;
    }

    setActiveJobId(imageJobs[0]?.id ?? null);
  }, [activeJobId, imageJobs]);

  useEffect(() => {
    const worker = workerRef.current;

    if (worker === null || !isWorkerReady || imageJobs.length === 0) {
      return;
    }

    const hasActiveProcessingJob = imageJobs.some((job) => {
      return (
        job.configKey === processingConfigKey && job.status === "processing"
      );
    });

    if (hasActiveProcessingJob) {
      return;
    }

    const nextJob = imageJobs.find((job) => {
      return job.configKey !== processingConfigKey || job.status === "queued";
    });

    if (nextJob === undefined) {
      return;
    }

    if (nextJob.outputUrl !== null) {
      URL.revokeObjectURL(nextJob.outputUrl);
    }

    const requestId = createWorkerRequestId(
      nextJob.id,
      processingConfigKey,
      requestCounter.current,
    );
    requestCounter.current += 1;

    const request: ImageWorkerRequest = {
      id: requestId,
      input: nextJob.file,
      presetId: preset.id,
      options: {
        cropMode,
        intensity,
        seed: preset.year,
      },
    };

    setImageJobs((currentJobs) => {
      const nextJobs = currentJobs.map((job) => {
        if (job.id !== nextJob.id) {
          return job;
        }

        return {
          ...job,
          configKey: processingConfigKey,
          status: "processing" as const,
          outputBlob: null,
          outputUrl: null,
          metadata: null,
          errorMessage: null,
        };
      });
      imageJobsRef.current = nextJobs;
      return nextJobs;
    });

    worker.postMessage(request);
  }, [
    cropMode,
    imageJobs,
    intensity,
    isWorkerReady,
    preset.id,
    preset.year,
    processingConfigKey,
  ]);

  function handleFilesSelected(files: readonly File[]): void {
    const nextJobs = files.map((file) => {
      const id = `image-${Date.now().toString(36)}-${requestCounter.current.toString(36)}`;
      requestCounter.current += 1;
      return createImageJob(id, file);
    });

    revokeJobOutputUrls(imageJobsRef.current);
    imageJobsRef.current = nextJobs;
    setImageJobs(nextJobs);
    setActiveJobId(nextJobs[0]?.id ?? null);
  }

  function handleWorkerResponse(response: ImageWorkerResponse): void {
    const parsedRequest = parseWorkerRequestId(response.id);

    if (parsedRequest === null) {
      return;
    }

    const currentJob = imageJobsRef.current.find((job) => {
      return job.id === parsedRequest.jobId;
    });

    if (
      currentJob?.configKey !== parsedRequest.configKey ||
      parsedRequest.configKey !== processingConfigKeyRef.current
    ) {
      return;
    }

    if (currentJob.outputUrl !== null) {
      URL.revokeObjectURL(currentJob.outputUrl);
    }

    const nextOutputUrl = response.ok
      ? URL.createObjectURL(response.blob)
      : null;

    setImageJobs((currentJobs) => {
      const nextJobs = currentJobs.map((job) => {
        if (
          job.id !== parsedRequest.jobId ||
          job.configKey !== parsedRequest.configKey
        ) {
          return job;
        }

        if (response.ok) {
          return {
            ...job,
            status: "ready" as const,
            outputBlob: response.blob,
            outputUrl: nextOutputUrl,
            metadata: response.metadata,
            errorMessage: null,
          };
        }

        return {
          ...job,
          status: "error" as const,
          outputBlob: null,
          outputUrl: null,
          metadata: null,
          errorMessage: response.message,
        };
      });
      imageJobsRef.current = nextJobs;
      return nextJobs;
    });
  }

  function exportReadyJobs(): void {
    const readyJobs = imageJobs.filter((job) => {
      return (
        getCurrentJobStatus(job, processingConfigKey) === "ready" &&
        job.outputUrl !== null
      );
    });

    for (const job of readyJobs) {
      if (job.outputUrl === null) {
        continue;
      }

      const link = document.createElement("a");
      link.href = job.outputUrl;
      link.download = formatExportFilename(job.file, preset.id);
      document.body.append(link);
      link.click();
      link.remove();
    }
  }

  return (
    <main className="app-shell">
      <section className="site-frame" aria-label="Pixel Era Compressor">
        <header className="top-bar">
          <div className="brand-mark">
            <img
              src="/favicon/favicon-32x32.png"
              width="20"
              height="20"
              alt=""
              aria-hidden="true"
            />
            <h1>Pixel Era Compressor</h1>
          </div>
          <nav className="top-nav" aria-label="Project links">
            <button
              type="button"
              aria-expanded={isAboutVisible}
              aria-controls="about-panel"
              onClick={() => {
                setIsAboutVisible((currentValue) => !currentValue);
              }}
            >
              About
            </button>
            <a
              href="https://github.com/virtuecho/pixel-era-compressor"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </nav>
        </header>

        {isAboutVisible ? (
          <section id="about-panel" className="about-panel">
            <p>{appIntro}</p>
          </section>
        ) : null}

        <div className="upload-strip">
          <ImageUploader
            files={imageJobs.map((job) => job.file)}
            onFilesSelected={handleFilesSelected}
          />
        </div>

        <BeforeAfterPreview
          sourceUrl={activeSourceUrl}
          sourcePreviewNotice={activeSourcePreviewNotice}
          outputUrl={activeOutputUrl}
          presetLabel={preset.label}
          isSourceProcessing={isActiveSourceProcessing}
          isProcessing={activeJobStatus === "processing"}
          onSourceError={handleSourcePreviewError}
        />

        <section className="lower-grid">
          <section className="file-info" aria-label="File information">
            <h2>File Info</h2>
            <dl className="info-list">
              <div>
                <dt>Input</dt>
                <dd>{formatInputSummary(batchStats)}</dd>
              </div>
              <div>
                <dt>Output</dt>
                <dd>{formatOutputSummary(batchStats)}</dd>
              </div>
              <div>
                <dt>Saved</dt>
                <dd>{formatSavedSummary(batchStats)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{formatBatchStatus(batchStats)}</dd>
              </div>
            </dl>

            <section className="batch-list" aria-label="Batch queue">
              <div className="batch-list-header">
                <span>Batch Queue</span>
                <span>{formatQueueHeader(batchStats)}</span>
              </div>
              {imageJobs.length === 0 ? (
                <p className="empty-note">No images queued.</p>
              ) : (
                <ol className="queue-list">
                  {imageJobs.map((job, index) => {
                    const status = getCurrentJobStatus(
                      job,
                      processingConfigKey,
                    );
                    const isActive =
                      activeJob !== null && job.id === activeJob.id;

                    return (
                      <li
                        key={job.id}
                        className="queue-row"
                        data-active={isActive}
                      >
                        <button
                          type="button"
                          className="queue-select-button"
                          aria-pressed={isActive}
                          onClick={() => {
                            setActiveJobId(job.id);
                          }}
                        >
                          <span className="queue-name">
                            {String(index + 1)}. {job.file.name}
                          </span>
                          <span className="queue-meta">
                            {formatBytes(job.file.size)} input /{" "}
                            {formatJobOutput(job, status)}
                          </span>
                          {status === "error" && job.errorMessage !== null ? (
                            <span className="queue-error">
                              {job.errorMessage}
                            </span>
                          ) : null}
                        </button>
                        <span className="queue-status">
                          {formatJobStatus(status)}
                        </span>
                        {status === "ready" && job.outputUrl !== null ? (
                          <a
                            className="queue-export"
                            href={job.outputUrl}
                            download={formatExportFilename(job.file, preset.id)}
                            aria-label={`Export ${job.file.name}`}
                          >
                            <Download size={16} aria-hidden="true" />
                          </a>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
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

            <div className="export-actions">
              <ExportPanel
                outputUrl={activeOutputUrl}
                filename={exportFilename}
                disabled={activeOutputBlob === null}
                label="Export selected"
              />
              <button
                type="button"
                className="primary-button batch-export-button"
                disabled={batchStats.readyCount === 0}
                onClick={exportReadyJobs}
              >
                <Download size={17} aria-hidden="true" />
                Export ready ({String(batchStats.readyCount)})
              </button>
            </div>
          </aside>
        </section>
      </section>

      {batchStats.processingCount > 0 ? (
        <div className="status-pill" role="status">
          <Loader2 size={16} className="spin" />
          Processing {String(batchStats.readyCount + 1)} of{" "}
          {String(batchStats.totalCount)}
        </div>
      ) : null}
    </main>
  );
}

function createImageJob(id: string, file: File): ImageJob {
  return {
    id,
    file,
    configKey: "",
    status: "queued",
    outputBlob: null,
    outputUrl: null,
    metadata: null,
    errorMessage: null,
  };
}

function findActiveJob(
  jobs: readonly ImageJob[],
  activeJobId: string | null,
): ImageJob | null {
  const selectedJob =
    activeJobId === null
      ? undefined
      : jobs.find((job) => job.id === activeJobId);

  if (selectedJob !== undefined) {
    return selectedJob;
  }

  return jobs.length > 0 ? jobs[0] : null;
}

function createWorkerRequestId(
  jobId: string,
  configKey: string,
  counter: number,
): string {
  return `${jobId}::${configKey}::${counter.toString(36)}`;
}

function parseWorkerRequestId(id: string): ParsedWorkerRequestId | null {
  const parts = id.split("::");

  if (parts.length < 3) {
    return null;
  }

  return {
    jobId: parts[0] ?? "",
    configKey: parts.slice(1, -1).join("::"),
  };
}

function getCurrentJobStatus(
  job: ImageJob,
  processingConfigKey: string,
): ImageJobStatus {
  if (job.configKey !== processingConfigKey) {
    return "queued";
  }

  return job.status;
}

function getBatchStats(
  jobs: readonly ImageJob[],
  processingConfigKey: string,
): BatchStats {
  return jobs.reduce<BatchStats>(
    (stats, job) => {
      const status = getCurrentJobStatus(job, processingConfigKey);
      const outputBytes =
        status === "ready" && job.outputBlob !== null ? job.outputBlob.size : 0;

      return {
        totalCount: stats.totalCount + 1,
        inputBytes: stats.inputBytes + job.file.size,
        outputBytes: stats.outputBytes + outputBytes,
        readyCount: stats.readyCount + (status === "ready" ? 1 : 0),
        processingCount:
          stats.processingCount + (status === "processing" ? 1 : 0),
        queuedCount: stats.queuedCount + (status === "queued" ? 1 : 0),
        errorCount: stats.errorCount + (status === "error" ? 1 : 0),
      };
    },
    {
      totalCount: 0,
      inputBytes: 0,
      outputBytes: 0,
      readyCount: 0,
      processingCount: 0,
      queuedCount: 0,
      errorCount: 0,
    },
  );
}

function revokeJobOutputUrls(jobs: readonly ImageJob[]): void {
  for (const job of jobs) {
    if (job.outputUrl !== null) {
      URL.revokeObjectURL(job.outputUrl);
    }
  }
}

function formatExportFilename(file: File | null, presetId: string): string {
  const stem = file?.name.replace(/\.[^.]+$/, "") ?? "pixel-era";
  return `${stem}-${presetId}.jpg`;
}

function formatInputSummary(stats: BatchStats): string {
  if (stats.totalCount === 0) {
    return "No file";
  }

  return `${String(stats.totalCount)} ${pluralizeImage(stats.totalCount)} / ${formatBytes(stats.inputBytes)}`;
}

function formatOutputSummary(stats: BatchStats): string {
  if (stats.readyCount === 0) {
    return "Waiting";
  }

  return `${String(stats.readyCount)}/${String(stats.totalCount)} ready / ${formatBytes(stats.outputBytes)} JPG`;
}

function formatSavedSummary(stats: BatchStats): string {
  if (stats.readyCount === 0 || stats.inputBytes === 0) {
    return "Waiting";
  }

  const savedPercent = Math.max(0, 1 - stats.outputBytes / stats.inputBytes);
  const suffix = stats.readyCount === stats.totalCount ? "" : " partial";
  return `${(savedPercent * 100).toFixed(1)}%${suffix}`;
}

function formatBatchStatus(stats: BatchStats): string {
  if (stats.totalCount === 0) {
    return "Ready";
  }

  if (stats.processingCount > 0) {
    return `Processing ${String(stats.readyCount + 1)} of ${String(stats.totalCount)}`;
  }

  if (
    stats.errorCount > 0 &&
    stats.readyCount + stats.errorCount === stats.totalCount
  ) {
    return `Complete with ${String(stats.errorCount)} ${pluralizeError(stats.errorCount)}`;
  }

  if (stats.readyCount === stats.totalCount) {
    return "Complete";
  }

  return "Queued";
}

function formatQueueHeader(stats: BatchStats): string {
  if (stats.totalCount === 0) {
    return "0 images";
  }

  return `${String(stats.readyCount)} ready / ${String(stats.totalCount)} total`;
}

function formatJobOutput(job: ImageJob, status: ImageJobStatus): string {
  if (status === "ready" && job.outputBlob !== null) {
    return `${formatBytes(job.outputBlob.size)} JPG`;
  }

  return formatJobStatus(status);
}

function formatJobStatus(status: ImageJobStatus): string {
  switch (status) {
    case "queued":
      return "Queued";
    case "processing":
      return "Processing";
    case "ready":
      return "Ready";
    case "error":
      return "Error";
  }
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

function pluralizeImage(count: number): string {
  return count === 1 ? "image" : "images";
}

function pluralizeError(count: number): string {
  return count === 1 ? "error" : "errors";
}
