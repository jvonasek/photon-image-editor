import { useCallback, useEffect, useRef, useState } from 'react'
import type { PixelCrop } from 'react-image-crop'
import { ImageDropzone } from '@/components/ImageDropzone'
import { ImageEditor } from '@/components/ImageEditor'
import { ThemeToggle } from '@/components/ThemeToggle'
import { usePhoton } from '@/hooks/usePhoton'
import { detectFormat, readFileAsArrayBuffer, getExtension, downloadBlob, bytesToObjectUrl, getImageDimensions } from '@/utils/image'
import type { ImageFormat, ImageDimensions } from '@/types'

function App() {
  const { isReady, processImage, applyFilterPreview } = usePhoton()

  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions | null>(null)

  const [editedImageBytes, setEditedImageBytes] = useState<Uint8Array | null>(null)
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null)
  const [currentDimensions, setCurrentDimensions] = useState<ImageDimensions | null>(null)

  const [inputFormat, setInputFormat] = useState<ImageFormat>('image/png')
  const [isProcessing, setIsProcessing] = useState(false)

  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [filterPreviewUrl, setFilterPreviewUrl] = useState<string | null>(null)

  const prevEditedUrl = useRef<string | null>(null)
  const prevOriginalUrl = useRef<string | null>(null)
  const prevFilterPreviewUrl = useRef<string | null>(null)
  const filterPreviewReqId = useRef(0)

  useEffect(() => {
    return () => {
      if (prevEditedUrl.current) URL.revokeObjectURL(prevEditedUrl.current)
      if (prevOriginalUrl.current) URL.revokeObjectURL(prevOriginalUrl.current)
      if (prevFilterPreviewUrl.current) URL.revokeObjectURL(prevFilterPreviewUrl.current)
    }
  }, [])

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

    filterPreviewReqId.current++
    setSelectedFilter(null)
    if (prevFilterPreviewUrl.current) URL.revokeObjectURL(prevFilterPreviewUrl.current)
    prevFilterPreviewUrl.current = null
    setFilterPreviewUrl(null)
  }, [])

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
      )

      if (prevEditedUrl.current) URL.revokeObjectURL(prevEditedUrl.current)
      const newUrl = bytesToObjectUrl(result, inputFormat)
      prevEditedUrl.current = newUrl

      setEditedImageBytes(result)
      setEditedImageUrl(newUrl)

      const newDims = await getImageDimensions(newUrl)
      setCurrentDimensions(newDims)

      if (selectedFilter) {
        const myId = ++filterPreviewReqId.current
        const previewBytes = await applyFilterPreview(result, selectedFilter)
        if (myId === filterPreviewReqId.current) {
          const previewUrl = bytesToObjectUrl(previewBytes, 'image/png')
          if (prevFilterPreviewUrl.current) URL.revokeObjectURL(prevFilterPreviewUrl.current)
          prevFilterPreviewUrl.current = previewUrl
          setFilterPreviewUrl(previewUrl)
        }
      }
    } finally {
      setIsProcessing(false)
    }
  }, [originalFile, editedImageBytes, currentDimensions, inputFormat, processImage, selectedFilter, applyFilterPreview])

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
      )

      if (prevEditedUrl.current) URL.revokeObjectURL(prevEditedUrl.current)
      const newUrl = bytesToObjectUrl(result, inputFormat)
      prevEditedUrl.current = newUrl

      setEditedImageBytes(result)
      setEditedImageUrl(newUrl)
      setCurrentDimensions(dimensions)

      if (selectedFilter) {
        const myId = ++filterPreviewReqId.current
        const previewBytes = await applyFilterPreview(result, selectedFilter)
        if (myId === filterPreviewReqId.current) {
          const previewUrl = bytesToObjectUrl(previewBytes, 'image/png')
          if (prevFilterPreviewUrl.current) URL.revokeObjectURL(prevFilterPreviewUrl.current)
          prevFilterPreviewUrl.current = previewUrl
          setFilterPreviewUrl(previewUrl)
        }
      }
    } finally {
      setIsProcessing(false)
    }
  }, [originalFile, editedImageBytes, inputFormat, processImage, selectedFilter, applyFilterPreview])

  const handleFilterChange = useCallback(async (name: string | null) => {
    setSelectedFilter(name)

    if (!name) {
      filterPreviewReqId.current++
      if (prevFilterPreviewUrl.current) URL.revokeObjectURL(prevFilterPreviewUrl.current)
      prevFilterPreviewUrl.current = null
      setFilterPreviewUrl(null)
      return
    }

    if (!originalFile) return

    const myId = ++filterPreviewReqId.current
    setIsProcessing(true)
    try {
      let sourceBytes: Uint8Array
      if (editedImageBytes) {
        sourceBytes = editedImageBytes
      } else {
        const buf = await readFileAsArrayBuffer(originalFile)
        sourceBytes = new Uint8Array(buf)
      }

      const previewBytes = await applyFilterPreview(sourceBytes, name)
      if (myId !== filterPreviewReqId.current) return

      const newUrl = bytesToObjectUrl(previewBytes, 'image/png')
      if (prevFilterPreviewUrl.current) URL.revokeObjectURL(prevFilterPreviewUrl.current)
      prevFilterPreviewUrl.current = newUrl
      setFilterPreviewUrl(newUrl)
    } finally {
      if (myId === filterPreviewReqId.current) setIsProcessing(false)
    }
  }, [originalFile, editedImageBytes, applyFilterPreview])

  const handleDownload = useCallback(async () => {
    if (!originalFile) return
    const ext = getExtension(inputFormat)
    const baseName = originalFile.name.replace(/\.[^.]+$/, '')
    const filename = `edited-${baseName}.${ext}`

    if (selectedFilter) {
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
  }, [originalFile, editedImageBytes, inputFormat, selectedFilter, processImage])

  const handleReset = useCallback(() => {
    filterPreviewReqId.current++
    if (prevEditedUrl.current) URL.revokeObjectURL(prevEditedUrl.current)
    prevEditedUrl.current = null
    setEditedImageBytes(null)
    setEditedImageUrl(null)
    if (prevFilterPreviewUrl.current) URL.revokeObjectURL(prevFilterPreviewUrl.current)
    prevFilterPreviewUrl.current = null
    setFilterPreviewUrl(null)
    setSelectedFilter(null)
    if (originalDimensions) setCurrentDimensions(originalDimensions)
  }, [originalDimensions])

  const displayUrl = filterPreviewUrl ?? editedImageUrl ?? originalImageUrl

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Photon Image Editor</h1>
        <ThemeToggle />
      </header>

      {!isReady && (
        <p className="text-center text-sm text-muted-foreground">Loading image engine...</p>
      )}

      {isReady && !displayUrl && (
        <ImageDropzone onFileAccepted={handleFileAccepted} />
      )}

      {isReady && displayUrl && currentDimensions && originalFile && (
        <ImageEditor
          imageUrl={displayUrl}
          currentDimensions={currentDimensions}
          format={inputFormat}
          fileName={originalFile.name}
          isProcessing={isProcessing}
          selectedFilter={selectedFilter}
          onCrop={handleCrop}
          onResize={handleResize}
          onFilterChange={handleFilterChange}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      )}
    </div>
  )
}

export default App
