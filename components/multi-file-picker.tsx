"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, FileType, X, FileImage, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/error-utils"

export interface UploadedFile {
  id: string
  file: File
  preview: string
  note: string
  isHEIC: boolean
}

interface MultiFilePickerProps {
  onFilesChange: (files: UploadedFile[]) => void
  disabled?: boolean
  maxImages?: number
  maxFileSize?: number // in MB
}

export function MultiFilePicker({ 
  onFilesChange, 
  disabled = false, 
  maxImages = 20,
  maxFileSize = 50 
}: MultiFilePickerProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [converting, setConverting] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Convert HEIC to JPEG for preview
  const convertHEICToJPEG = useCallback(async (file: File): Promise<string> => {
    try {
      // Dynamically import heic2any for client-side only
      const heic2any = (await import('heic2any')).default

      const convertedBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8
      }) as Blob

      return URL.createObjectURL(convertedBlob)
    } catch (error) {
      console.warn('HEIC conversion failed, using original file:', error)
      // Fallback to original file URL
      return URL.createObjectURL(file)
    }
  }, [])

  // Create preview URL for image files
  const createPreviewURL = useCallback(async (file: File): Promise<string> => {
    if (file.type === 'image/heic' || file.type === 'image/heif') {
      return await convertHEICToJPEG(file)
    }
    return URL.createObjectURL(file)
  }, [convertHEICToJPEG])

  // Validate file
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    const maxSizeBytes = maxFileSize * 1024 * 1024

    if (file.size > maxSizeBytes) {
      return { valid: false, error: `File size must be less than ${maxFileSize}MB` }
    }

    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPG, PNG, HEIC, DOCX, and TXT files are allowed' }
    }

    return { valid: true }
  }, [maxFileSize])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null)
    setConverting(true)

    try {
      // Check total file count
      if (files.length + acceptedFiles.length > maxImages) {
        setError(`Maximum ${maxImages} files allowed`)
        return
      }

      const documentTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]
      const hasDocument = files.some(f => documentTypes.includes(f.file.type))
      const newDocuments = acceptedFiles.filter(f => documentTypes.includes(f.type))

      if (hasDocument && newDocuments.length > 0) {
        setError('Only one document or text file is allowed')
        return
      }

      if (newDocuments.length > 1) {
        setError('Only one document or text file is allowed')
        return
      }

      // Validate all files
      for (const file of acceptedFiles) {
        const validation = validateFile(file)
        if (!validation.valid) {
          setError(validation.error || 'Invalid file')
          return
        }
      }

      // Process files
      const newFiles: UploadedFile[] = []
      
      for (const file of acceptedFiles) {
        const preview = await createPreviewURL(file)
        
        newFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview,
          note: '',
          isHEIC: file.type === 'image/heic' || file.type === 'image/heif'
        })
      }

      const updatedFiles = [...files, ...newFiles]
      setFiles(updatedFiles)
      onFilesChange(updatedFiles)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to process files'))
    } finally {
      setConverting(false)
    }
  }, [createPreviewURL, files, maxImages, onFilesChange, validateFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/heic": [".heic"],
      "image/heif": [".heif"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: maxImages,
    disabled: disabled || converting,
  })

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const updateFileNote = (fileId: string, note: string) => {
    const updatedFiles = files.map(f => 
      f.id === fileId ? { ...f, note } : f
    )
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const getFileIcon = (file: UploadedFile) => {
    if (file.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return <FileType className="h-6 w-6 text-purple-500" />
    }
    if (file.file.type === 'text/plain') {
      return <FileText className="h-6 w-6 text-green-500" />
    }
    return <FileImage className="h-6 w-6 text-blue-500" />
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev === 0 ? files.length - 1 : prev - 1
      return nextIndex
    })
  }

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev === files.length - 1 ? 0 : prev + 1
      return nextIndex
    })
  }

  const currentFile = files[currentIndex]

  return (
    <div className="w-full space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed bg-muted/30 p-8 transition-colors",
          isDragActive && "border-primary bg-primary/5",
          (disabled || converting) && "cursor-not-allowed opacity-50",
        )}
      >
        <input {...getInputProps()} />

        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Upload className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-lg font-medium">
            {converting ? "Converting files..." : 
             isDragActive ? "Drop your files here" : "Drag & drop or click to upload"}
          </p>
          <p className="text-sm text-muted-foreground">
            Up to {maxImages} images + 1 document/text file (max {maxFileSize}MB each)
          </p>
          <p className="text-xs text-muted-foreground">
            Supports JPG, PNG, HEIC, DOCX, and TXT files
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File preview with carousel */}
      {files.length > 0 && currentFile && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Uploaded Files ({files.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFile(currentFile.id)}
              disabled={disabled}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Remove Current
            </Button>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Image Preview with Carousel */}
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4">
                  {/* File Info Header */}
                  <div className="flex items-center gap-2 mb-3">
                    {getFileIcon(currentFile)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {currentFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(currentFile.file.size / 1024 / 1024).toFixed(1)}MB
                        {currentFile.isHEIC && " (converted to JPEG)"}
                      </p>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {currentFile.file.type.startsWith('image/') && (
                    <div className="relative">
                      <div className="relative h-[400px] w-full rounded border bg-muted">
                        <Image
                          src={currentFile.preview}
                          alt={currentFile.file.name}
                          fill
                          className="object-contain"
                          sizes="(min-width: 1024px) 50vw, 100vw"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}

                  {/* Document / Text Placeholder */}
                  {['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(currentFile.file.type) && (
                    <div className="space-y-3">
                      <div className="flex h-[240px] w-full flex-col items-center justify-center gap-3 rounded border bg-muted text-center text-sm text-muted-foreground">
                        <FileType className="h-12 w-12 text-purple-500" />
                        <p>Preview unavailable for documents.</p>
                        <p className="max-w-sm text-xs">
                          We&apos;ll pull the text content directly from this file during processing.
                        </p>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="gap-2 self-start"
                      >
                        <a href={currentFile.preview} download>
                          Download original file
                        </a>
                      </Button>
                    </div>
                  )}

                  {/* Carousel Controls */}
                  {files.length > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevious}
                        disabled={disabled}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {currentIndex + 1} / {files.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNext}
                        disabled={disabled}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Thumbnail Navigation */}
              {files.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {files.map((file, index) => (
                    <button
                      key={file.id}
                      onClick={() => {
                        setCurrentIndex(index)
                      }}
                      className={cn(
                        "flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all",
                        index === currentIndex 
                          ? "border-primary ring-2 ring-primary/20" 
                          : "border-muted hover:border-primary/50"
                      )}
                    >
                      {file.file.type.startsWith('image/') ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={file.preview}
                            alt={file.file.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized
                          />
                        </div>
                      ) : file.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                        <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600">
                          <FileType className="h-6 w-6" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-600">
                          <FileText className="h-6 w-6" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Annotation Area */}
            <div>
              <Card className="h-full">
                <CardContent className="p-4 h-full flex flex-col">
                  <label className="text-sm font-medium mb-2">
                    Add a note for this file:
                  </label>
                  <Textarea
                    placeholder="Describe what's in this image or page..."
                    value={currentFile.note}
                    onChange={(e) => updateFileNote(currentFile.id, e.target.value)}
                    disabled={disabled}
                    className="flex-1 min-h-[400px] text-sm resize-none"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
