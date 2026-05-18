import { Button } from '@/components/ui/button'

interface SliceControlsProps {
  sliceCount: number
  isLandscape: boolean
  isProcessing: boolean
  onSliceCountChange: (delta: -1 | 1) => void
  onDownload: () => void
}

export function SliceControls({
  sliceCount,
  isLandscape,
  isProcessing,
  onSliceCountChange,
  onDownload,
}: SliceControlsProps) {
  const disabled = !isLandscape || isProcessing
  const minusDisabled = disabled || sliceCount <= 2

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Instagram Slices</h3>
      <p className="text-xs text-muted-foreground">4:5 per slice</p>

      {!isLandscape && (
        <p className="text-xs text-muted-foreground">Only available for landscape images.</p>
      )}

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSliceCountChange(-1)}
          disabled={minusDisabled}
          aria-label="Decrease slice count"
          className="h-8 w-8 p-0"
        >
          −
        </Button>
        <span className="text-sm tabular-nums min-w-8 text-center">{sliceCount}</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSliceCountChange(1)}
          disabled={disabled}
          aria-label="Increase slice count"
          className="h-8 w-8 p-0"
        >
          +
        </Button>
      </div>

      <Button
        size="sm"
        onClick={onDownload}
        disabled={disabled}
        className="w-full"
      >
        Download Slices
      </Button>
    </div>
  )
}
