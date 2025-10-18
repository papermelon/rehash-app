"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { exportNote, type ExportFormat } from "@/app/actions/export-note"
import { FileText, Table } from "lucide-react"

interface ExportDialogProps {
  noteId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportDialog({ noteId, open, onOpenChange }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("markdown")
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)

    try {
      const result = await exportNote(noteId, format)

      if (result.error) {
        alert(result.error)
        return
      }

      // Create download
      const blob = new Blob([result.content!], { type: result.mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = result.filename!
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      onOpenChange(false)
    } catch (error) {
      alert("Failed to export")
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Note</DialogTitle>
          <DialogDescription>Choose a format to export your note and flashcards</DialogDescription>
        </DialogHeader>

        <RadioGroup value={format} onValueChange={(value) => setFormat(value as ExportFormat)} className="space-y-3">
          <div className="flex items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <RadioGroupItem value="markdown" id="markdown" className="mt-1" />
            <Label htmlFor="markdown" className="flex-1 cursor-pointer space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <FileText className="h-4 w-4" />
                Markdown
              </div>
              <p className="text-sm text-muted-foreground">
                Export summary and flashcards as a formatted Markdown file
              </p>
            </Label>
          </div>

          <div className="flex items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <RadioGroupItem value="csv" id="csv" className="mt-1" />
            <Label htmlFor="csv" className="flex-1 cursor-pointer space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <Table className="h-4 w-4" />
                CSV
              </div>
              <p className="text-sm text-muted-foreground">
                Export flashcards as a CSV file for import into other tools
              </p>
            </Label>
          </div>
        </RadioGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
