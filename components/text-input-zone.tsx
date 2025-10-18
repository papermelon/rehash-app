"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"

interface TextInputZoneProps {
  onTextSubmit: (text: string) => void
  disabled?: boolean
}

export function TextInputZone({ onTextSubmit, disabled }: TextInputZoneProps) {
  const [text, setText] = useState("")

  const handleSubmit = () => {
    if (text.trim()) {
      onTextSubmit(text.trim())
      setText("")
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text-input">Or paste your notes directly</Label>
        <Textarea
          id="text-input"
          placeholder="Paste your workshop notes, meeting minutes, or any text you want to process..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          className="min-h-[200px] resize-none"
        />
      </div>
      <Button onClick={handleSubmit} disabled={disabled || !text.trim()} className="w-full gap-2">
        <Sparkles className="h-4 w-4" />
        Process Text
      </Button>
    </div>
  )
}
