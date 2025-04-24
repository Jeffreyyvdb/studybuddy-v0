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
    <div className="px-6 max-w-md flex items-center justify-center pointer-events-none">
      <div
        className={`py-4 px-8 rounded-lg font-bold ${
          type === "correct"
            ? "bg-green-500 text-white"
            : "bg-orange-500 text-white"
        }`}
      >
        {message}
      </div>
    </div>
  );
};
