"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2, RotateCcw, Trophy, Target, Heart } from "lucide-react"
import type { GameCard } from "@/lib/types"

interface GameState {
  score: number
  lives: number
  streak: number
  currentQuestion: number
  gameOver: boolean
  gameWon: boolean
}

interface InvaderGameProps {
  cards: GameCard[]
  title?: string
}

interface FallingAnswer {
  text: string
  isCorrect: boolean
  x: number
  y: number
  speed: number
  id: number
}

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const words = text.split(' ')
  let line = ''
  const lines: string[] = []

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = testLine
    }
  }

  if (line) {
    lines.push(line)
  }

  return lines
}

export function InvaderGame({ cards, title = "Space Invaders Study Game" }: InvaderGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<number | undefined>(undefined)
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    streak: 0,
    currentQuestion: 0,
    gameOver: false,
    gameWon: false
  })
  
  const [playerX, setPlayerX] = useState(400)
  const [fallingAnswers, setFallingAnswers] = useState<FallingAnswer[]>([])
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [gameStarted, setGameStarted] = useState(false)
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({})
  const keysRef = useRef<{ [key: string]: boolean }>({})
  const playerXRef = useRef(400)

  // Filter only MCQ cards for the game
  const mcqCards = cards.filter(card => card.type === 'mcq' && card.choices && card.choices.length === 4)

  useEffect(() => {
    playerXRef.current = playerX
  }, [playerX])

  const shootLaser = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let nextQuestionIndex: number | null = null
    let hitResolved = false
    const shipX = playerXRef.current

    setFallingAnswers(prev => {
      const remaining = prev.filter(answer => {
        if (hitResolved) {
          return true
        }

        const distance = Math.sqrt(
          Math.pow(shipX - answer.x, 2) + Math.pow(550 - answer.y, 2)
        )

        if (distance < 50) {
          hitResolved = true

          if (answer.isCorrect) {
            setGameState(prevState => {
              const points = 10 + prevState.streak * 5
              const nextQuestion = prevState.currentQuestion + 1
              nextQuestionIndex = nextQuestion

              return {
                ...prevState,
                score: prevState.score + points,
                streak: prevState.streak + 1,
                currentQuestion: nextQuestion
              }
            })
          } else {
            setGameState(prevState => ({
              ...prevState,
              lives: prevState.lives - 1,
              streak: 0
            }))
          }

          return false
        }

        return true
      })

      return remaining
    })

    if (nextQuestionIndex !== null && nextQuestionIndex < mcqCards.length) {
      setCurrentPrompt(mcqCards[nextQuestionIndex].prompt)
    }
  }, [mcqCards])

  useEffect(() => {
    if (!gameStarted || gameState.gameOver || gameState.gameWon || mcqCards.length === 0) return

    const gameLoop = () => {
      const currentX = playerXRef.current
      // Move player
      if ((keysRef.current['ArrowLeft'] || keysRef.current['a']) && currentX > 20) {
        setPlayerX(prev => Math.max(20, prev - 5))
      }
      if ((keysRef.current['ArrowRight'] || keysRef.current['d']) && currentX < 780) {
        setPlayerX(prev => Math.min(780, prev + 5))
      }

      // Update falling answers
      setFallingAnswers(prev => {
        const updated = prev.map(answer => ({
          ...answer,
          y: answer.y + answer.speed
        })).filter(answer => answer.y < 600)

        // Check if any answer hit the bottom
        const hitBottom = updated.length !== prev.length
        if (hitBottom) {
          const missedAnswer = prev.find(answer => !updated.find(u => u.id === answer.id))
          if (missedAnswer && !missedAnswer.isCorrect) {
            // Missed a wrong answer - no penalty
          } else if (missedAnswer && missedAnswer.isCorrect) {
            // Missed correct answer - lose life
            setGameState(prevState => ({
              ...prevState,
              lives: prevState.lives - 1,
              streak: 0
            }))
          }
        }

        // Add new falling answers if needed
        if (updated.length < 4 && Math.random() < 0.02) {
          const currentCard = mcqCards[gameState.currentQuestion]
          const choices = currentCard.choices || []
          const randomChoice = choices[Math.floor(Math.random() * choices.length)]
          const newAnswer: FallingAnswer = {
            text: randomChoice,
            isCorrect: randomChoice === currentCard.answer,
            x: Math.random() * 700 + 50,
            y: -50,
            speed: 1 + Math.floor(gameState.currentQuestion / 5) * 0.5,
            id: Date.now() + Math.random()
          }
          updated.push(newAnswer)
        }

        return updated
      })
    }

    gameRef.current = requestAnimationFrame(gameLoop)
    const interval = setInterval(gameLoop, 16) // ~60 FPS

    return () => {
      if (gameRef.current) cancelAnimationFrame(gameRef.current)
      clearInterval(interval)
    }
  }, [gameStarted, gameState, mcqCards])

  useEffect(() => {
    if (mcqCards.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const rawKey = e.key === 'Spacebar' ? ' ' : e.key
      const key = rawKey.length === 1 ? rawKey.toLowerCase() : rawKey
      if (['ArrowLeft', 'ArrowRight', 'a', 'd', ' '].includes(key)) {
        e.preventDefault()
      }
      keysRef.current[key] = true
      setKeys(prev => ({ ...prev, [key]: true }))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const rawKey = e.key === 'Spacebar' ? ' ' : e.key
      const key = rawKey.length === 1 ? rawKey.toLowerCase() : rawKey
      if (['ArrowLeft', 'ArrowRight', 'a', 'd', ' '].includes(key)) {
        e.preventDefault()
      }
      keysRef.current[key] = false
      setKeys(prev => ({ ...prev, [key]: false }))

      if (key === ' ') {
        shootLaser()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [mcqCards.length, shootLaser])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateFromClientX = (clientX: number) => {
      const rect = canvas.getBoundingClientRect()
      const relativeX = clientX - rect.left
      setPlayerX(Math.max(20, Math.min(780, relativeX)))
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!gameStarted) return
      updateFromClientX(event.clientX)
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (!gameStarted) return
      if (event.touches.length > 0) {
        updateFromClientX(event.touches[0].clientX)
      }
      event.preventDefault()
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('touchmove', handleTouchMove)
    }
  }, [gameStarted])

  useEffect(() => {
    if (gameState.lives <= 0) {
      setGameState(prev => ({ ...prev, gameOver: true }))
    } else if (gameState.currentQuestion >= mcqCards.length) {
      setGameState(prev => ({ ...prev, gameWon: true }))
    }
  }, [gameState.lives, gameState.currentQuestion, mcqCards.length])

  const startGame = () => {
    if (mcqCards.length === 0) return
    
    setGameStarted(true)
    setCurrentPrompt(mcqCards[0].prompt)
    setGameState({
      score: 0,
      lives: 3,
      streak: 0,
      currentQuestion: 0,
      gameOver: false,
      gameWon: false
    })
    setFallingAnswers([])
    setPlayerX(400)
    playerXRef.current = 400
    keysRef.current = {}
    setKeys({})
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameState({
      score: 0,
      lives: 3,
      streak: 0,
      currentQuestion: 0,
      gameOver: false,
      gameWon: false
    })
    setFallingAnswers([])
    setCurrentPrompt("")
    playerXRef.current = 400
    keysRef.current = {}
    setKeys({})
  }

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, 800, 600)

    // Draw stars background
    ctx.fillStyle = '#ffffff'
    for (let i = 0; i < 50; i++) {
      const x = (i * 17) % 800
      const y = (i * 23) % 600
      ctx.fillRect(x, y, 1, 1)
    }

    // Draw player ship
    ctx.fillStyle = '#00ff00'
    ctx.fillRect(playerX - 15, 550, 30, 20)
    ctx.fillRect(playerX - 5, 570, 10, 10)

    // Draw falling answers
    ctx.font = '14px "Space Mono", monospace'
    ctx.textBaseline = 'middle'
    fallingAnswers.forEach(answer => {
      const textPaddingX = 16
      const textPaddingY = 12
      const maxTextWidth = 180
      const lines = wrapText(ctx, answer.text, maxTextWidth)
      const widestLine = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0)
      const boxWidth = Math.max(80, widestLine + textPaddingX * 2)
      const lineHeight = 18
      const contentHeight = lines.length * lineHeight
      const boxHeight = Math.max(32, contentHeight + textPaddingY * 2)

      const boxX = answer.x - boxWidth / 2
      const boxY = answer.y - boxHeight / 2

      ctx.fillStyle = answer.isCorrect ? '#057a55' : '#7f1d1d'
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight)

      ctx.strokeStyle = answer.isCorrect ? '#34d399' : '#f87171'
      ctx.lineWidth = 2
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      lines.forEach((lineText, index) => {
        const textY = boxY + textPaddingY + index * lineHeight + lineHeight / 2
        ctx.fillText(lineText, answer.x, textY)
      })
    })

    // Draw laser if shooting
    if (keys[' ']) {
      ctx.fillStyle = '#ffff00'
      ctx.fillRect(playerX - 1, 520, 2, 30)
    }
  }, [fallingAnswers, keys, playerX])

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(drawGame, 16)
      return () => clearInterval(interval)
    }
  }, [gameStarted, drawGame])

  if (mcqCards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>
            No MCQ cards available for the game
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <div className="text-center">
              <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No game cards available</p>
              <p className="text-sm">MCQ cards are required to play</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (gameState.gameOver) {
    const accuracy = gameState.currentQuestion > 0 ? 
      ((gameState.currentQuestion - gameState.lives + 3) / gameState.currentQuestion * 100).toFixed(0) : 0

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Game Over
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Game Over!</h3>
            <p className="text-muted-foreground">You ran out of lives</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{gameState.score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{gameState.currentQuestion}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
          </div>
          
          <Button onClick={resetGame} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Play Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (gameState.gameWon) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Victory!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Congratulations!</h3>
            <p className="text-muted-foreground">You completed all questions!</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{gameState.score}</div>
              <div className="text-sm text-muted-foreground">Final Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{gameState.streak}</div>
              <div className="text-sm text-muted-foreground">Final Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
          </div>
          
          <Button onClick={resetGame} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Play Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>
              Shoot the correct answers falling from space!
            </CardDescription>
          </div>
          <Button onClick={resetGame} variant="outline" size="sm" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
        
        {!gameStarted ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold">{gameState.score}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              <div>
                <div className="text-lg font-bold flex items-center justify-center gap-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  {gameState.lives}
                </div>
                <div className="text-xs text-muted-foreground">Lives</div>
              </div>
              <div>
                <div className="text-lg font-bold">{gameState.streak}</div>
                <div className="text-xs text-muted-foreground">Streak</div>
              </div>
              <div>
                <div className="text-lg font-bold">{gameState.currentQuestion}/{mcqCards.length}</div>
                <div className="text-xs text-muted-foreground">Questions</div>
              </div>
            </div>
            
            <Button onClick={startGame} size="lg" className="w-full gap-2">
              <Gamepad2 className="h-4 w-4" />
              Start Game
            </Button>
            
            <div className="text-sm text-muted-foreground text-center space-y-1">
              <p><strong>Controls:</strong> Arrow keys to move, Spacebar to shoot</p>
              <p>Shoot green (correct) answers, avoid red (incorrect) ones!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold">{gameState.score}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              <div>
                <div className="text-lg font-bold flex items-center justify-center gap-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  {gameState.lives}
                </div>
                <div className="text-xs text-muted-foreground">Lives</div>
              </div>
              <div>
                <div className="text-lg font-bold">{gameState.streak}</div>
                <div className="text-xs text-muted-foreground">Streak</div>
              </div>
              <div>
                <div className="text-lg font-bold">{gameState.currentQuestion + 1}/{mcqCards.length}</div>
                <div className="text-xs text-muted-foreground">Questions</div>
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Current Question:
              </h3>
              <p className="text-sm">{currentPrompt}</p>
            </div>
            
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full max-w-4xl mx-auto border rounded-lg bg-black"
              />
            </div>
          </div>
        )}
      </CardHeader>
    </Card>
  )
}
