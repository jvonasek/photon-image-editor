import { computeSlicePlan } from '@/utils/image'

interface SliceOverlayProps {
  naturalWidth: number
  naturalHeight: number
  displayWidth: number
  displayHeight: number
  sliceCount: number
}

export function SliceOverlay({
  naturalWidth,
  naturalHeight,
  displayWidth,
  displayHeight,
  sliceCount,
}: SliceOverlayProps) {
  if (sliceCount < 2 || displayWidth <= 0 || displayHeight <= 0 || naturalWidth <= 0) {
    return null
  }

  const plan = computeSlicePlan(naturalWidth, naturalHeight, sliceCount)
  const scale = displayWidth / naturalWidth
  const cropWidth = sliceCount * plan.sliceWidth
  const leftTrim = Math.max(0, plan.centerOffset) * scale
  const rightTrim = Math.max(0, naturalWidth - (plan.centerOffset + cropWidth)) * scale

  const lines = []
  for (let i = 1; i < sliceCount; i++) {
    const x = (plan.centerOffset + i * plan.sliceWidth) * scale
    if (x < 0 || x > displayWidth) continue
    lines.push(
      <div
        key={i}
        className="absolute top-0 w-px bg-white/70 mix-blend-difference"
        style={{ left: `${x}px`, height: `${displayHeight}px` }}
      />,
    )
  }

  return (
    <div
      className="absolute top-0 left-0 pointer-events-none"
      style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}
    >
      {leftTrim > 0 && (
        <div
          className="absolute top-0 left-0 bg-black/50"
          style={{ width: `${leftTrim}px`, height: `${displayHeight}px` }}
        />
      )}
      {rightTrim > 0 && (
        <div
          className="absolute top-0 right-0 bg-black/50"
          style={{ width: `${rightTrim}px`, height: `${displayHeight}px` }}
        />
      )}
      {lines}
    </div>
  )
}
