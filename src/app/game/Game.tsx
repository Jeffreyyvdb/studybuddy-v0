"use client";

import { useGame } from "@/lib/use-game";
import { GameBackground } from "@/components/game/game-background";
import { Player } from "@/components/game/player";
import { NPCs } from "@/components/game/npcs";
import { MobileControls } from "@/components/game/mobile-controls";
import { QuestionPopup } from "@/components/game/question-popup";
import { FeedbackMessage } from "@/components/game/feedback-message";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const Game = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GameContent />
    </Suspense>
  );
};

const GameContent = () => {
  // Get the subject from URL query parameters
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject") || "General Knowledge";

  // Using our custom hook for game logic with the subject from URL
  const game = useGame({ subject });

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

      <div className="fixed top-16 flex flex-col items-center w-full z-40">
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
    </div>
  );
};

export default Game;
