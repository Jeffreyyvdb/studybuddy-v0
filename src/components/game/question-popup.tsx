import React, { useState } from "react"; // Import useState
import { QuizQuestion } from "../../types/game";
import { Input } from "@/components/ui/input"; // Import Input component
import { Button } from "@/components/ui/button"; // Import Button component

interface QuestionPopupProps {
  question: QuizQuestion;
  onAnswer: (answer: string) => void;
  isAnswering: boolean;
}

export const QuestionPopup: React.FC<QuestionPopupProps> = ({
  question,
  onAnswer,
  isAnswering,
}) => {
  // State for open-ended answer input
  const [openAnswer, setOpenAnswer] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null); // State to track selected answer

  const handleMultipleChoiceClick = (option: string) => {
    if (!isAnswering) {
      setSelectedAnswer(option); // Set the selected answer
      onAnswer(option); // Call the original handler
    }
  };

  const handleOpenAnswerSubmit = () => {
    if (openAnswer.trim() && !isAnswering) {
      onAnswer(openAnswer.trim());
    }
  };

  return (
    <div className="fixed top-15 flex w-full items-center justify-start z-40">
      <div className="p-6 max-w-md w-full relative">
        <span className="text-accent">{question.tag}</span>

        {/* Keep the question text without the outline */}
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
                // Apply outline if this option is the selected one
                className={`bg-white ${
                  selectedAnswer === option
                    ? "border-4 border-primary" // Add outline class if selected
                    : ""
                }`}
                size={"lg"}
                onClick={() => handleMultipleChoiceClick(option)} // Use the new handler
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
