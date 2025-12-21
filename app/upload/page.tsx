"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MultiFilePicker, UploadedFile } from "@/components/multi-file-picker"
import { RehashMeter } from "@/components/rehash-meter"
import { AppNav } from "@/components/app-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { processNote } from "@/app/actions/process-note"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, ImageIcon, FileType, Sparkles, Upload as UploadIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getErrorMessage } from "@/lib/error-utils"

type ProcessingStage = "uploading" | "extracting" | "consolidating" | "generating-notes" | "generating-reddit" | "generating-cards" | "complete" | null

export default function UploadPage() {
  const [processing, setProcessing] = useState(false)
  const [stage, setStage] = useState<ProcessingStage>(null)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [title, setTitle] = useState("")
  const [textNote, setTextNote] = useState("")
  const router = useRouter()

  const hasImage = files.some(f => f.file.type.startsWith('image/'))
  const hasDocument = files.some(f => f.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  const hasTextFile = files.some(f => f.file.type === 'text/plain')
  const hasManualNote = Boolean(textNote.trim())
  const canGenerate = hasImage || hasDocument || hasTextFile || hasManualNote

  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles)
  }

  const handleGenerate = async () => {
    const imageFiles = files.filter(f => f.file.type.startsWith('image/'))
    const documentFiles = files.filter(f => f.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || f.file.type === 'text/plain')
    const manualNote = textNote.trim()

    if (imageFiles.length === 0 && documentFiles.length === 0 && !manualNote) {
      setError("Please upload an image/document or enter a text note")
      return
    }

    setError(null)
    setProcessing(true)
    setStage("uploading")

    try {
      setStage("extracting")
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate processing

      setStage("consolidating")
      await new Promise((resolve) => setTimeout(resolve, 500))

      setStage("generating-notes")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStage("generating-reddit")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStage("generating-cards")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const result = await processNote({
        images: imageFiles,
        documents: documentFiles,
        textNotes: manualNote ? [manualNote] : [],
        title: title || undefined,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      setStage("complete")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      router.push(`/review/${result.noteId}`)
    } catch (err) {
      setError(getErrorMessage(err, "Failed to process files"))
      setProcessing(false)
      setStage(null)
    }
  }

  if (stage) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <RehashMeter stage={stage} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <AppNav />

      <main className="container mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 space-y-2 text-center">
          <h2 className="text-3xl font-bold">Turn Images & Docs into Memorable Notes</h2>
          <p className="text-muted-foreground">
            Upload images, Word docs, or text files—and add annotations or manual notes—to generate engaging study outputs.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Title and Summary Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Title Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Title</CardTitle>
                <CardDescription>
                  Give your rehash session a name
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="title">Title (optional)</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Biology Lecture Notes"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={processing}
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                  <span>{files.filter(f => f.file.type.startsWith('image/')).length} images</span>
                </div>
                {files.some(f => f.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileType className="h-4 w-4 text-purple-500" />
                    <span>1 document</span>
                  </div>
                )}
                {files.some(f => f.file.type === 'text/plain') && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span>1 text file</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-green-500" />
                  <span>{files.filter(f => f.note.trim()).length} annotated</span>
                </div>
                {textNote.trim() && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>1 manual text note</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Input Method Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Add Your Content
              </CardTitle>
              <CardDescription>
                Choose how you want to provide your study material
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="gap-2">
                    <UploadIcon className="h-4 w-4" />
                    Upload Files
                  </TabsTrigger>
                  <TabsTrigger value="text" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Paste Text
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Upload & Annotate</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload up to 20 images plus one DOCX/TXT file. Add notes for each file to guide the AI.
                    </p>
                  </div>
                  <MultiFilePicker 
                    onFilesChange={handleFilesChange}
                    disabled={processing}
                    maxImages={20}
                    maxFileSize={50}
                  />
                </TabsContent>

                <TabsContent value="text" className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Paste Your Notes</h3>
                    <p className="text-sm text-muted-foreground">
                      Provide raw text, meeting notes, lecture transcripts, or any content you want to convert into study materials.
                    </p>
                  </div>
                  <Textarea
                    placeholder="Paste your notes here... 

Example:
- Lecture transcripts
- Meeting notes
- Study outlines
- Any text content"
                    value={textNote}
                    onChange={(e) => setTextNote(e.target.value)}
                    disabled={processing}
                    className="min-h-[400px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: You can also combine this with file uploads by switching back to the Upload tab
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate}
            disabled={processing || !canGenerate}
            size="lg"
            className="w-full gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {processing ? "Generating..." : "Generate Study Materials"}
          </Button>
        </div>
      </main>
    </div>
  )
}
