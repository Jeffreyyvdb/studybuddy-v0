import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuizData } from "@/data/quizzes";
import { Check, X } from "lucide-react";
import { useMemo } from "react"; // Import useMemo

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
}

export function QuizResults({
  quiz,
  answers,
  onTryAgain,
  onBackToQuizzes,
  // --- AI Props ---
  isAiQuiz,
  aiScore,
  aiTotalAnswered,
}: QuizResultsProps) {
  // Calculate score for predefined quizzes
  const predefinedScore = useMemo(() => {
    if (isAiQuiz || !quiz) return 0;
    return answers.filter((a) => a.isCorrect).length;
  }, [answers, quiz, isAiQuiz]);

  const totalQuestions = isAiQuiz ? aiTotalAnswered : quiz?.questions.length;
  const score = isAiQuiz ? aiScore : predefinedScore;

  // Handle cases where totalQuestions might be 0 or undefined to avoid NaN
  const percentage = totalQuestions && totalQuestions > 0
    ? Math.round(((score ?? 0) / totalQuestions) * 100)
    : 0;

  let feedbackMessage = "";
  if (percentage >= 80) {
    feedbackMessage = "Excellent work!";
  } else if (percentage >= 50) {
    feedbackMessage = "Good job, keep practicing!";
  } else {
    feedbackMessage = "Keep trying, you'll get there!";
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            {isAiQuiz ? "AI Quiz Complete!" : `${quiz?.title} Results`}
          </CardTitle>
          <CardDescription className="text-lg">
            {feedbackMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-5xl font-bold">{percentage}%</p>
            <p className="text-muted-foreground">
              You answered {score ?? 0} out of {totalQuestions ?? 0} questions correctly.
            </p>
          </div>

          {/* Only show detailed answers for predefined quizzes */}
          {!isAiQuiz && quiz && answers.length > 0 && (
            <div className="space-y-4 max-h-60 overflow-y-auto p-1">
              <h3 className="text-lg font-semibold mb-2">Review Your Answers:</h3>
              {answers.map((answer, index) => (
                <div key={index} className="border-b pb-2 mb-2">
                  <p className="font-medium">{index + 1}. {answer.questionText}</p>
                  <div className={`flex items-center ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {answer.isCorrect ? (
                      <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 mr-2 flex-shrink-0" />
                    )}
                    <span>Your answer: {answer.selectedAnswer}</span>
                  </div>
                  {!answer.isCorrect && (
                    <p className="text-sm text-muted-foreground ml-6">
                      Correct answer: {answer.correctAnswer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={onTryAgain} className="flex-1" size="lg">
              Try Again
            </Button>
            <Button
              onClick={onBackToQuizzes}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Back to Quizzes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
