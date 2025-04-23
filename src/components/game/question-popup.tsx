import React from "react";
import { NpcObject, QuizQuestion } from "../../types/game";

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
  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 bg-black/70">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl">{npc.character}</span>
          </div>
        </div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {question.question}
        </h2>
        <div className="space-y-2">
          {question.options.map((option) => (
            <button
              key={option}
              className="w-full py-3 px-4 bg-blue-100 hover:bg-blue-200 rounded-lg text-left font-medium transition-colors"
              onClick={() => onAnswer(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
