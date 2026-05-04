import { Download } from "lucide-react";
import type { ReactElement } from "react";

export type ExportPanelProps = {
  readonly outputUrl: string | null;
  readonly filename: string;
  readonly disabled: boolean;
  readonly label?: string;
};

export function ExportPanel({
  outputUrl,
  filename,
  disabled,
  label = "Export JPEG",
}: ExportPanelProps): ReactElement {
  if (disabled || outputUrl === null) {
    return (
      <button type="button" className="primary-button" disabled>
        <Download size={17} aria-hidden="true" />
        {label}
      </button>
    );
  }

  return (
    <a className="primary-button" href={outputUrl} download={filename}>
      <Download size={17} aria-hidden="true" />
      {label}
    </a>
  );
}
