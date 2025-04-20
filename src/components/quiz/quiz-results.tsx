import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QuizData } from "@/data/quizzes";
import { Check, Grid, RotateCcw, X } from "lucide-react";

interface QuizResultsProps {
  quiz: QuizData;
  answers: Record<number, string>;
  onTryAgain: () => void;
  onBackToQuizzes: () => void;
}

export function QuizResults({
  quiz,
  answers,
  onTryAgain,
  onBackToQuizzes,
}: QuizResultsProps) {
  const calculateScore = () => {
    let score = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const score = calculateScore();
  const percentage = Math.round((score / quiz.questions.length) * 100);

  return (
    <div className="container p-3">
      <h1 className="text-3xl font-bold mb-4 text-center">
        {quiz.title} Results
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            Your Score: {score}/{quiz.questions.length}
          </CardTitle>
          <CardDescription className="text-center text-lg">
            You got {percentage}% of questions correct!
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Progress value={percentage} className="h-3 mb-6" />

          <h3 className="font-semibold text-lg mb-4">Review Your Answers:</h3>
          <div className="space-y-4">
            {quiz.questions.map((q, index) => {
              const isCorrect = answers[q.id] === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`border rounded-lg p-4 ${
                    isCorrect ? "border-green-500/50" : "border-red-500/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    <p className="font-medium">
                      Question {index + 1}: {q.question}
                    </p>
                  </div>

                  <p className="text-sm mt-2">
                    <span className="font-medium">Your answer: </span>
                    <span
                      className={
                        isCorrect
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {answers[q.id]}
                    </span>
                  </p>

                  {!isCorrect && (
                    <p className="text-sm mt-1">
                      <span className="font-medium">Correct answer: </span>
                      <span className="text-green-600 dark:text-green-400">
                        {q.correctAnswer}
                      </span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>

        <CardFooter className="flex justify-center gap-4">
          <Button onClick={onTryAgain} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={onBackToQuizzes} className="gap-2">
            <Grid className="h-4 w-4" />
            All Quizzes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
