"use client";

import { QuizIntro } from "@/components/quiz/quiz-intro";
import { QuizQuestion } from "@/components/quiz/quiz-question";
import { QuizResults } from "@/components/quiz/quiz-results";
import { QuizSelection } from "@/components/quiz/quiz-selection";
import { quizzes } from "@/data/quizzes";
import { useQuiz } from "@/lib/use-quiz";
import { AIQuizResponse } from "@/lib/quiz-types"; // Import AIQuizResponse
import { QuizQuestion as QuestionType } from "@/data/history-questions"; // Import QuestionType if needed for casting

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
        onSelectAiQuiz={quiz.actions.selectAiQuiz} // Pass the new action
      />
    );
  }

  // Guard against no selected quiz (might need adjustment for AI quiz later)
  if (!quiz.selectedQuiz && !quiz.isAiQuiz) {
    return <div>Loading...</div>;
  }

  // Quiz Intro Screen (Skip for AI quiz for now)
  if (quiz.quizState === "intro" && !quiz.isAiQuiz) {
    return (
      <QuizIntro
        quiz={quiz.selectedQuiz!} // Non-null assertion as isAiQuiz is false
        onStartQuiz={quiz.actions.startQuiz}
        onBack={quiz.actions.returnToSelection}
      />
    );
  }

  // Question Screen
  if (quiz.quizState === "quiz") {
    const isAi = quiz.isAiQuiz;
    const questionData = isAi ? quiz.currentAiQuestion : quiz.currentQuestion;
    const currentIdx = isAi ? quiz.aiTotalAnswered : quiz.currentQuestionIndex;

    if (questionData && quiz.totalQuestions > 0) {
      // Adapt AI/Standard question data for QuizQuestion component
      const questionForComponent = isAi
        ? { // Adapt AI response to match DisplayQuestion type
            id: `ai-${currentIdx}`, // Provide the required id
            question: (questionData as AIQuizResponse).question,
            // Include options even if empty for type consistency, QuizQuestion handles rendering
            options: (questionData as AIQuizResponse).options || [],
            // Provide dummy correctAnswer or handle optionality in DisplayQuestion
            correctAnswer: "", // Or make correctAnswer optional in the AI part of DisplayQuestion
            // Include type and explanation from AI response
            type: (questionData as AIQuizResponse).type,
            explanation: (questionData as AIQuizResponse).explanation,
          }
        : questionData as QuestionType; // Assert as QuestionType for non-AI

      // Type assertion to satisfy the component's expected prop type
      const displayQuestion = questionForComponent as QuestionType | (Omit<AIQuizResponse, 'options' | 'previousResponseCorrect' | 'tag'> & { id: string; correctAnswer?: string });

      return (
        <QuizQuestion
          question={displayQuestion} // Pass the correctly typed and structured data
          currentIndex={currentIdx}
          totalQuestions={quiz.totalQuestions}
          selectedAnswer={quiz.selectedAnswer || ""}
          showFeedback={quiz.showFeedback}
          isCorrect={quiz.isCorrect ?? false}
          onSelectAnswer={quiz.actions.handleAnswerSelect}
          onSubmitAnswer={quiz.actions.submitAnswer}
          onCancelQuiz={quiz.actions.returnToSelection}
          isSubmittingAnswer={quiz.isSubmittingAiAnswer}
          isAiQuiz={isAi}
          aiQuestionType={isAi ? (questionData as AIQuizResponse).type : undefined}
          aiExplanation={isAi ? (questionData as AIQuizResponse).explanation : undefined}
          onProceed={quiz.actions.proceedToNextStep} // Add the onProceed prop
        />
      );
    } else if (isAi && !questionData) {
      return <div>Loading AI question...</div>;
    } else {
      return <div>Loading quiz...</div>;
    }
  }

  // Results Screen
  if (quiz.quizState === "results") {
    // Prepare answers data for QuizResults
    const resultsAnswers = quiz.isAiQuiz
      ? [] // AI quiz doesn't use the standard answers format for results display yet
      : Object.entries(quiz.answers).map(([id, answer]) => {
          const question = quiz.selectedQuiz?.questions.find(q => q.id.toString() === id);
          return {
            questionId: id,
            questionText: question?.question || "Question not found",
            selectedAnswer: answer,
            isCorrect: question ? answer === question.correctAnswer : null,
          };
        });

    return (
      <QuizResults
        quiz={quiz.selectedQuiz || null}
        answers={resultsAnswers} // Pass the processed answers
        onTryAgain={quiz.isAiQuiz ? quiz.actions.restartAiQuiz : quiz.actions.restartQuiz}
        onBackToQuizzes={quiz.actions.returnToSelection}
        isAiQuiz={quiz.isAiQuiz}
        aiScore={quiz.isAiQuiz ? quiz.aiScore : undefined}
        aiTotalAnswered={quiz.isAiQuiz ? quiz.aiTotalAnswered : undefined}
      />
    );
  }

  // Fallback
  return <div>Loading...</div>;
}
