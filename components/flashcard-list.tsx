"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import type { Flashcard } from "@/lib/types"
import { cn } from "@/lib/utils"

interface FlashcardListProps {
  flashcards: Flashcard[]
}

export function FlashcardList({ flashcards }: FlashcardListProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const currentCard = flashcards[currentIndex]

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % flashcards.length)
  }

  const handlePrevious = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Card {currentIndex + 1} of {flashcards.length}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setCurrentIndex(0)} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="perspective-1000">
        <Card
          className={cn(
            "min-h-[300px] cursor-pointer transition-all duration-500 hover:shadow-lg",
            isFlipped && "rotate-y-180",
          )}
          onClick={handleFlip}
        >
          <CardContent className="flex min-h-[300px] items-center justify-center p-8">
            <div className="text-center">
              {!isFlipped ? (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">Question</p>
                  <p className="text-lg font-medium leading-relaxed">{currentCard.question}</p>
                  <p className="text-xs text-muted-foreground">Click to reveal answer</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">Answer</p>
                  <p className="leading-relaxed">{currentCard.answer}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={flashcards.length <= 1}
          className="gap-2 bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={flashcards.length <= 1}
          className="gap-2 bg-transparent"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
