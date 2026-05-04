import { ImageOff } from "lucide-react";
import type { ReactElement } from "react";

export type BeforeAfterPreviewProps = {
  readonly sourceUrl: string | null;
  readonly sourcePreviewNotice: string | null;
  readonly outputUrl: string | null;
  readonly presetLabel: string;
  readonly isSourceProcessing: boolean;
  readonly isProcessing: boolean;
  readonly onSourceError?: () => void;
};

export function BeforeAfterPreview({
  sourceUrl,
  sourcePreviewNotice,
  outputUrl,
  presetLabel,
  isSourceProcessing,
  isProcessing,
  onSourceError,
}: BeforeAfterPreviewProps): ReactElement {
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
          <div className="empty-preview">
            <ImageOff size={28} aria-hidden="true" />
            {isSourceProcessing ? <span>Processing</span> : null}
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
