import type { ImageFormat } from '@/types'

export function detectFormat(file: File): ImageFormat {
  if (file.type === 'image/jpeg') return 'image/jpeg'
  if (file.type === 'image/webp') return 'image/webp'
  return 'image/png'
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer()
}

export function getExtension(format: ImageFormat): string {
  switch (format) {
    case 'image/jpeg': return 'jpg'
    case 'image/webp': return 'webp'
    case 'image/png': return 'png'
  }
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

export function downloadBlob(bytes: Uint8Array, filename: string, mimeType: string) {
  const blob = new Blob([toArrayBuffer(bytes)], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function bytesToObjectUrl(bytes: Uint8Array, mimeType: string): string {
  const blob = new Blob([toArrayBuffer(bytes)], { type: mimeType })
  return URL.createObjectURL(blob)
}

export interface SliceRect {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface SlicePlan {
  centerOffset: number
  sliceWidth: number
  slices: SliceRect[]
}

export function computeSlicePlan(width: number, height: number, n: number): SlicePlan {
  const sliceWidth = Math.round(height * 0.8)
  const cropWidth = n * sliceWidth
  const centerOffset = Math.round((width - cropWidth) / 2)
  const slices: SliceRect[] = []
  for (let i = 0; i < n; i++) {
    slices.push({
      x1: centerOffset + i * sliceWidth,
      y1: 0,
      x2: centerOffset + (i + 1) * sliceWidth,
      y2: height,
    })
  }
  return { centerOffset, sliceWidth, slices }
}

export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = reject
    img.src = url
  })
}
