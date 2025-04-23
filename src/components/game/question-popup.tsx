import React, { useState } from "react"; // Import useState
import { NpcObject, QuizQuestion } from "../../types/game";
import { Input } from "@/components/ui/input"; // Import Input component
import { Button } from "@/components/ui/button"; // Import Button component

interface QuestionPopupProps {
  question: QuizQuestion;
  npc: NpcObject;
  onAnswer: (answer: string) => void;
  isAnswering: boolean;
}

export const QuestionPopup: React.FC<QuestionPopupProps> = ({
  question,
  npc,
  onAnswer,
  isAnswering,
}) => {
  // State for open-ended answer input
  const [openAnswer, setOpenAnswer] = useState("");

  const handleOpenAnswerSubmit = () => {
    if (openAnswer.trim() && !isAnswering) {
      onAnswer(openAnswer.trim());
    }
  };

  return (
    <div className="fixed top-15 flex w-full items-center justify-center z-40">
      <div className="p-6 max-w-md w-full relative">
        <h2 className="text-md font-bold mb-4 text-gray-800">
          {question.question}
        </h2>

        {/* Conditional Rendering: Multiple Choice vs Open Question */}
        {question.options && question.options.length > 0 ? (
          // Multiple Choice Options
          <div className="flex flex-col space-y-2">
            {question.options.map((option) => (
              <Button
                key={option}
                className="bg-white"
                size={"lg"}
                onClick={() => onAnswer(option)}
                disabled={isAnswering}
              >
                {option}
              </Button>
            ))}
          </div>
        ) : (
          // Open Question Input
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Type your answer here..."
              value={openAnswer}
              onChange={(e) => setOpenAnswer(e.target.value)}
              disabled={isAnswering}
              className="w-full"
            />
            <Button
              onClick={handleOpenAnswerSubmit}
              disabled={isAnswering || !openAnswer.trim()}
              className="w-full"
              size={"lg"}
            >
              {isAnswering ? "Submitting..." : "Submit Answer"}
            </Button>
          </div>
        )}

        {/* Loading Indicator (Optional - shown during submission) */}
        {isAnswering && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Evaluating...</span>
          </div>
        )}
      </div>
    </div>
  );
};
