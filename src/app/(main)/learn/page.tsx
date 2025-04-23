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

    // Ensure we have valid question data AND a positive total question count before rendering
    if (questionData && quiz.totalQuestions > 0) {
      // Adapt AI question data slightly for QuizQuestion component if needed
      // QuizQuestion expects id, question, options, correctAnswer
      // AIQuizResponse has question, options, type, explanation, previousResponseCorrect
      // We need to handle this potential mismatch.
      // For now, let's assume QuizQuestion can handle the AI structure or we need a different component.
      // Let's pass the data conditionally based on type for now, focusing on fixing standard quiz.

      const questionForComponent = isAi
        ? { // Adapt AI response - NOTE: This might need refinement based on QuizQuestion needs
            id: `ai-${currentIdx}`, // Generate a temporary ID
            question: questionData.question,
            options: questionData.options,
            correctAnswer: "", // QuizQuestion uses this for feedback, AI handles feedback differently
            type: questionData.type,
            explanation: questionData.explanation
          }
        : questionData; // Use predefined question directly

      return (
        <QuizQuestion
          // @ts-ignore // Temporary ignore until QuizQuestion properly handles AI type or we use a different component
          question={questionForComponent}
          currentIndex={currentIdx}
          totalQuestions={quiz.totalQuestions}
          selectedAnswer={quiz.selectedAnswer || ""}
          showFeedback={quiz.showFeedback}
          isCorrect={quiz.isCorrect ?? false}
          onSelectAnswer={quiz.actions.handleAnswerSelect}
          onSubmitAnswer={quiz.actions.submitAnswer}
          onCancelQuiz={quiz.actions.returnToSelection}
          isSubmittingAnswer={quiz.isSubmittingAiAnswer} // Pass the loading state
          isAiQuiz={isAi}
          aiQuestionType={isAi ? quiz.currentAiQuestion?.type : undefined}
          aiExplanation={isAi ? quiz.currentAiQuestion?.explanation : undefined}
        />
      );
    } else if (isAi && !questionData) {
      // Specific loading state for AI quiz while fetching the first question
      return <div>Loading AI question...</div>;
    } else {
      // Generic loading or fallback state if conditions aren't met
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
