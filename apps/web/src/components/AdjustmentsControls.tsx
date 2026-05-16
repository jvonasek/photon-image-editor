import { Slider } from '@/components/ui/slider'

interface AdjustmentsControlsProps {
  brightness: number
  contrast: number
  onBrightnessChange: (value: number) => void
  onContrastChange: (value: number) => void
  disabled: boolean
}

export function AdjustmentsControls({
  brightness,
  contrast,
  onBrightnessChange,
  onContrastChange,
  disabled,
}: AdjustmentsControlsProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Adjustments</h3>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Brightness</label>
          <button
            type="button"
            onClick={() => onBrightnessChange(0)}
            disabled={disabled}
            className="text-xs tabular-nums text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:hover:text-muted-foreground"
            aria-label="Reset brightness to 0"
          >
            {brightness}
          </button>
        </div>
        <Slider
          min={-100}
          max={100}
          step={1}
          value={[brightness]}
          onValueChange={(v) => onBrightnessChange(v[0] ?? 0)}
          disabled={disabled}
        />
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Contrast</label>
          <button
            type="button"
            onClick={() => onContrastChange(0)}
            disabled={disabled}
            className="text-xs tabular-nums text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:hover:text-muted-foreground"
            aria-label="Reset contrast to 0"
          >
            {contrast}
          </button>
        </div>
        <Slider
          min={-100}
          max={100}
          step={1}
          value={[contrast]}
          onValueChange={(v) => onContrastChange(v[0] ?? 0)}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
