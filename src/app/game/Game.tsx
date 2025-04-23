"use client";

import { useGame } from "@/lib/use-game";
import { GameBackground } from "@/components/game/game-background";
import { GameUI } from "@/components/game/game-ui";
import { Player } from "@/components/game/player";
import { NPCs } from "@/components/game/npcs";
import { MobileControls } from "@/components/game/mobile-controls";
import { QuestionPopup } from "@/components/game/question-popup";
import { FeedbackMessage } from "@/components/game/feedback-message";

const Game = () => {
  // Using our custom hook for game logic
  const game = useGame();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-800">
      {/* Game background with parallax scrolling */}
      <GameBackground position={game.position} />

      {/* Game UI (score, distance) */}
      <GameUI score={game.score} distance={game.distance} />

      {/* Player character */}
      <Player />

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
          npc={game.activeNpc}
          onAnswer={game.handleAnswer}
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
