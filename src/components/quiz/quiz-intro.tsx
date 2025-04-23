import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuizData } from "@/data/quizzes";
import { ChevronLeft } from "lucide-react";

interface QuizIntroProps {
  quiz: QuizData;
  onStartQuiz: () => void;
  onBack: () => void;
}

export function QuizIntro({ quiz, onStartQuiz, onBack }: QuizIntroProps) {
  return (
    <div className="container p-3">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Learn with Study Buddy
      </h1>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={onBack}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Back to Quizzes
            </span>
          </div>
          <CardTitle>{quiz.title}</CardTitle>
          <CardDescription>{quiz.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-2">
            • {quiz.questions.length} questions about{" "}
            {quiz.category.toLowerCase()}
          </p>
          <p className="mb-2">• Multiple choice format</p>
          <p className="mb-2">• Get instant feedback on your answers</p>
          <p>• Review your results at the end</p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={onStartQuiz}>Start Quiz</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
