"use client";

import { QuizIntro } from "@/components/quiz/quiz-intro";
import { QuizQuestion } from "@/components/quiz/quiz-question";
import { QuizResults } from "@/components/quiz/quiz-results";
import { QuizSelection } from "@/components/quiz/quiz-selection";
import { quizzes } from "@/data/quizzes";
import { useQuiz } from "@/lib/use-quiz";

export default function LearnPage() {
  const quiz = useQuiz({
    quizzes,
    feedbackDelay: 1500,
  });

  // Quiz Selection Screen
  if (quiz.quizState === "selection") {
    return (
      <QuizSelection
        quizzes={quiz.quizzes}
        onSelectQuiz={quiz.actions.selectQuiz}
      />
    );
  }

  // Guard against no selected quiz
  if (!quiz.selectedQuiz) {
    return <div>Loading...</div>;
  }

  // Quiz Intro Screen
  if (quiz.quizState === "intro") {
    return (
      <QuizIntro
        quiz={quiz.selectedQuiz}
        onStartQuiz={quiz.actions.startQuiz}
        onBack={quiz.actions.returnToSelection}
      />
    );
  }

  // Question Screen
  if (quiz.quizState === "quiz" && quiz.currentQuestion) {
    return (
      <QuizQuestion
        question={quiz.currentQuestion}
        currentIndex={quiz.currentQuestionIndex}
        totalQuestions={quiz.totalQuestions}
        selectedAnswer={quiz.selectedAnswer}
        showFeedback={quiz.showFeedback}
        isCorrect={quiz.isCorrect}
        onSelectAnswer={quiz.actions.handleAnswerSelect}
        onSubmitAnswer={quiz.actions.submitAnswer}
        onCancelQuiz={quiz.actions.returnToSelection}
      />
    );
  }

  // Results Screen
  if (quiz.quizState === "results" && quiz.selectedQuiz) {
    return (
      <QuizResults
        quiz={quiz.selectedQuiz}
        answers={quiz.answers}
        onTryAgain={quiz.actions.restartQuiz}
        onBackToQuizzes={quiz.actions.returnToSelection}
      />
    );
  }

  // Fallback (should never happen)
  return <div>Loading...</div>;
}
