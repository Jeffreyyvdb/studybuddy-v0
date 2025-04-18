"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy } from "lucide-react"

type CardType = {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

export default function Memory() {
  const emojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🦁", "🐯", "🐨", "🐮"]

  const [cards, setCards] = useState<CardType[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number>(0)
  const [attempts, setAttempts] = useState<number>(0)
  const [gameComplete, setGameComplete] = useState<boolean>(false)

  // Initialize game
  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    const emojisToUse = emojis.slice(0, 3) // Use only 6 unique emojis for a simpler game

    // Create pairs of cards with emojis
    const cardPairs = [...emojisToUse, ...emojisToUse]
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))

    // Shuffle the cards
    const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5)

    setCards(shuffledCards)
    setFlippedCards([])
    setMatchedPairs(0)
    setAttempts(0)
    setGameComplete(false)
  }

  const handleCardClick = (id: number) => {
    // Find the card index in the array that matches the given id
    const cardIndex = cards.findIndex((card) => card.id === id)

    // Ignore if card is already flipped or matched, or if two cards are already flipped
    if (cards[cardIndex].isFlipped || cards[cardIndex].isMatched || flippedCards.length >= 2) {
      return
    }

    // Flip the card
    const updatedCards = [...cards]
    updatedCards[cardIndex].isFlipped = true
    setCards(updatedCards)

    // Add to flipped cards
    const updatedFlippedCards = [...flippedCards, cardIndex]
    setFlippedCards(updatedFlippedCards)

    // If two cards are flipped, check for a match
    if (updatedFlippedCards.length === 2) {
      const [firstIndex, secondIndex] = updatedFlippedCards

      // Check if the emojis match
      if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
        // Match found
        const newCards = [...cards]
        newCards[firstIndex].isMatched = true
        newCards[secondIndex].isMatched = true

        setCards(newCards)
        setFlippedCards([])
        setMatchedPairs(matchedPairs + 1)
        setAttempts(attempts + 1)

        // Check if all pairs are matched
        if (matchedPairs + 1 === cards.length / 2) {
          setGameComplete(true)
        }
      } else {
        // No match, flip cards back after a delay
        setAttempts(attempts + 1)
        setTimeout(() => {
          const resetCards = [...cards]
          resetCards[firstIndex].isFlipped = false
          resetCards[secondIndex].isFlipped = false
          setCards(resetCards)
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  return (
    <div className="flex flex-col">

        {gameComplete ? (
          <div className="flex flex-col items-center justify-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-md">
            <Trophy className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Congratulations!</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">You completed the game in {attempts} attempts!</p>
            <Button onClick={initializeGame}>Play Again</Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {cards.map((card) => (
              <Card
                key={card.id}
                className={`
                  aspect-square flex items-center justify-center text-3xl sm:text-4xl
                  cursor-pointer transition-all duration-300 transform
                  ${card.isFlipped || card.isMatched ? "bg-white dark:bg-slate-700" : "bg-slate-200 dark:bg-slate-600"}
                  ${card.isMatched ? "ring-2 ring-green-500 opacity-70" : ""}
                  hover:shadow-md active:scale-95
                `}
                onClick={() => handleCardClick(card.id)}
              >
                {card.isFlipped || card.isMatched ? card.emoji : ""}
              </Card>
            ))}
          </div>
        )}
    </div>
  )
}
