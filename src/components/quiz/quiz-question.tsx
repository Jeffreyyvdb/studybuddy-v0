import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuizQuestion as QuestionType } from "@/data/history-questions";
import { Check, X } from "lucide-react";

interface QuizQuestionProps {
  question: QuestionType;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: string;
  showFeedback: boolean;
  isCorrect: boolean;
  onSelectAnswer: (answer: string) => void;
  onSubmitAnswer: () => void;
  onCancelQuiz: () => void;
}

export function QuizQuestion({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  showFeedback,
  isCorrect,
  onSelectAnswer,
  onSubmitAnswer,
  onCancelQuiz,
}: QuizQuestionProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <div className="container p-3 flex-1 flex flex-col">
        {/* Progress bar at top */}
        <div className="mt-4 mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Card with title at top, options and buttons at bottom */}
        <Card className="flex flex-col flex-1">
          <CardHeader>
            <CardTitle className="text-3xl">{question.question}</CardTitle>
          </CardHeader>

          <div className="mt-auto">
            <CardContent>
              <RadioGroup
                value={selectedAnswer}
                className={showFeedback ? "pointer-events-none" : ""}
              >
                {question.options.map((option, index) => {
                  let optionClass = "";

                  if (showFeedback) {
                    if (option === question.correctAnswer) {
                      optionClass =
                        "bg-green-100 dark:bg-green-900/20 border-green-500";
                    } else if (
                      option === selectedAnswer &&
                      option !== question.correctAnswer
                    ) {
                      optionClass =
                        "bg-red-100 dark:bg-red-900/20 border-red-500";
                    }
                  }

                  return (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 border rounded-lg p-3 mb-2 transition-colors ${optionClass}`}
                    >
                      <RadioGroupItem
                        value={option}
                        id={`option-${index}`}
                        onClick={() => onSelectAnswer(option)}
                        disabled={showFeedback}
                      />
                      <Label
                        htmlFor={`option-${index}`}
                        className="cursor-pointer w-full text-xl"
                      >
                        {option}
                      </Label>

                      {showFeedback && option === question.correctAnswer && (
                        <Check className="h-5 w-5 text-green-500 ml-auto" />
                      )}
                      {showFeedback &&
                        option === selectedAnswer &&
                        option !== question.correctAnswer && (
                          <X className="h-5 w-5 text-red-500 ml-auto" />
                        )}
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={onCancelQuiz} size="sm">
                Cancel Quiz
              </Button>
              <Button
                onClick={onSubmitAnswer}
                disabled={!selectedAnswer || showFeedback}
              >
                {showFeedback
                  ? isCorrect
                    ? "Correct! ✓"
                    : "Incorrect! ✗"
                  : currentIndex < totalQuestions - 1
                  ? "Submit Answer"
                  : "Finish Quiz"}
              </Button>
            </CardFooter>
          </div>
        </Card>
      </div>
    </div>
  );
}
