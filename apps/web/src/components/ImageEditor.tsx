import { useCallback, useEffect, useRef, useState } from 'react'
import ReactCrop from 'react-image-crop'
import type { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarToolbar } from './SidebarToolbar'
import { SliceOverlay } from './SliceOverlay'
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
  blur: number
  sliceCount: number
  isLandscape: boolean
  onCrop: (crop: PixelCrop, displayDimensions: ImageDimensions) => void
  onResize: (dimensions: ImageDimensions) => void
  onFilterChange: (name: string | null) => void
  onBrightnessChange: (value: number) => void
  onContrastChange: (value: number) => void
  onBlurChange: (value: number) => void
  onSliceCountChange: (delta: -1 | 1) => void
  onSliceDownload: () => void
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
  blur,
  sliceCount,
  isLandscape,
  onCrop,
  onResize,
  onFilterChange,
  onBrightnessChange,
  onContrastChange,
  onBlurChange,
  onSliceCountChange,
  onSliceDownload,
  onReset,
}: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [displaySize, setDisplaySize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [activeTab, setActiveTab] = useState('adjustments')
  const imgRef = useRef<HTMLImageElement>(null)

  const updateDisplaySize = useCallback(() => {
    if (!imgRef.current) return
    setDisplaySize({ width: imgRef.current.width, height: imgRef.current.height })
  }, [])

  useEffect(() => {
    if (!imgRef.current || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => updateDisplaySize())
    observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [updateDisplaySize, imageUrl])

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
    <div className="flex-1 min-h-0 flex w-full">
      <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center overflow-hidden p-4">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          disabled={isProcessing}
          className="max-h-full max-w-full"
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Editor preview"
            className="max-w-full max-h-[calc(100vh-12rem)] object-contain"
            onLoad={updateDisplaySize}
          />
          {isLandscape && activeTab === 'slice' && (
            <SliceOverlay
              naturalWidth={currentDimensions.width}
              naturalHeight={currentDimensions.height}
              displayWidth={displaySize.width}
              displayHeight={displaySize.height}
              sliceCount={sliceCount}
            />
          )}
        </ReactCrop>
      </div>

      <div className="w-80 shrink-0 border-l flex flex-col">
        <SidebarToolbar
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          selectedFilter={selectedFilter}
          brightness={brightness}
          contrast={contrast}
          blur={blur}
          sliceCount={sliceCount}
          isLandscape={isLandscape}
          isProcessing={isProcessing}
          currentDimensions={currentDimensions}
          completedCrop={completedCrop}
          fileName={fileName}
          formatLabel={formatLabel}
          onFilterChange={onFilterChange}
          onBrightnessChange={onBrightnessChange}
          onContrastChange={onContrastChange}
          onBlurChange={onBlurChange}
          onCropApply={handleApplyCrop}
          onCropClear={handleClearCrop}
          onResize={onResize}
          onSliceCountChange={onSliceCountChange}
          onSliceDownload={onSliceDownload}
        />

        <Separator />

        <div className="p-4 space-y-2 shrink-0">
          <Button variant="outline" onClick={onReset} disabled={isProcessing} className="w-full">
            Reset to Original
          </Button>
          {isProcessing && (
            <p className="text-xs text-muted-foreground text-center">Processing...</p>
          )}
        </div>
      </div>
    </div>
  )
}
