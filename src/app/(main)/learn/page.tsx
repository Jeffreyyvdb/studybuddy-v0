import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LearnPage() {
  return (
    <div className="container p-3">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Learn with Study Buddy
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>History Quiz</CardTitle>
          <CardDescription>
            Test your knowledge of historical events and figures with our
            interactive quiz.
          </CardDescription>
        </CardHeader>
        <CardContent></CardContent>
        <CardFooter className="flex justify-end">
          <Button>Start</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
