import { ImageOff, ImagePlus } from "lucide-react";
import { useId, useState } from "react";
import type { ChangeEvent, DragEvent, ReactElement } from "react";
import { supportedInputImageAccept } from "../imaging/codecs/input-image";

export type BeforeAfterPreviewProps = {
  readonly sourceUrl: string | null;
  readonly sourcePreviewNotice: string | null;
  readonly outputUrl: string | null;
  readonly presetLabel: string;
  readonly isSourceProcessing: boolean;
  readonly isProcessing: boolean;
  readonly onSourceFilesSelected: (files: readonly File[]) => void;
  readonly onSourceError?: () => void;
};

export function BeforeAfterPreview({
  sourceUrl,
  sourcePreviewNotice,
  outputUrl,
  presetLabel,
  isSourceProcessing,
  isProcessing,
  onSourceFilesSelected,
  onSourceError,
}: BeforeAfterPreviewProps): ReactElement {
  const sourceInputId = useId();
  const [isSourceDragging, setIsSourceDragging] = useState(false);

  function chooseSourceImages(event: ChangeEvent<HTMLInputElement>): void {
    chooseSourceFileList(event.currentTarget.files);
    event.currentTarget.value = "";
  }

  function chooseSourceFileList(fileList: FileList | null): void {
    const selectedFiles = fileList === null ? [] : Array.from(fileList);

    if (selectedFiles.length > 0) {
      onSourceFilesSelected(selectedFiles);
    }
  }

  function handleSourceDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    setIsSourceDragging(false);

    if (!isSourceProcessing) {
      chooseSourceFileList(event.dataTransfer.files);
    }
  }

  return (
    <section className="comparison-grid" aria-label="Before and after preview">
      <figure className="preview-frame">
        <figcaption
          className={sourcePreviewNotice === null ? "" : "is-notice"}
          title={
            sourcePreviewNotice === null
              ? undefined
              : "Browser cannot display this HEIC directly"
          }
        >
          Original
          {sourcePreviewNotice === null ? null : (
            <span>({sourcePreviewNotice})</span>
          )}
        </figcaption>
        {sourceUrl === null ? (
          <div
            className="empty-preview"
            data-dragging={isSourceDragging}
            onDragEnter={(event) => {
              event.preventDefault();

              if (!isSourceProcessing) {
                setIsSourceDragging(true);
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDragLeave={() => {
              setIsSourceDragging(false);
            }}
            onDrop={handleSourceDrop}
          >
            {isSourceProcessing ? (
              <>
                <ImageOff size={28} aria-hidden="true" />
                <span>Processing</span>
              </>
            ) : (
              <>
                <label className="empty-preview-upload" htmlFor={sourceInputId}>
                  <ImagePlus size={28} aria-hidden="true" />
                  <span>Drop images here or choose files</span>
                </label>
                <input
                  id={sourceInputId}
                  type="file"
                  accept={supportedInputImageAccept}
                  multiple
                  onChange={chooseSourceImages}
                />
              </>
            )}
          </div>
        ) : (
          <img src={sourceUrl} alt="Original upload" onError={onSourceError} />
        )}
      </figure>

      <figure className="preview-frame">
        <figcaption>{presetLabel}</figcaption>
        {outputUrl === null ? (
          <div className="empty-preview">
            <ImageOff size={28} aria-hidden="true" />
            {isProcessing ? <span>Processing</span> : null}
          </div>
        ) : (
          <img src={outputUrl} alt={`${presetLabel} output`} />
        )}
      </figure>
    </section>
  );
}
