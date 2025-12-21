"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScriptGenerator } from "@/components/script-generator"
import { ScriptEditor } from "@/components/script-editor"
import { VideoEssayControls } from "@/components/video-essay-controls"
import { VideoSegments } from "@/components/video-segments"
import { Download, Volume2, Mic, AlertTriangle, CheckCircle2 } from "lucide-react"
import type { Note, ScriptGenerationResponse, ScriptStyle } from "@/lib/types"
import { getErrorMessage } from "@/lib/error-utils"

interface AudioPageClientProps {
  note: Note
  hasAudio: boolean
  hasScript: boolean
}

export function AudioPageClient({ note, hasAudio, hasScript }: AudioPageClientProps) {
  const [generationResponse, setGenerationResponse] = useState<ScriptGenerationResponse | null>(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [isRegeneratingScript, setIsRegeneratingScript] = useState(false)

  const handleScriptGenerated = (response: ScriptGenerationResponse) => {
    setGenerationResponse(response)
    // Refresh the page to get updated data including segments
    window.location.reload()
  }

  const handleScriptSaved = (_updatedScript: string) => {
    // Script saved successfully, no need to reload
    console.log('Script saved')
  }

  const handleRegenerateScript = async (style: ScriptStyle, duration: number) => {
    setIsRegeneratingScript(true)
    
    try {
      const response = await fetch('/api/generate/script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId: note.id,
          style,
          durationMinutes: duration,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to regenerate script')
      }

      const data: ScriptGenerationResponse = await response.json()
      handleScriptGenerated(data)
    } catch (err) {
      console.error('Failed to regenerate script:', getErrorMessage(err, 'Failed to regenerate script'))
    } finally {
      setIsRegeneratingScript(false)
    }
  }

  const handleGenerateAudio = async () => {
    if (!hasScript) {
      setAudioError('Please generate a script first')
      return
    }

    setIsGeneratingAudio(true)
    setAudioError(null)

    try {
      const response = await fetch('/api/generate/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId: note.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate audio')
      }

      // Reload the page to show the new audio
      window.location.reload()
    } catch (err) {
      setAudioError(getErrorMessage(err, 'Failed to generate audio'))
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const handleSegmentsUpdate = () => {
    // Reload to get updated segments
    window.location.reload()
  }

  const wordCount = note.script_text?.split(/\s+/).filter(w => w.length > 0).length || 0

  return (
    <div className="space-y-6">
      {/* Generation Success Alert */}
      {generationResponse && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-semibold text-green-900 dark:text-green-100">
                Script generated successfully!
              </p>
              <p className="text-sm text-green-800 dark:text-green-200">
                {generationResponse.wordCount} words • {generationResponse.durationMinutes} minutes
              </p>
              {generationResponse.wasSupplemented && generationResponse.supplementWarning && (
                <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  {generationResponse.supplementWarning}
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Audio Error Display */}
      {audioError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{audioError}</AlertDescription>
        </Alert>
      )}

      {/* Generate Script Section */}
      {!hasScript && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Generate Video Essay Script
          </h2>
          <ScriptGenerator
            noteId={note.id}
            existingScript={note.script_text}
            existingStyle={note.script_style}
            existingDuration={note.script_duration_minutes}
            onScriptGenerated={handleScriptGenerated}
          />
        </div>
      )}

      {/* Video Essay Editor - Only shown if script exists */}
      {hasScript && (
        <>
          {/* Video Essay Controls Bar */}
          <VideoEssayControls
            currentStyle={note.script_style || 'kurzgesagt'}
            currentDuration={note.script_duration_minutes || 3}
            wordCount={wordCount}
            totalImageCost={note.total_image_cost || 0}
            onRegenerateScript={handleRegenerateScript}
            isRegenerating={isRegeneratingScript}
          />

          {/* Audio Narration Section - Full Width at Top */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Audio Narration
                  </h2>
                  {hasAudio && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={note.audio_url} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>

                {hasAudio ? (
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <audio controls className="flex-1 w-full">
                      <source src={note.audio_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                    <Button variant="outline" size="sm" onClick={handleGenerateAudio} disabled={isGeneratingAudio}>
                      <Volume2 className="h-4 w-4 mr-2" />
                      {isGeneratingAudio ? 'Regenerating...' : 'Regenerate'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Volume2 className="h-8 w-8 opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        Convert your video essay script into professional audio narration
                      </p>
                    </div>
                    <Button 
                      onClick={handleGenerateAudio} 
                      disabled={isGeneratingAudio}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      {isGeneratingAudio ? (
                        <>
                          <Volume2 className="h-4 w-4 mr-2 animate-pulse" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-4 w-4 mr-2" />
                          Generate Audio
                        </>
                      )}
                    </Button>
                  </div>
                )}
          </div>

          {/* Two-Column Layout: Script on left, Segments on right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Script Editor */}
            <div className="lg:col-span-1">
              <ScriptEditor
                noteId={note.id}
                initialScript={note.script_text || ''}
                onScriptSaved={handleScriptSaved}
              />
            </div>

            {/* Right Column: Video Segments */}
            <div className="lg:col-span-1">
              <VideoSegments
                noteId={note.id}
                segments={note.script_segments || []}
                onSegmentsUpdate={handleSegmentsUpdate}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
