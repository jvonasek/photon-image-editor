import { useCallback, useEffect, useRef, useState } from 'react'
import type { PixelCrop } from 'react-image-crop'
import { AppMenubar } from '@/components/AppMenubar'
import { ImageDropzone } from '@/components/ImageDropzone'
import { ImageEditor } from '@/components/ImageEditor'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { usePhoton } from '@/hooks/usePhoton'
import { detectFormat, readFileAsArrayBuffer, getExtension, downloadBlob, bytesToObjectUrl, getImageDimensions } from '@/utils/image'
import type { ImageFormat, ImageDimensions } from '@/types'

const PREVIEW_DEBOUNCE_MS = 75

function App() {
  const { isReady, processImage, applyAdjustmentsPreview } = usePhoton()

  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions | null>(null)

  const [editedImageBytes, setEditedImageBytes] = useState<Uint8Array | null>(null)
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null)
  const [currentDimensions, setCurrentDimensions] = useState<ImageDimensions | null>(null)

  const [inputFormat, setInputFormat] = useState<ImageFormat>('image/png')
  const [isProcessing, setIsProcessing] = useState(false)

  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(0)
  const [blur, setBlur] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const prevEditedUrl = useRef<string | null>(null)
  const prevOriginalUrl = useRef<string | null>(null)
  const prevPreviewUrl = useRef<string | null>(null)
  const previewReqId = useRef(0)
  const previewTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (prevEditedUrl.current) URL.revokeObjectURL(prevEditedUrl.current)
      if (prevOriginalUrl.current) URL.revokeObjectURL(prevOriginalUrl.current)
      if (prevPreviewUrl.current) URL.revokeObjectURL(prevPreviewUrl.current)
      if (previewTimer.current !== null) window.clearTimeout(previewTimer.current)
    }
  }, [])

  const clearPreview = useCallback(() => {
    previewReqId.current++
    if (previewTimer.current !== null) {
      window.clearTimeout(previewTimer.current)
      previewTimer.current = null
    }
    if (prevPreviewUrl.current) URL.revokeObjectURL(prevPreviewUrl.current)
    prevPreviewUrl.current = null
    setPreviewUrl(null)
  }, [])

  const schedulePreview = useCallback((
    brightnessValue: number,
    contrastValue: number,
    filterName: string | null,
    blurValue: number,
    sourceBytesOverride?: Uint8Array,
  ) => {
    if (!originalFile) return

    if (brightnessValue === 0 && contrastValue === 0 && !filterName && blurValue === 0) {
      clearPreview()
      return
    }

    if (previewTimer.current !== null) {
      window.clearTimeout(previewTimer.current)
    }

    const myId = ++previewReqId.current
    previewTimer.current = window.setTimeout(async () => {
      previewTimer.current = null
      try {
        let sourceBytes: Uint8Array
        if (sourceBytesOverride) {
          sourceBytes = sourceBytesOverride
        } else if (editedImageBytes) {
          sourceBytes = editedImageBytes
        } else {
          const buf = await readFileAsArrayBuffer(originalFile)
          sourceBytes = new Uint8Array(buf)
        }

        const previewBytes = await applyAdjustmentsPreview(
          sourceBytes,
          brightnessValue,
          contrastValue,
          filterName,
          blurValue,
        )
        if (myId !== previewReqId.current) return
        const url = bytesToObjectUrl(previewBytes, 'image/png')
        if (prevPreviewUrl.current) URL.revokeObjectURL(prevPreviewUrl.current)
        prevPreviewUrl.current = url
        setPreviewUrl(url)
      } catch {
        // ignore preview errors
      }
    }, PREVIEW_DEBOUNCE_MS)
  }, [originalFile, editedImageBytes, applyAdjustmentsPreview, clearPreview])

  const handleFileAccepted = useCallback(async (file: File) => {
    const format = detectFormat(file)
    setInputFormat(format)
    setOriginalFile(file)

    if (prevOriginalUrl.current) URL.revokeObjectURL(prevOriginalUrl.current)
    if (prevEditedUrl.current) URL.revokeObjectURL(prevEditedUrl.current)

    const url = URL.createObjectURL(file)
    prevOriginalUrl.current = url
    setOriginalImageUrl(url)

    const dims = await getImageDimensions(url)
    setOriginalDimensions(dims)
    setCurrentDimensions(dims)

    setEditedImageBytes(null)
    setEditedImageUrl(null)
    prevEditedUrl.current = null

    setSelectedFilter(null)
    setBrightness(0)
    setContrast(0)
    setBlur(0)
    clearPreview()
  }, [clearPreview])

  const handleCrop = useCallback(async (crop: PixelCrop, displayDimensions: ImageDimensions) => {
    if (!originalFile || !currentDimensions) return
    setIsProcessing(true)
    try {
      let sourceBytes: Uint8Array
      if (editedImageBytes) {
        sourceBytes = editedImageBytes
      } else {
        const buf = await readFileAsArrayBuffer(originalFile)
        sourceBytes = new Uint8Array(buf)
      }

      const result = await processImage(
        sourceBytes,
        crop,
        null,
        inputFormat,
        displayDimensions,
        currentDimensions,
        null,
        null,
      )

      if (prevEditedUrl.current) URL.revokeObjectURL(prevEditedUrl.current)
      const newUrl = bytesToObjectUrl(result, inputFormat)
      prevEditedUrl.current = newUrl

      setEditedImageBytes(result)
      setEditedImageUrl(newUrl)

      const newDims = await getImageDimensions(newUrl)
      setCurrentDimensions(newDims)

      if (brightness !== 0 || contrast !== 0 || selectedFilter || blur !== 0) {
        schedulePreview(brightness, contrast, selectedFilter, blur, result)
      } else {
        clearPreview()
      }
    } finally {
      setIsProcessing(false)
    }
  }, [originalFile, editedImageBytes, currentDimensions, inputFormat, processImage, selectedFilter, brightness, contrast, blur, schedulePreview, clearPreview])

  const handleResize = useCallback(async (dimensions: ImageDimensions) => {
    if (!originalFile) return
    setIsProcessing(true)
    try {
      let sourceBytes: Uint8Array
      if (editedImageBytes) {
        sourceBytes = editedImageBytes
      } else {
        const buf = await readFileAsArrayBuffer(originalFile)
        sourceBytes = new Uint8Array(buf)
      }

      const result = await processImage(
        sourceBytes,
        null,
        dimensions,
        inputFormat,
        null,
        null,
        null,
        null,
      )

      if (prevEditedUrl.current) URL.revokeObjectURL(prevEditedUrl.current)
      const newUrl = bytesToObjectUrl(result, inputFormat)
      prevEditedUrl.current = newUrl

      setEditedImageBytes(result)
      setEditedImageUrl(newUrl)
      setCurrentDimensions(dimensions)

      if (brightness !== 0 || contrast !== 0 || selectedFilter || blur !== 0) {
        schedulePreview(brightness, contrast, selectedFilter, blur, result)
      } else {
        clearPreview()
      }
    } finally {
      setIsProcessing(false)
    }
  }, [originalFile, editedImageBytes, inputFormat, processImage, selectedFilter, brightness, contrast, blur, schedulePreview, clearPreview])

  const handleFilterChange = useCallback((name: string | null) => {
    setSelectedFilter(name)
    schedulePreview(brightness, contrast, name, blur)
  }, [brightness, contrast, blur, schedulePreview])

  const handleBrightnessChange = useCallback((value: number) => {
    setBrightness(value)
    schedulePreview(value, contrast, selectedFilter, blur)
  }, [contrast, selectedFilter, blur, schedulePreview])

  const handleContrastChange = useCallback((value: number) => {
    setContrast(value)
    schedulePreview(brightness, value, selectedFilter, blur)
  }, [brightness, selectedFilter, blur, schedulePreview])

  const handleBlurChange = useCallback((value: number) => {
    setBlur(value)
    schedulePreview(brightness, contrast, selectedFilter, value)
  }, [brightness, contrast, selectedFilter, schedulePreview])

  const handleDownload = useCallback(async () => {
    if (!originalFile) return
    const ext = getExtension(inputFormat)
    const baseName = originalFile.name.replace(/\.[^.]+$/, '')
    const filename = `edited-${baseName}.${ext}`

    if (selectedFilter || brightness !== 0 || contrast !== 0 || blur !== 0) {
      let sourceBytes: Uint8Array
      if (editedImageBytes) {
        sourceBytes = editedImageBytes
      } else {
        const buf = await readFileAsArrayBuffer(originalFile)
        sourceBytes = new Uint8Array(buf)
      }
      const result = await processImage(
        sourceBytes,
        null,
        null,
        inputFormat,
        null,
        null,
        selectedFilter,
        { brightness, contrast },
        blur,
      )
      downloadBlob(result, filename, inputFormat)
      return
    }

    if (editedImageBytes) {
      downloadBlob(editedImageBytes, filename, inputFormat)
    } else {
      const buf = await originalFile.arrayBuffer()
      downloadBlob(new Uint8Array(buf), filename, inputFormat)
    }
  }, [originalFile, editedImageBytes, inputFormat, selectedFilter, brightness, contrast, blur, processImage])

  const handleNewImage = useCallback(() => {
    if (prevEditedUrl.current) URL.revokeObjectURL(prevEditedUrl.current)
    if (prevOriginalUrl.current) URL.revokeObjectURL(prevOriginalUrl.current)
    prevEditedUrl.current = null
    prevOriginalUrl.current = null
    setOriginalFile(null)
    setOriginalImageUrl(null)
    setOriginalDimensions(null)
    setEditedImageBytes(null)
    setEditedImageUrl(null)
    setCurrentDimensions(null)
    setSelectedFilter(null)
    setBrightness(0)
    setContrast(0)
    setBlur(0)
    clearPreview()
  }, [clearPreview])

  const handleReset = useCallback(() => {
    if (prevEditedUrl.current) URL.revokeObjectURL(prevEditedUrl.current)
    prevEditedUrl.current = null
    setEditedImageBytes(null)
    setEditedImageUrl(null)
    setSelectedFilter(null)
    setBrightness(0)
    setContrast(0)
    setBlur(0)
    clearPreview()
    if (originalDimensions) setCurrentDimensions(originalDimensions)
  }, [originalDimensions, clearPreview])

  const displayUrl = previewUrl ?? editedImageUrl ?? originalImageUrl

  const canDownload = Boolean(displayUrl) && !isProcessing

  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b shrink-0">
        <AppMenubar hasImage={Boolean(originalFile)} onNewImage={handleNewImage} />
        <ThemeToggle />
      </header>

      <main className="flex-1 min-h-0 flex">
        {!isReady && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading image engine...</p>
          </div>
        )}

        {isReady && !displayUrl && (
          <div className="flex-1 flex items-center justify-center p-6">
            <ImageDropzone onFileAccepted={handleFileAccepted} />
          </div>
        )}

        {isReady && displayUrl && currentDimensions && originalFile && (
          <ImageEditor
            imageUrl={displayUrl}
            currentDimensions={currentDimensions}
            format={inputFormat}
            fileName={originalFile.name}
            isProcessing={isProcessing}
            selectedFilter={selectedFilter}
            brightness={brightness}
            contrast={contrast}
            blur={blur}
            onCrop={handleCrop}
            onResize={handleResize}
            onFilterChange={handleFilterChange}
            onBrightnessChange={handleBrightnessChange}
            onContrastChange={handleContrastChange}
            onBlurChange={handleBlurChange}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="flex items-stretch border-t shrink-0">
        <div className="flex-1 flex items-center px-6 py-3 text-sm text-muted-foreground">
          All image processing is done locally. None of your files leave your device.
        </div>
        {displayUrl && (
          <div className="w-80 shrink-0 border-l px-4 py-3 flex items-center">
            <Button onClick={handleDownload} disabled={!canDownload} className="w-full">
              Download
            </Button>
          </div>
        )}
      </footer>
    </div>
  )
}

export default App
