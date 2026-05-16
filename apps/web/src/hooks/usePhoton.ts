import { useCallback, useEffect, useRef, useState } from 'react'
import type { PixelCrop } from 'react-image-crop'
import type { ImageFormat, ImageDimensions } from '@/types'
import { applyFilter } from '@/lib/filters'

type PhotonModule = typeof import('@silvia-odwyer/photon')

export interface Adjustments {
  brightness: number
  contrast: number
}

function applyAdjustments(
  photon: PhotonModule,
  img: import('@silvia-odwyer/photon').PhotonImage,
  brightness: number,
  contrast: number,
): void {
  if (brightness !== 0) {
    photon.adjust_brightness(img, brightness)
  }
  if (contrast !== 0) {
    photon.adjust_contrast(img, contrast)
  }
}

export function usePhoton() {
  const [isReady, setIsReady] = useState(false)
  const photonRef = useRef<PhotonModule | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const photon = await import('@silvia-odwyer/photon')
      const init = photon.default
      await init()
      if (!cancelled) {
        photonRef.current = photon
        setIsReady(true)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const processImage = useCallback(async (
    sourceBytes: Uint8Array,
    crop: PixelCrop | null,
    resizeDimensions: ImageDimensions | null,
    format: ImageFormat,
    displayDimensions: ImageDimensions | null,
    naturalDimensions: ImageDimensions | null,
    filterName: string | null = null,
    adjustments: Adjustments | null = null,
  ): Promise<Uint8Array> => {
    const photon = photonRef.current
    if (!photon) throw new Error('Photon not initialized')

    let img = photon.PhotonImage.new_from_byteslice(sourceBytes)

    try {
      if (crop && displayDimensions && naturalDimensions) {
        const scaleX = naturalDimensions.width / displayDimensions.width
        const scaleY = naturalDimensions.height / displayDimensions.height

        const x1 = Math.round(crop.x * scaleX)
        const y1 = Math.round(crop.y * scaleY)
        const x2 = Math.round((crop.x + crop.width) * scaleX)
        const y2 = Math.round((crop.y + crop.height) * scaleY)

        const cropped = photon.crop(img, x1, y1, x2, y2)
        img.free()
        img = cropped
      }

      if (resizeDimensions) {
        const resized = photon.resize(
          img,
          resizeDimensions.width,
          resizeDimensions.height,
          photon.SamplingFilter.Lanczos3,
        )
        img.free()
        img = resized
      }

      if (adjustments) {
        applyAdjustments(photon, img, adjustments.brightness, adjustments.contrast)
      }

      if (filterName) {
        applyFilter(photon, img, filterName)
      }

      let result: Uint8Array
      switch (format) {
        case 'image/jpeg':
          result = img.get_bytes_jpeg(85)
          break
        case 'image/webp':
          result = img.get_bytes_webp()
          break
        case 'image/png':
        default:
          result = img.get_bytes()
          break
      }

      return result
    } finally {
      img.free()
    }
  }, [])

  const applyAdjustmentsPreview = useCallback(async (
    sourceBytes: Uint8Array,
    brightness: number,
    contrast: number,
    filterName: string | null,
  ): Promise<Uint8Array> => {
    const photon = photonRef.current
    if (!photon) throw new Error('Photon not initialized')

    const img = photon.PhotonImage.new_from_byteslice(sourceBytes)
    try {
      applyAdjustments(photon, img, brightness, contrast)
      if (filterName) {
        applyFilter(photon, img, filterName)
      }
      return img.get_bytes()
    } finally {
      img.free()
    }
  }, [])

  return { isReady, processImage, applyAdjustmentsPreview }
}
