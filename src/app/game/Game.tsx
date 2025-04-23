"use client";

import { useGame } from "@/lib/use-game";
import { GameBackground } from "@/components/game/game-background";
import { Player } from "@/components/game/player";
import { NPCs } from "@/components/game/npcs";
import { MobileControls } from "@/components/game/mobile-controls";
import { QuestionPopup } from "@/components/game/question-popup";
import { FeedbackMessage } from "@/components/game/feedback-message";
import { useEffect } from "react";

const Game = () => {
  // Using our custom hook for game logic
  const game = useGame();

  // Add touch event listeners for mobile devices
  useEffect(() => {
    const preventDefaultTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    // Prevent pinch zoom
    document.addEventListener("touchmove", preventDefaultTouchMove, {
      passive: false,
    });

    // Clean up event listeners on component unmount
    return () => {
      document.removeEventListener("touchmove", preventDefaultTouchMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden touch-none select-none bg-gray-800">
      {/* Game background with parallax scrolling */}
      <GameBackground position={game.position} />

      {/* Player character with animation based on movement */}
      <Player direction={game.direction} isMoving={game.isMoving} />

      {/* NPCs in the world */}
      <NPCs
        npcs={game.visibleNpcs}
        interactionDistance={game.npcInteractionDistance}
      />

      {/* Mobile controls */}
      <MobileControls
        onButtonPress={game.handleMobileButtonPress}
        onButtonRelease={game.handleMobileButtonRelease}
      />

      {/* Question popup */}
      {game.currentQuestion && game.activeNpc && (
        <QuestionPopup
          question={game.currentQuestion}
          onAnswer={game.submitAnswerToAI} // Use the new AI handler
          isAnswering={game.isAnswering} // Pass loading state
        />
      )}

      {/* Feedback message */}
      <FeedbackMessage
        message={game.feedbackMessage}
        type={game.feedbackType}
      />
    </div>
  );
};

export default Game;
