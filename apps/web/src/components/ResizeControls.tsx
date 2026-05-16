import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Toggle } from '@/components/ui/toggle'
import type { ImageDimensions } from '@/types'

interface ResizeControlsProps {
  currentDimensions: ImageDimensions
  onApply: (dimensions: ImageDimensions) => void
  isProcessing: boolean
}

export function ResizeControls({ currentDimensions, onApply, isProcessing }: ResizeControlsProps) {
  const [width, setWidth] = useState(currentDimensions.width)
  const [height, setHeight] = useState(currentDimensions.height)
  const [lockAspect, setLockAspect] = useState(true)
  const aspectRatio = useRef(currentDimensions.width / currentDimensions.height)

  useEffect(() => {
    setWidth(currentDimensions.width)
    setHeight(currentDimensions.height)
    aspectRatio.current = currentDimensions.width / currentDimensions.height
  }, [currentDimensions])

  const handleWidthChange = useCallback((value: string) => {
    const w = parseInt(value, 10)
    if (isNaN(w) || w < 1) return
    setWidth(w)
    if (lockAspect) {
      setHeight(Math.round(w / aspectRatio.current))
    }
  }, [lockAspect])

  const handleHeightChange = useCallback((value: string) => {
    const h = parseInt(value, 10)
    if (isNaN(h) || h < 1) return
    setHeight(h)
    if (lockAspect) {
      setWidth(Math.round(h * aspectRatio.current))
    }
  }, [lockAspect])

  const isUnchanged = width === currentDimensions.width && height === currentDimensions.height

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Resize</h3>
      <div className="flex items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="resize-width" className="text-xs">Width</Label>
          <Input
            id="resize-width"
            type="number"
            min={1}
            value={width}
            onChange={(e) => handleWidthChange(e.target.value)}
            className="h-8 w-24"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="resize-height" className="text-xs">Height</Label>
          <Input
            id="resize-height"
            type="number"
            min={1}
            value={height}
            onChange={(e) => handleHeightChange(e.target.value)}
            className="h-8 w-24"
          />
        </div>
        <Toggle
          pressed={lockAspect}
          onPressedChange={setLockAspect}
          size="sm"
          aria-label="Lock aspect ratio"
          className="h-8"
        >
          {lockAspect ? '🔒' : '🔓'}
        </Toggle>
      </div>
      <Button
        size="sm"
        onClick={() => onApply({ width, height })}
        disabled={isUnchanged || isProcessing}
      >
        Apply Resize
      </Button>
    </div>
  )
}
