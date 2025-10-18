export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif"]
export const ALLOWED_DOCUMENT_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
]
export const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES]

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 50 MB limit (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    }
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type not supported. Please upload JPG, PNG, HEIC, DOCX, or TXT files.`,
    }
  }

  return { valid: true }
}

export function getFileType(file: File): "text" | "image" | "document" {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) return "image"
  if (file.type === "text/plain") return "text"
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "document"
  return "text"
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
