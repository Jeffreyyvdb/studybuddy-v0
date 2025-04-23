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
import { Input } from "@/components/ui/input";
import { QuizQuestion as QuestionType } from "@/data/history-questions";
import { AIQuizResponse } from "@/lib/use-quiz-types";
import { Check, X } from "lucide-react";

type DisplayQuestion = QuestionType | (Omit<AIQuizResponse, 'options' | 'previousResponseCorrect' | 'tag'> & { id: string; correctAnswer?: string });

interface QuizQuestionProps {
  question: DisplayQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: string;
  showFeedback: boolean;
  isCorrect: boolean;
  onSelectAnswer: (answer: string) => void;
  onSubmitAnswer: () => void;
  onCancelQuiz: () => void;
  isSubmittingAnswer: boolean;
  isAiQuiz?: boolean;
  aiQuestionType?: "open" | "multiple_choice";
  aiExplanation?: string;
  onProceed: () => void; // Add prop for proceeding
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
  isSubmittingAnswer,
  isAiQuiz,
  aiQuestionType,
  aiExplanation,
  onProceed, // Destructure the new prop
}: QuizQuestionProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const isOpenQuestion = isAiQuiz && aiQuestionType === "open";

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <div className="container p-3 flex-1 flex flex-col">
        <div className="mt-4 mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="flex flex-col mt-4">
          <CardHeader>
            <div className="flex">
              <CardTitle className="text-3xl flex-grow">
                {question.question}
              </CardTitle>
              <Button size="icon" variant="destructive" onClick={onCancelQuiz}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <div className="">
            <CardContent>
              {isOpenQuestion ? (
                <div>
                  <Label htmlFor="open-answer" className="text-lg mb-2 block">
                    Your Answer:
                  </Label>
                  <Input
                    id="open-answer"
                    value={selectedAnswer}
                    onChange={(e) => onSelectAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="text-lg mb-4"
                    disabled={showFeedback || isSubmittingAnswer}
                  />
                  {showFeedback && aiExplanation && (
                    <p
                      className={`mt-4 text-sm ${
                        isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {aiExplanation}
                    </p>
                  )}
                </div>
              ) : (
                <RadioGroup
                  value={selectedAnswer}
                  className={showFeedback ? "pointer-events-none" : ""}
                >
                  {(question as QuestionType).options?.map((option, index) => {
                    let optionClass = "";
                    const isCorrectOption =
                      option === (question as QuestionType).correctAnswer;
                    const isSelectedIncorrect =
                      option === selectedAnswer && !isCorrectOption;

                    if (showFeedback) {
                      if (isCorrectOption) {
                        optionClass =
                          "bg-green-100 dark:bg-green-900/20 border-green-500";
                      } else if (isSelectedIncorrect) {
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
                          className="cursor-pointer w-full text-lg"
                        >
                          {option}
                        </Label>

                        {showFeedback && isCorrectOption && (
                          <Check className="h-5 w-5 text-green-500 ml-auto" />
                        )}
                        {showFeedback && isSelectedIncorrect && (
                          <X className="h-5 w-5 text-red-500 ml-auto" />
                        )}
                      </div>
                    );
                  })}
                  {showFeedback && aiExplanation && !isOpenQuestion && (
                    <p
                      className={`mt-4 text-sm ${
                        isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {aiExplanation}
                    </p>
                  )}
                </RadioGroup>
              )}
            </CardContent>

            <CardFooter>
              {!showFeedback ? (
                <Button
                  onClick={onSubmitAnswer}
                  disabled={!selectedAnswer || isSubmittingAnswer} // Remove showFeedback from disabled condition
                  size="lg"
                  className="text-lg w-full"
                >
                  {isSubmittingAnswer
                    ? "Checking your answer..."
                    : currentIndex < totalQuestions - 1
                    ? "Submit Answer"
                    : "Finish Quiz"}
                </Button>
              ) : (
                <Button
                  onClick={onProceed} // Call onProceed when Continue is clicked
                  size="lg"
                  className="text-lg w-full"
                  variant={isCorrect ? "default" : "destructive"} // Style based on correctness
                >
                  Continue
                </Button>
              )}
            </CardFooter>
          </div>
        </Card>
      </div>
    </div>
  );
}
