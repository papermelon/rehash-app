"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { Image as ImageIcon, Sparkles, Trash2, Plus, AlertTriangle, Loader2 } from "lucide-react"
import type { ScriptSegment } from "@/lib/types"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

interface VideoSegmentsProps {
  noteId: string
  segments: ScriptSegment[]
  onSegmentsUpdate: () => void
}

export function VideoSegments({ noteId, segments, onSegmentsUpdate }: VideoSegmentsProps) {
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(new Set())
  const [editingPrompts, setEditingPrompts] = useState<Record<string, string>>({})
  const [generatingSegments, setGeneratingSegments] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isGeneratingAllSegments, setIsGeneratingAllSegments] = useState(false)

  const toggleSegment = (segmentId: string) => {
    const newExpanded = new Set(expandedSegments)
    if (newExpanded.has(segmentId)) {
      newExpanded.delete(segmentId)
    } else {
      newExpanded.add(segmentId)
    }
    setExpandedSegments(newExpanded)
  }

  const handlePromptChange = (segmentId: string, value: string) => {
    setEditingPrompts({ ...editingPrompts, [segmentId]: value })
  }

  const handleGenerateImage = async (segment: ScriptSegment) => {
    const prompt = editingPrompts[segment.id] || segment.imagePrompt

    setGeneratingSegments(prev => new Set(prev).add(segment.id))
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[segment.id]
      return newErrors
    })

    try {
      const response = await fetch('/api/generate/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId,
          segmentId: segment.id,
          prompt,
          isFirstSegment: segment.order === 0,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate image')
      }

      // Clear the editing prompt after successful generation
      setEditingPrompts(prev => {
        const newPrompts = { ...prev }
        delete newPrompts[segment.id]
        return newPrompts
      })

      onSegmentsUpdate()
    } catch (err: any) {
      setErrors(prev => ({
        ...prev,
        [segment.id]: err.message || 'Failed to generate image'
      }))
    } finally {
      setGeneratingSegments(prev => {
        const newSet = new Set(prev)
        newSet.delete(segment.id)
        return newSet
      })
    }
  }

  const handleRemoveSegment = async (segmentId: string) => {
    try {
      const response = await fetch('/api/remove-segment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId,
          segmentId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove segment')
      }

      onSegmentsUpdate()
    } catch (err: any) {
      console.error('Failed to remove segment:', err)
    }
  }

  const handleGenerateAllSegments = async () => {
    setIsGeneratingAllSegments(true)
    try {
      const response = await fetch('/api/generate/segments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ noteId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate segments')
      }

      onSegmentsUpdate()
    } catch (err: any) {
      console.error('Failed to generate segments:', err)
      alert(err.message || 'Failed to generate segments')
    } finally {
      setIsGeneratingAllSegments(false)
    }
  }

  const totalCost = segments.reduce((sum, seg) => sum + (seg.cost || 0), 0)

  if (segments.length === 0) {
    return (
      <Card className="p-8 text-center space-y-4">
        <ImageIcon className="h-12 w-12 mx-auto opacity-50" />
        <div>
          <h3 className="font-semibold mb-2">No Segments Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Segments with image prompts are created automatically when you generate a script.
          </p>
        </div>
        <Button 
          onClick={handleGenerateAllSegments} 
          disabled={isGeneratingAllSegments}
          size="sm"
        >
          {isGeneratingAllSegments ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Segments...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Segments from Script
            </>
          )}
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Video Segments
        </h2>
        <Badge variant="outline" className="text-xs">
          {segments.filter(s => s.imageUrl).length} / {segments.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {segments.map((segment) => {
          const isGenerating = generatingSegments.has(segment.id)
          const error = errors[segment.id]
          const currentPrompt = editingPrompts[segment.id] ?? segment.imagePrompt
          const isPromptEdited = editingPrompts[segment.id] !== undefined

          return (
            <Card key={segment.id} className="overflow-hidden">
              <Collapsible
                open={expandedSegments.has(segment.id)}
                onOpenChange={() => toggleSegment(segment.id)}
              >
                <CollapsibleTrigger asChild>
                  <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left">
                    <ChevronDown
                      className={`h-4 w-4 flex-shrink-0 transition-transform ${
                        expandedSegments.has(segment.id) ? 'rotate-180' : ''
                      }`}
                    />
                    {!expandedSegments.has(segment.id) && segment.imageUrl && (
                      <div className="flex-shrink-0 w-20 h-12 rounded overflow-hidden bg-muted">
                        <img
                          src={segment.imageUrl}
                          alt={`Segment ${segment.order + 1} thumbnail`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          Segment {segment.order + 1}
                        </Badge>
                        {segment.imageUrl && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <ImageIcon className="h-3 w-3" />
                            Generated
                          </Badge>
                        )}
                        {segment.cost !== undefined && segment.cost !== null && segment.cost > 0 && (
                          <Badge variant="outline" className="text-xs">
                            ${segment.cost.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                      {!expandedSegments.has(segment.id) && (
                        <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                          {segment.text}
                        </p>
                      )}
                    </div>
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-4 pt-0 space-y-4 border-t">
                    {/* Segment Text */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Segment Text</label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap break-words leading-relaxed">
                        {segment.text}
                      </p>
                    </div>

                    {/* Image Prompt */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Image Prompt {isPromptEdited && <span className="text-primary">(edited)</span>}
                      </label>
                      <Textarea
                        value={currentPrompt}
                        onChange={(e) => handlePromptChange(segment.id, e.target.value)}
                        className="mt-1 min-h-[80px] text-sm"
                        placeholder="AI-generated image prompt..."
                      />
                    </div>

                    {/* Error Display */}
                    {error && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Generated Image Preview */}
                    {segment.imageUrl && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Generated Image</label>
                        <div className="mt-1 relative aspect-video rounded-md overflow-hidden bg-muted">
                          <img
                            src={segment.imageUrl}
                            alt={`Segment ${segment.order + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {segment.model && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Model: {segment.model}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleGenerateImage(segment)}
                        disabled={isGenerating || !currentPrompt.trim()}
                        size="sm"
                        className="flex-1"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : segment.imageUrl ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Regenerate Image
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Image
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveSegment(segment.id)}
                        disabled={isGenerating}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>

      {/* Generate All Button */}
      {segments.some(s => !s.imageUrl) && (
        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            for (const segment of segments) {
              if (!segment.imageUrl && !generatingSegments.has(segment.id)) {
                await handleGenerateImage(segment)
              }
            }
          }}
          disabled={generatingSegments.size > 0}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate All Missing Images
        </Button>
      )}
    </div>
  )
}

