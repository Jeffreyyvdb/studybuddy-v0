"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGame } from "@/lib/use-game";
import { GameBackground } from "@/components/game/game-background";
import { Player } from "@/components/game/player";
import { NPCs } from "@/components/game/npcs";
import { QuestionPopup } from "@/components/game/question-popup";
import { FeedbackMessage } from "@/components/game/feedback-message";
import { MobileControls } from "@/components/game/mobile-controls";
import { QuizResults } from "@/components/quiz/quiz-results";

export default function Game() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subject = searchParams.get("subject") || "General Knowledge";

  const {
    position,
    isMoving,
    direction,
    score,
    currentQuestion,
    feedbackMessage,
    feedbackType,
    activeNpc,
    visibleNpcs,
    npcInteractionDistance,
    isSubmittingAnswer,
    handleMobileButtonPress,
    handleMobileButtonRelease,
    submitAnswerToAI,
    isGameFinished,
    totalNpcs,
    feedbackTimeRemaining,
    feedbackDuration
  } = useGame({ subject });

  // These functions are needed for QuizResults
  const handleTryAgain = () => {
    router.push("/game"); // Restart the game
  };

  const handleBackToQuizzes = () => {
    router.push("/choose-subject"); // Go back to subject selection
  };

  // Show QuizResults when the game is finished
  if (isGameFinished) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <QuizResults
          isAiQuiz={true} // This is an AI quiz
          aiScore={score} // The score from the game
          aiTotalAnswered={totalNpcs} // Total NPCs equals total questions
          quiz={null} // No predefined quiz for AI mode
          answers={[]} // No detailed answers in AI mode
          onTryAgain={handleTryAgain}
          onBackToQuizzes={handleBackToQuizzes}
        />
      </div>
    );
  }

  // Render the game if not finished
  return (
    <div className="relative w-full h-screen overflow-hidden bg-blue-200">
      <GameBackground position={position} />
      <Player direction={direction} isMoving={isMoving} />
      <NPCs npcs={visibleNpcs} interactionDistance={npcInteractionDistance} />

      <div className="absolute top-16 flex flex-col items-center z-50 w-full justify-center">
        {activeNpc && currentQuestion && (
          <QuestionPopup
            question={currentQuestion}
            onAnswer={submitAnswerToAI}
            isAnswering={isSubmittingAnswer && !feedbackMessage}
          />
        )}

        {feedbackMessage && (
          <FeedbackMessage 
            message={feedbackMessage} 
            type={feedbackType} 
            timeRemaining={feedbackTimeRemaining}
            totalDuration={feedbackDuration}
          />
        )}
      </div>

      <MobileControls
        onButtonPress={handleMobileButtonPress}
        onButtonRelease={handleMobileButtonRelease}
      />
    </div>
  );
}
