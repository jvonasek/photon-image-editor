import { useDropzone } from 'react-dropzone'
import { useCallback } from 'react'

interface ImageDropzoneProps {
  onFileAccepted: (file: File) => void
}

export function ImageDropzone({ onFileAccepted }: ImageDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) {
        onFileAccepted(accepted[0])
      }
    },
    [onFileAccepted],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center w-full max-w-xl mx-auto h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="text-center p-6">
        <p className="text-lg font-medium">
          {isDragActive ? 'Drop image here' : 'Drag & drop an image here'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          or click to select a file
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Supports JPEG, PNG, and WebP
        </p>
      </div>
    </div>
  )
}
