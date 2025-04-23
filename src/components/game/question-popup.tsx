import React, { useState } from "react";
import { NpcObject, QuizQuestion } from "../../types/game";
import { Input } from "../ui/input";
import { Check, X } from "lucide-react";

interface QuestionPopupProps {
  question: QuizQuestion;
  npc: NpcObject;
  onAnswer: (answer: string) => void;
}

export const QuestionPopup: React.FC<QuestionPopupProps> = ({
  question,
  npc,
  onAnswer,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [inputAnswer, setInputAnswer] = useState("");

  // Check if this is an AI question with the "open" type
  const isAiQuestion = !!question.aiData;
  const isOpenQuestion = isAiQuestion && question.aiData?.type === "open";

  const handleOptionSelect = (option: string) => {
    if (showFeedback) return; // Prevent changing answer during feedback
    setSelectedAnswer(option);
  };

  const handleSubmit = () => {
    const answerToCheck = isOpenQuestion ? inputAnswer : selectedAnswer;
    if (!answerToCheck) return;

    const correct = answerToCheck === question.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    // After a short delay, send the answer back to the game
    setTimeout(() => {
      onAnswer(answerToCheck);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 bg-black/70">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl">{npc.character}</span>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          {question.question}
        </h2>

        {isOpenQuestion ? (
          <div className="mb-4">
            <Input
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="mb-3"
              disabled={showFeedback}
            />
          </div>
        ) : (
          <div className="space-y-2">
            {question.options.map((option) => {
              // Style logic for feedback
              let optionClass =
                "bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200";
              if (showFeedback) {
                if (option === question.correctAnswer) {
                  optionClass =
                    "bg-green-100 dark:bg-green-900/20 border-green-500";
                } else if (
                  option === selectedAnswer &&
                  option !== question.correctAnswer
                ) {
                  optionClass = "bg-red-100 dark:bg-red-900/20 border-red-500";
                }
              }

              return (
                <button
                  key={option}
                  className={`w-full py-3 px-4 ${optionClass} rounded-lg text-left font-medium transition-colors border-2 flex items-center justify-between`}
                  onClick={() => handleOptionSelect(option)}
                  disabled={showFeedback}
                >
                  {option}
                  {showFeedback && option === question.correctAnswer && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                  {showFeedback &&
                    option === selectedAnswer &&
                    option !== question.correctAnswer && (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                </button>
              );
            })}
          </div>
        )}

        {/* Explanation section for AI questions */}
        {showFeedback && question.aiData?.explanation && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              isCorrect
                ? "bg-green-100 dark:bg-green-900/20"
                : "bg-red-100 dark:bg-red-900/20"
            }`}
          >
            <p className="text-sm font-medium">{question.aiData.explanation}</p>
          </div>
        )}

        {/* Submit button */}
        {!showFeedback && (
          <button
            onClick={handleSubmit}
            disabled={isOpenQuestion ? !inputAnswer : !selectedAnswer}
            className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            Submit Answer
          </button>
        )}
      </div>
    </div>
  );
};
