"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, RotateCcw, HelpCircle, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import type { GameCard } from "@/lib/types"

interface FlashcardViewProps {
  cardsJson: { cards: GameCard[] }
  title?: string
}

export function FlashcardView({ cardsJson, title = "Flashcards" }: FlashcardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [answeredCards, setAnsweredCards] = useState<Set<number>>(new Set())
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set())
  const [showAnswer, setShowAnswer] = useState(false)

  if (!cardsJson || !cardsJson.cards || cardsJson.cards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>
            Interactive flashcards will appear here after generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <div className="text-center">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No flashcards generated yet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const cards = cardsJson.cards
  const currentCard = cards[currentIndex]
  const progress = ((currentIndex + 1) / cards.length) * 100
  const answeredCount = answeredCards.size
  const correctCount = correctAnswers.size
  const accuracy = answeredCount > 0 ? (correctCount / answeredCount) * 100 : 0

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setShowAnswer(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
      setShowAnswer(false)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    if (!isFlipped && !answeredCards.has(currentIndex)) {
      setAnsweredCards(prev => new Set([...prev, currentIndex]))
    }
  }

  const handleAnswerSelect = (selectedAnswer: string) => {
    if (answeredCards.has(currentIndex)) return

    const isCorrect = selectedAnswer === currentCard.answer
    setAnsweredCards(prev => new Set([...prev, currentIndex]))
    if (isCorrect) {
      setCorrectAnswers(prev => new Set([...prev, currentIndex]))
    }
    setShowAnswer(true)
    
    toast.success(isCorrect ? "Correct!" : `Incorrect. The answer is: ${currentCard.answer}`)
  }

  const resetProgress = () => {
    setAnsweredCards(new Set())
    setCorrectAnswers(new Set())
    setCurrentIndex(0)
    setIsFlipped(false)
    setShowAnswer(false)
    toast.success("Progress reset!")
  }

  const getCardTypeIcon = (type: string) => {
    return type === 'mcq' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />
  }

  const getCardTypeLabel = (type: string) => {
    return type === 'mcq' ? 'Multiple Choice' : 'Fill in the Blank'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>
              Interactive study cards with flip animations
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {currentIndex + 1} of {cards.length}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={resetProgress}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{answeredCount} answered • {correctCount} correct ({accuracy.toFixed(0)}%)</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Card Type Badge */}
          <div className="flex justify-center">
            <Badge variant="outline" className="gap-2">
              {getCardTypeIcon(currentCard.type)}
              {getCardTypeLabel(currentCard.type)}
            </Badge>
          </div>

          {/* Flashcard */}
          <div className="relative">
            <Card 
              className={`cursor-pointer transition-all duration-500 transform ${
                isFlipped ? 'rotate-y-180' : ''
              } hover:shadow-lg`}
              onClick={handleFlip}
            >
              <CardContent className="p-8 min-h-[300px] flex items-center justify-center">
                {!isFlipped ? (
                  // Front of card
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold">Question</h3>
                    <p className="text-lg leading-relaxed">{currentCard.prompt}</p>
                    {currentCard.type === 'cloze' && currentCard.text && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Fill in the blank in this text:
                        </p>
                        <p className="mt-2 text-base">{currentCard.text}</p>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">Click to reveal answer</p>
                  </div>
                ) : (
                  // Back of card
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold">Answer</h3>
                    <p className="text-lg leading-relaxed">{currentCard.answer}</p>
                    {currentCard.type === 'cloze' && currentCard.distractors && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-muted-foreground">Other options were:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {currentCard.distractors.map((distractor, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {distractor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Multiple Choice Options */}
          {currentCard.type === 'mcq' && currentCard.choices && !isFlipped && (
            <div className="space-y-3">
              <h4 className="font-medium text-center">Choose your answer:</h4>
              <div className="grid grid-cols-2 gap-3">
                {currentCard.choices.map((choice, idx) => {
                  const isSelected = showAnswer && choice === currentCard.answer
                  const isWrong = showAnswer && answeredCards.has(currentIndex) && choice !== currentCard.answer
                  
                  return (
                    <Button
                      key={idx}
                      variant={isSelected ? "default" : isWrong ? "destructive" : "outline"}
                      onClick={() => handleAnswerSelect(choice)}
                      disabled={answeredCards.has(currentIndex)}
                      className="h-auto p-4 text-left justify-start"
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                      <span>{choice}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              {answeredCards.has(currentIndex) && (
                <Badge variant={correctAnswers.has(currentIndex) ? "default" : "destructive"}>
                  {correctAnswers.has(currentIndex) ? "Correct" : "Incorrect"}
                </Badge>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
