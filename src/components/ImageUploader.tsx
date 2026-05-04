import { ImagePlus, Upload } from "lucide-react";
import { useId } from "react";
import type { ReactElement } from "react";

export type ImageUploaderProps = {
  readonly file: File | null;
  readonly onFileSelected: (file: File | null) => void;
};

export function ImageUploader({
  file,
  onFileSelected,
}: ImageUploaderProps): ReactElement {
  const inputId = useId();

  return (
    <section className="upload-panel">
      <label className="upload-target" htmlFor={inputId}>
        <ImagePlus size={22} aria-hidden="true" />
        <span>{file?.name ?? "Choose image"}</span>
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={(event) => {
          onFileSelected(event.currentTarget.files?.[0] ?? null);
        }}
      />
      <button
        type="button"
        className="secondary-button"
        onClick={() => {
          document.getElementById(inputId)?.click();
        }}
      >
        <Upload size={16} aria-hidden="true" />
        Upload
      </button>
    </section>
  );
}
