import type { ReactElement } from "react";
import type { CameraPreset } from "../imaging/presets/preset-types";

export type PresetPickerProps = {
  readonly presets: readonly CameraPreset[];
  readonly selectedPresetId: string;
  readonly onPresetChange: (presetId: string) => void;
};

const categories = [
  { value: "web-preset", label: "Web" },
  { value: "phone", label: "Phones" },
  { value: "compact-camera", label: "Compact cameras" },
  { value: "dslr", label: "DSLR" },
] as const satisfies readonly {
  readonly value: CameraPreset["category"];
  readonly label: string;
}[];

export function PresetPicker({
  presets,
  selectedPresetId,
  onPresetChange,
}: PresetPickerProps): ReactElement {
  return (
    <label className="field-label">
      <span>Preset</span>
      <select
        value={selectedPresetId}
        onChange={(event) => {
          onPresetChange(event.currentTarget.value);
        }}
      >
        {categories.map((category) => (
          <optgroup key={category.value} label={category.label}>
            {presets
              .filter((preset) => preset.category === category.value)
              .map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
