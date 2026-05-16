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

export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = reject
    img.src = url
  })
}
