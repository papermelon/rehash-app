"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, X, FileText, AlertTriangle, CheckCircle2 } from "lucide-react"
import { getErrorMessage } from "@/lib/error-utils"

interface ScriptEditorProps {
  noteId: string
  initialScript: string
  onScriptSaved: (script: string) => void
}

export function ScriptEditor({ noteId, initialScript, onScriptSaved }: ScriptEditorProps) {
  const [script, setScript] = useState(initialScript)
  const [isEdited, setIsEdited] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    setScript(initialScript)
    setIsEdited(false)
  }, [initialScript])

  const handleScriptChange = (value: string) => {
    setScript(value)
    setIsEdited(value !== initialScript)
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const response = await fetch('/api/update-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId,
          scriptText: script,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save script')
      }

      setSaveSuccess(true)
      setIsEdited(false)
      onScriptSaved(script)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Failed to save script'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setScript(initialScript)
    setIsEdited(false)
    setSaveSuccess(false)
    setSaveError(null)
  }

  const wordCount = script.trim().split(/\s+/).filter(word => word.length > 0).length
  const charCount = script.length

  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Script Editor
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {wordCount} words
          </Badge>
          <Badge variant="outline">
            {charCount} characters
          </Badge>
        </div>
      </div>

      {saveSuccess && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900 dark:text-green-100">
            Script saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {saveError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      <Textarea
        value={script}
        onChange={(e) => handleScriptChange(e.target.value)}
        className="min-h-[500px] font-mono text-sm w-full resize-none whitespace-pre-wrap break-words"
        placeholder="Your script will appear here..."
      />

      {isEdited && (
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md border border-muted-foreground/20">
          <p className="text-sm text-muted-foreground">
            You have unsaved changes
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
