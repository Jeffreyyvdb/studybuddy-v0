import React from "react";
import { FeedbackType } from "../../types/game";

interface FeedbackMessageProps {
  message: string | null;
  type: FeedbackType;
}

export const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  message,
  type,
}) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div
        className={`py-4 px-8 rounded-lg text-xl font-bold ${
          type === "correct"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        }`}
      >
        {message}
      </div>
    </div>
  );
};
