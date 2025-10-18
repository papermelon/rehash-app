"use client"

import { Sparkles } from "lucide-react"

interface RehashMeterProps {
  stage: "uploading" | "extracting" | "consolidating" | "generating-notes" | "generating-reddit" | "generating-cards" | "complete"
}

const stages = {
  uploading: { label: "Uploading files...", progress: 15 },
  extracting: { label: "Extracting text from documents...", progress: 25 },
  consolidating: { label: "Consolidating content...", progress: 35 },
  "generating-notes": { label: "Generating markdown notes...", progress: 50 },
  "generating-reddit": { label: "Creating Reddit thread...", progress: 70 },
  "generating-cards": { label: "Building study cards...", progress: 85 },
  complete: { label: "Complete!", progress: 100 },
}

export function RehashMeter({ stage }: RehashMeterProps) {
  const currentStage = stages[stage]

  if (!currentStage) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-lg border bg-card p-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Processing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-lg border bg-card p-8">
      <div className="relative">
        <div className="animate-rehash-spin">
          <Sparkles className="h-16 w-16 text-primary" />
        </div>
        <div className="absolute inset-0 animate-rehash-pulse">
          <Sparkles className="h-16 w-16 text-primary/30" />
        </div>
      </div>

      <div className="w-full space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{currentStage.label}</span>
          <span className="text-muted-foreground">{currentStage.progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${currentStage.progress}%` }}
          />
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">Rehashing your notes into structured knowledge...</p>
    </div>
  )
}
