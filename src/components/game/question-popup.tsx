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
    <div className="fixed inset-0 flex items-center justify-center z-40 bg-black/70">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl relative">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl">{npc.character}</span>
          </div>
        </div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {question.question}
        </h2>

        {/* Conditional Rendering: Multiple Choice vs Open Question */}
        {question.options && question.options.length > 0 ? (
          // Multiple Choice Options
          <div className="space-y-2">
            {question.options.map((option) => (
              <button
                key={option}
                className={`w-full py-3 px-4 rounded-lg text-left font-medium transition-colors ${
                  isAnswering
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-100 hover:bg-blue-200"
                }`}
                onClick={() => onAnswer(option)}
                disabled={isAnswering}
              >
                {option}
              </button>
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
