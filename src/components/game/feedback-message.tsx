import React from "react";
import { FeedbackType } from "../../types/game";
import { Progress } from "../ui/progress";

interface FeedbackMessageProps {
  message: string | null;
  type: FeedbackType;
  timeRemaining?: number;
  totalDuration?: number;
}

export const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  message,
  type,
  timeRemaining = 0,
  totalDuration = 8000
}) => {
  if (!message) return null;
  
  // Calculate progress percentage (inverted: 100% at start, 0% at end)
  const progressPercent = Math.max(0, Math.min(100, (timeRemaining / totalDuration) * 100));

  return (
    <div className="px-6 max-w-md flex flex-col items-center justify-center pointer-events-none">
      <div
        className={`py-4 px-8 rounded-lg text-xl font-bold ${
          type === "correct"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        }`}
      >
        {message}
      </div>
      <div className="w-full mt-2">
        <Progress value={progressPercent} 
          className={`h-1.5 ${
            type === "correct" ? "bg-green-300" : "bg-red-300"
          }`} 
        />
      </div>
    </div>
  );
};
