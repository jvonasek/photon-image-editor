import { useCallback, useRef, useState } from 'react'
import ReactCrop from 'react-image-crop'
import type { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AdjustmentsControls } from './AdjustmentsControls'
import { CropControls } from './CropControls'
import { FilterControls } from './FilterControls'
import { ResizeControls } from './ResizeControls'
import type { ImageFormat, ImageDimensions } from '@/types'

interface ImageEditorProps {
  imageUrl: string
  currentDimensions: ImageDimensions
  format: ImageFormat
  fileName: string
  isProcessing: boolean
  selectedFilter: string | null
  brightness: number
  contrast: number
  onCrop: (crop: PixelCrop, displayDimensions: ImageDimensions) => void
  onResize: (dimensions: ImageDimensions) => void
  onFilterChange: (name: string | null) => void
  onBrightnessChange: (value: number) => void
  onContrastChange: (value: number) => void
  onDownload: () => void
  onReset: () => void
}

export function ImageEditor({
  imageUrl,
  currentDimensions,
  format,
  fileName,
  isProcessing,
  selectedFilter,
  brightness,
  contrast,
  onCrop,
  onResize,
  onFilterChange,
  onBrightnessChange,
  onContrastChange,
  onDownload,
  onReset,
}: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)

  const handleApplyCrop = useCallback(() => {
    if (!completedCrop || !imgRef.current) return
    const displayDimensions: ImageDimensions = {
      width: imgRef.current.width,
      height: imgRef.current.height,
    }
    onCrop(completedCrop, displayDimensions)
    setCrop(undefined)
    setCompletedCrop(undefined)
  }, [completedCrop, onCrop])

  const handleClearCrop = useCallback(() => {
    setCrop(undefined)
    setCompletedCrop(undefined)
  }, [])

  const formatLabel = format === 'image/jpeg' ? 'JPEG' : format === 'image/webp' ? 'WebP' : 'PNG'

  return (
    <div className="flex gap-6 w-full max-w-6xl mx-auto">
      <div className="flex-1 min-w-0">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          disabled={isProcessing}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Editor preview"
            className="max-w-full max-h-[70vh] object-contain"
          />
        </ReactCrop>
      </div>

      <div className="w-64 shrink-0 space-y-4">
        <div>
          <h3 className="text-sm font-medium">Info</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {fileName}
          </p>
          <p className="text-xs text-muted-foreground">
            {currentDimensions.width} x {currentDimensions.height} px &middot; {formatLabel}
          </p>
        </div>

        <Separator />

        <FilterControls
          value={selectedFilter}
          onChange={onFilterChange}
          disabled={isProcessing}
        />

        <Separator />

        <AdjustmentsControls
          brightness={brightness}
          contrast={contrast}
          onBrightnessChange={onBrightnessChange}
          onContrastChange={onContrastChange}
          disabled={isProcessing}
        />

        <Separator />

        <CropControls
          crop={completedCrop}
          onApply={handleApplyCrop}
          onClear={handleClearCrop}
          isProcessing={isProcessing}
        />

        <Separator />

        <ResizeControls
          currentDimensions={currentDimensions}
          onApply={onResize}
          isProcessing={isProcessing}
        />

        <Separator />

        <div className="space-y-2">
          <Button onClick={onDownload} disabled={isProcessing} className="w-full">
            Download
          </Button>
          <Button variant="outline" onClick={onReset} disabled={isProcessing} className="w-full">
            Reset to Original
          </Button>
        </div>

        {isProcessing && (
          <p className="text-xs text-muted-foreground text-center">Processing...</p>
        )}
      </div>
    </div>
  )
}
