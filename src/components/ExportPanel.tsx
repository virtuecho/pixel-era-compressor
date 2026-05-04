import { Download } from "lucide-react";
import type { ReactElement } from "react";

export type ExportPanelProps = {
  readonly outputUrl: string | null;
  readonly filename: string;
  readonly disabled: boolean;
};

export function ExportPanel({
  outputUrl,
  filename,
  disabled,
}: ExportPanelProps): ReactElement {
  if (disabled || outputUrl === null) {
    return (
      <button type="button" className="primary-button" disabled>
        <Download size={17} aria-hidden="true" />
        Export JPEG
      </button>
    );
  }

  return (
    <a className="primary-button" href={outputUrl} download={filename}>
      <Download size={17} aria-hidden="true" />
      Export JPEG
    </a>
  );
}
