import { QuizData } from "@/data/quizzes";
import { useState, useEffect } from "react";
import { useUI } from "./ui-context";

export type QuizState = "selection" | "intro" | "quiz" | "results";

interface UseQuizOptions {
  quizzes: QuizData[];
  feedbackDelay?: number;
}

export function useQuiz({ quizzes, feedbackDelay = 1500 }: UseQuizOptions) {
  const [quizState, setQuizState] = useState<QuizState>("selection");
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);

  // Get UI context functions to control navigation bars
  const { hideNavBars, showNavBars } = useUI();

  // Control navigation bars visibility based on quiz state
  useEffect(() => {
    if (quizState === "quiz") {
      // Hide navigation bars when in quiz mode
      hideNavBars();
    } else {
      // Show navigation bars for selection, intro, and results
      showNavBars();
    }

    // Always ensure nav bars are shown when component unmounts
    return () => showNavBars();
  }, [quizState, hideNavBars, showNavBars]);

  const selectedQuiz = selectedQuizId
    ? quizzes.find((quiz) => quiz.id === selectedQuizId)
    : null;

  const currentQuestion = selectedQuiz?.questions[currentQuestionIndex];
  const isCorrect =
    currentQuestion && selectedAnswer === currentQuestion.correctAnswer;

  const selectQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setQuizState("intro");
  };

  const startQuiz = () => {
    setQuizState("quiz");
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setAnswers({});
    setShowFeedback(false);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const submitAnswer = () => {
    if (!currentQuestion) return;

    // Save current answer
    const newAnswers = { ...answers };
    newAnswers[currentQuestion.id] = selectedAnswer;
    setAnswers(newAnswers);

    // Show feedback before moving on
    setShowFeedback(true);

    // Auto-advance after feedback
    setTimeout(() => {
      setShowFeedback(false);

      if (currentQuestionIndex < (selectedQuiz?.questions.length || 0) - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer("");
      } else {
        setQuizState("results");
      }
    }, feedbackDelay);
  };

  const returnToSelection = () => {
    setQuizState("selection");
    setSelectedQuizId(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setAnswers({});
    setShowFeedback(false);
  };

  const restartQuiz = () => {
    setQuizState("intro");
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setAnswers({});
    setShowFeedback(false);
  };

  const calculateScore = () => {
    if (!selectedQuiz) return { score: 0, total: 0, percentage: 0 };

    let score = 0;
    selectedQuiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    return {
      score,
      total: selectedQuiz.questions.length,
      percentage: Math.round((score / selectedQuiz.questions.length) * 100),
    };
  };

  return {
    quizState,
    quizzes,
    selectedQuiz,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions: selectedQuiz?.questions.length || 0,
    selectedAnswer,
    answers,
    showFeedback,
    isCorrect,
    actions: {
      selectQuiz,
      startQuiz,
      handleAnswerSelect,
      submitAnswer,
      restartQuiz,
      returnToSelection,
    },
    calculateScore,
  };
}
