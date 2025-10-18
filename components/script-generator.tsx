"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"
import { getAllStyles, type ScriptStyle } from "@/lib/script-styles"
import type { ScriptGenerationResponse } from "@/lib/types"

interface ScriptGeneratorProps {
  noteId: string
  existingScript?: string
  existingStyle?: ScriptStyle
  existingDuration?: number
  onScriptGenerated: (response: ScriptGenerationResponse) => void
}

export function ScriptGenerator({
  noteId,
  existingScript,
  existingStyle,
  existingDuration,
  onScriptGenerated,
}: ScriptGeneratorProps) {
  const [selectedStyle, setSelectedStyle] = useState<ScriptStyle>(
    existingStyle || 'kurzgesagt'
  )
  const [duration, setDuration] = useState<number>(existingDuration || 3)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const styles = getAllStyles()
  const targetWordCount = duration * 150

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate/script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId,
          style: selectedStyle,
          durationMinutes: duration,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate script')
      }

      const data: ScriptGenerationResponse = await response.json()
      onScriptGenerated(data)
    } catch (err: any) {
      setError(err.message || 'Failed to generate script')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Style Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Choose Narrator Style</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {styles.map((style) => (
            <Card
              key={style.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedStyle === style.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedStyle(style.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{style.icon}</span>
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold">{style.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {style.description}
                  </p>
                  <p className="text-xs italic text-muted-foreground mt-2">
                    "{style.example.substring(0, 100)}..."
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Duration Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Script Duration</h3>
          <span className="text-sm text-muted-foreground">
            {duration} minutes (~{targetWordCount} words)
          </span>
        </div>
        <Slider
          value={[duration]}
          onValueChange={(value) => setDuration(value[0])}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 min</span>
          <span>5 min</span>
          <span>10 min</span>
        </div>
      </div>

      {/* Content Sufficiency Warning */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          If your notes don't have enough content for the selected duration, we'll
          supplement it with additional information from web sources.
        </AlertDescription>
      </Alert>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        size="lg"
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Script...
          </>
        ) : existingScript ? (
          'Regenerate Script'
        ) : (
          'Generate Script'
        )}
      </Button>

      {/* Info Text */}
      <p className="text-xs text-center text-muted-foreground">
        Script generation uses GPT-4 and may take 30-60 seconds
      </p>
    </div>
  )
}

