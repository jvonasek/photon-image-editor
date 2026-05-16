import type { PixelCrop } from 'react-image-crop'
import { Button } from '@/components/ui/button'

interface CropControlsProps {
  crop: PixelCrop | undefined
  onApply: () => void
  onClear: () => void
  isProcessing: boolean
}

export function CropControls({ crop, onApply, onClear, isProcessing }: CropControlsProps) {
  const hasCrop = crop && crop.width > 0 && crop.height > 0

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Crop</h3>
      {hasCrop ? (
        <p className="text-xs text-muted-foreground">
          Selection: {Math.round(crop.width)} x {Math.round(crop.height)} px
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Draw a selection on the image to crop
        </p>
      )}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={onApply}
          disabled={!hasCrop || isProcessing}
        >
          Apply Crop
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onClear}
          disabled={!hasCrop || isProcessing}
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
