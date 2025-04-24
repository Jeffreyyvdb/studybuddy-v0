import React, { useState, useEffect } from "react"; // Import useEffect as well
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
  const [hasAnswered, setHasAnswered] = useState(false); // Track if the question has been answered

  // Reset answered state when question changes
  useEffect(() => {
    setHasAnswered(false);
    setSelectedAnswer(null);
    setOpenAnswer("");
  }, [question.question]); // Reset when question changes

  const handleMultipleChoiceClick = (option: string) => {
    if (!isAnswering && !hasAnswered) {
      setSelectedAnswer(option); // Set the selected answer
      setHasAnswered(true); // Mark as answered
      onAnswer(option); // Call the original handler
    }
  };

  const handleOpenAnswerSubmit = () => {
    if (openAnswer.trim() && !isAnswering && !hasAnswered) {
      setHasAnswered(true); // Mark as answered
      onAnswer(openAnswer.trim());
    }
  };

  return (
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
              disabled={isAnswering || hasAnswered} // Disable if already answered or submitting
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isAnswering && !hasAnswered && openAnswer.trim()) {
                handleOpenAnswerSubmit();
              }
            }}
            disabled={isAnswering || hasAnswered} // Disable if already answered or submitting
            className="w-full"
          />
          <Button
            onClick={handleOpenAnswerSubmit}
            disabled={isAnswering || hasAnswered || !openAnswer.trim()} // Disable if already answered, submitting, or empty
            className="w-full"
            size={"lg"}
          >
            {isAnswering ? "Submitting..." : hasAnswered ? "Answered" : "Submit Answer"}
          </Button>
        </div>
      )}

      {/* Loading Indicator (Optional - shown during submission) */}
      {isAnswering && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Evaluating...</span>
        </div>
      )}
    </div>
  );
};
