"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, ImageIcon, FileType } from "lucide-react"
import { validateFile } from "@/lib/file-validation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
}

export function UploadZone({ onFileSelect, disabled }: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null)

      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      const validation = validateFile(file)

      if (!validation.valid) {
        setError(validation.error || "Invalid file")
        return
      }

      onFileSelect(file)
    },
    [onFileSelect],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/heic": [".heic"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    disabled,
  })

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "flex min-h-[300px] cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed bg-muted/30 p-8 transition-colors",
          isDragActive && "border-primary bg-primary/5",
          disabled && "cursor-not-allowed opacity-50",
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
            {isDragActive ? "Drop your file here" : "Drag & drop or click to upload"}
          </p>
          <p className="text-sm text-muted-foreground">Support for JPG, PNG, HEIC, DOCX, and TXT files (max 50 MB)</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4" />
            <span>Images</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileType className="h-4 w-4" />
            <span>DOCX</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <span>Text</span>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
