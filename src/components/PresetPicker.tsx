import type { ReactElement } from "react";
import { sortCameraPresetsByEra } from "../imaging/presets/camera-presets";
import type { CameraPreset } from "../imaging/presets/preset-types";

// Presets are grouped by output context but sorted by year inside each group so
// the menu reads like a small timeline rather than an alphabetical list.
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

// The select stays intentionally native for mobile ergonomics and keyboard
// accessibility; the richer preset meaning lives in the data model.
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
            {sortCameraPresetsByEra(
              presets.filter((preset) => preset.category === category.value),
            ).map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.year} - {preset.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
