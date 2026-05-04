import { ImagePlus, Upload } from "lucide-react";
import { useId, useState } from "react";
import type { ReactElement } from "react";
import { supportedInputImageAccept } from "../imaging/codecs/input-image";

export type ImageUploaderProps = {
  readonly file: File | null;
  readonly onFileSelected: (file: File | null) => void;
};

export function ImageUploader({
  file,
  onFileSelected,
}: ImageUploaderProps): ReactElement {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);

  function chooseFirstImage(files: FileList | null): void {
    onFileSelected(files?.[0] ?? null);
  }

  return (
    <section
      className="upload-panel"
      data-dragging={isDragging}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDragLeave={() => {
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        chooseFirstImage(event.dataTransfer.files);
      }}
    >
      <label className="upload-target" htmlFor={inputId}>
        <ImagePlus size={22} aria-hidden="true" />
        <span>{file?.name ?? "Drop image here or choose file"}</span>
      </label>
      <input
        id={inputId}
        type="file"
        accept={supportedInputImageAccept}
        onChange={(event) => {
          chooseFirstImage(event.currentTarget.files);
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
