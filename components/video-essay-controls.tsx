"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, DollarSign } from "lucide-react"
import { getAllStyles, type ScriptStyle } from "@/lib/script-styles"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface VideoEssayControlsProps {
  currentStyle: ScriptStyle
  currentDuration: number
  wordCount: number
  totalImageCost: number
  onRegenerateScript: (style: ScriptStyle, duration: number) => void
  isRegenerating: boolean
}

export function VideoEssayControls({
  currentStyle,
  currentDuration,
  wordCount,
  totalImageCost,
  onRegenerateScript,
  isRegenerating,
}: VideoEssayControlsProps) {
  const [selectedStyle, setSelectedStyle] = useState<ScriptStyle>(currentStyle)
  const [duration, setDuration] = useState<number>(currentDuration)

  const styles = getAllStyles()
  const hasChanges = selectedStyle !== currentStyle || duration !== currentDuration
  const targetWordCount = duration * 150

  const handleRegenerate = () => {
    onRegenerateScript(selectedStyle, duration)
  }

  return (
    <Card className="p-4 mb-6">
      <div className="space-y-4">
        {/* Top Row - Style and Stats */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Style Selector */}
          <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[280px]">
            <label className="text-xs font-medium text-muted-foreground">Creator Style</label>
            <Select value={selectedStyle} onValueChange={(value) => setSelectedStyle(value as ScriptStyle)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styles.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    <div className="flex items-center gap-2">
                      <span>{style.icon}</span>
                      <span className="truncate">{style.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="flex gap-2 items-center flex-wrap">
            <Badge variant="secondary" className="gap-1">
              <span>📝</span>
              {wordCount} words
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <DollarSign className="h-3 w-3" />
              ${totalImageCost.toFixed(2)}
            </Badge>
          </div>
        </div>

        {/* Bottom Row - Duration and Regenerate */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          {/* Duration Slider */}
          <div className="flex flex-col gap-2 flex-1 w-full">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Duration</label>
              <span className="text-xs text-muted-foreground">
                {duration} min (~{targetWordCount} words)
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

          {/* Regenerate Button */}
          <Button
            onClick={handleRegenerate}
            disabled={!hasChanges || isRegenerating}
            variant={hasChanges ? "default" : "outline"}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            <Mic className="h-4 w-4 mr-2" />
            {isRegenerating ? 'Regenerating...' : 'Regenerate Script'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

