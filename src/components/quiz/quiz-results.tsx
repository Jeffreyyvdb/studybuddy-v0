import { useMemo } from "react";
import { Progress } from "../ui/progress";

interface Answer {
  questionId: string;
  questionText: string;
  selectedAnswer: string | null;
  correctAnswer?: string;
  isCorrect: boolean | null;
}

interface QuizResultsProps {
  quiz: QuizData | null; // Can be null for AI quiz
  answers: Answer[];
  onTryAgain: () => void;
  onBackToQuizzes: () => void;
  // --- AI Specific Props ---
  isAiQuiz: boolean;
  aiScore?: number;
  aiTotalAnswered?: number;
  aiSubject?: string; // Added subject for AI quizzes
}

// Add the import for QuizData
import { QuizData } from "@/data/quizzes";
import { Button } from "../ui/button";

export function QuizResults({
  quiz,
  answers,
  onTryAgain,
  onBackToQuizzes,
  // --- AI Props ---
  isAiQuiz,
  aiScore,
  aiTotalAnswered,
  aiSubject,
}: QuizResultsProps) {
  // Calculate score for predefined quizzes
  const predefinedScore = useMemo(() => {
    if (isAiQuiz || !quiz) return 0;
    return answers.filter((a) => a.isCorrect).length;
  }, [answers, quiz, isAiQuiz]);

  const totalQuestions = isAiQuiz ? aiTotalAnswered : quiz?.questions.length;
  const score = isAiQuiz ? aiScore : predefinedScore;
  const subject = isAiQuiz ? aiSubject : quiz?.category;

  // Handle cases where totalQuestions might be 0 or undefined to avoid NaN
  const percentage =
    totalQuestions && totalQuestions > 0
      ? Math.round(((score ?? 0) / totalQuestions) * 100)
      : 0;

  // percentage = 80;

  return (
    <div className="min-h-[100dvh] w-full mt-18 pt-8 flex flex-col bg-blue-100 items-center p-4">
      {/* Center the card */}
      <span className="text-xl">Well done!</span>
      <span className="text-xl">You have finished this run</span>

      <div className="flex flex-col gap-2 mt-4 w-full">
        <span>Subject</span>
        <span className="bg-white rounded-lg w-full p-4">
          {subject || "Not specified"}
        </span>
        <span className="mt-4">Correct questions ({score} / {totalQuestions})</span>
        <div className="">
          <Progress
            value={percentage}
            className="w-full h-10 bg-green-200 [&>div]:bg-green-500"
          />
        </div>
        <span className="mt-4">Tips</span>
        <span className="bg-white text-sm rounded-lg w-full p-4">Math</span>
      </div>

      <div className="flex gap-4 mt-8">
        <Button
          variant="outline"
          size={"lg"}
          onClick={onBackToQuizzes}
          className=""
        >
          Back to Quizzes
        </Button>
      </div>
    </div>
  );
}
