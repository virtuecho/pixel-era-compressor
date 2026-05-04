import { ImageOff } from "lucide-react";
import type { ReactElement } from "react";

export type BeforeAfterPreviewProps = {
  readonly sourceUrl: string | null;
  readonly outputUrl: string | null;
  readonly presetLabel: string;
  readonly isProcessing: boolean;
};

export function BeforeAfterPreview({
  sourceUrl,
  outputUrl,
  presetLabel,
  isProcessing,
}: BeforeAfterPreviewProps): ReactElement {
  return (
    <section className="comparison-grid" aria-label="Before and after preview">
      <figure className="preview-frame">
        <figcaption>Original</figcaption>
        {sourceUrl === null ? (
          <div className="empty-preview">
            <ImageOff size={28} aria-hidden="true" />
          </div>
        ) : (
          <img src={sourceUrl} alt="Original upload" />
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
