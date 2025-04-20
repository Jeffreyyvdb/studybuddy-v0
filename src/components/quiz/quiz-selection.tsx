import { QuizData } from "@/data/quizzes";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { BookOpen, BrainCircuit, Calculator, FlaskConical } from "lucide-react";

interface QuizSelectionProps {
  quizzes: QuizData[];
  onSelectQuiz: (quizId: string) => void;
}

export function QuizSelection({ quizzes, onSelectQuiz }: QuizSelectionProps) {
  // Helper function to get the appropriate icon for each quiz category
  const getQuizIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "history":
        return <BookOpen className="h-8 w-8 text-orange-500" />;
      case "science":
        return <FlaskConical className="h-8 w-8 text-blue-500" />;
      case "mathematics":
        return <Calculator className="h-8 w-8 text-green-500" />;
      case "literature":
        return <BookOpen className="h-8 w-8 text-purple-500" />;
      default:
        return <BrainCircuit className="h-8 w-8 text-primary" />;
    }
  };

  return (
    <div className="container p-3">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Study Quizzes</h1>
        <p className="text-muted-foreground text-lg">
          Choose a quiz to test your knowledge and improve your skills
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => (
          <Card
            key={quiz.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="bg-muted/50 p-3 rounded-lg">
                  {getQuizIcon(quiz.category)}
                </div>
                <div>
                  <CardTitle>{quiz.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {quiz.category} • {quiz.questions.length} questions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {quiz.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => onSelectQuiz(quiz.id)}>
                Start Quiz
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
