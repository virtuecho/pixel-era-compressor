import { ImagePlus, Upload } from "lucide-react";
import { useId, useState } from "react";
import type { ReactElement } from "react";
import { supportedInputImageAccept } from "../imaging/codecs/input-image";

export type ImageUploaderProps = {
  readonly files: readonly File[];
  readonly onFilesSelected: (files: readonly File[]) => void;
};

export function ImageUploader({
  files,
  onFilesSelected,
}: ImageUploaderProps): ReactElement {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);

  function chooseImages(fileList: FileList | null): void {
    const selectedFiles = fileList === null ? [] : Array.from(fileList);

    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    }
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
        chooseImages(event.dataTransfer.files);
      }}
    >
      <label className="upload-target" htmlFor={inputId}>
        <ImagePlus size={22} aria-hidden="true" />
        <span>{formatUploadLabel(files)}</span>
      </label>
      <input
        id={inputId}
        type="file"
        accept={supportedInputImageAccept}
        multiple
        onChange={(event) => {
          chooseImages(event.currentTarget.files);
          event.currentTarget.value = "";
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

function formatUploadLabel(files: readonly File[]): string {
  if (files.length === 0) {
    return "Drop images here or choose files";
  }

  if (files.length === 1) {
    return files[0]?.name ?? "1 image selected";
  }

  return `${String(files.length)} images selected`;
}
