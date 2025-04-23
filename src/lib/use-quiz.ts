import { QuizData } from "@/data/quizzes";
import { useState, useEffect, useCallback } from "react";
import { useUI } from "./ui-context";
import { AIQuizResponse } from "./use-quiz-types"; // Import the correct type

export type QuizState = "selection" | "intro" | "quiz" | "results";

const MAX_QUESTIONS = 10; // Define the maximum number of questions

interface UseQuizOptions {
  quizzes: QuizData[];
  feedbackDelay?: number;
}

// --- AI Quiz Request Body Type ---
interface AIQuizAnswerPayload {
  type: "answer";
  topic: string;
  question: string; // Send the question text being answered
  answer: string;
}

interface AIQuizStartPayload {
  type: "start";
  topic: string;
}

export function useQuiz({ quizzes, feedbackDelay = 1000 }: UseQuizOptions) {
  const [quizState, setQuizState] = useState<QuizState>("selection");
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // --- AI Quiz Specific State ---
  const [isAiQuiz, setIsAiQuiz] = useState(false);
  const [currentAiTopic, setCurrentAiTopic] = useState<string | null>(null);
  const [currentAiQuestion, setCurrentAiQuestion] = useState<AIQuizResponse | null>(null);
  const [aiScore, setAiScore] = useState(0);
  const [aiTotalAnswered, setAiTotalAnswered] = useState(0);
  const [isSubmittingAiAnswer, setIsSubmittingAiAnswer] = useState(false);

  // Get UI context functions to control navigation bars
  const { hideNavBars, showNavBars } = useUI();

  // Control navigation bars visibility based on quiz state
  useEffect(() => {
    if (quizState === "quiz") {
      hideNavBars();
    } else {
      showNavBars();
    }

    return () => showNavBars();
  }, [quizState, hideNavBars, showNavBars]);

  const selectedQuiz = selectedQuizId
    ? quizzes.find((quiz) => quiz.id === selectedQuizId)
    : null;

  const currentQuestion = selectedQuiz?.questions[currentQuestionIndex];

  const totalQuestions = isAiQuiz
    ? MAX_QUESTIONS
    : Math.min(selectedQuiz?.questions.length || 0, MAX_QUESTIONS);

  const selectQuiz = (quizId: string) => {
    setIsAiQuiz(false);
    setSelectedQuizId(quizId);
    setQuizState("intro");
  };

  const startQuiz = () => {
    setQuizState("quiz");
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowFeedback(false);
    setIsCorrect(null);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback || isSubmittingAiAnswer) return;
    setSelectedAnswer(answer);
  };

  const fetchAiQuestion = useCallback(async (topic: string, payload: AIQuizStartPayload | AIQuizAnswerPayload) => {
    setIsSubmittingAiAnswer(true);
    if (payload.type === "start") {
      setShowFeedback(false);
      setIsCorrect(null);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: JSON.stringify(payload) }] }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch AI question. Status: ${response.status}`);
      }

      const data: AIQuizResponse = await response.json();
      let nextTotalAnswered = aiTotalAnswered; // Store current value

      if (payload.type === "answer") {
        const wasCorrect = !!data.previousResponseCorrect;
        setIsCorrect(wasCorrect);
        setShowFeedback(true);

        if (wasCorrect) {
          setAiScore((prev) => prev + 1);
        }
        // Update the count immediately for the check below
        nextTotalAnswered = aiTotalAnswered + 1;
        setAiTotalAnswered(nextTotalAnswered);

        setTimeout(() => {
          // Check if the quiz should end
          if (nextTotalAnswered >= MAX_QUESTIONS) {
            setQuizState("results");
            setShowFeedback(false); // Hide feedback before showing results
            setIsCorrect(null);
            setIsSubmittingAiAnswer(false);
          } else {
            // Continue to the next question
            setCurrentAiQuestion(data);
            setSelectedAnswer(null);
            setShowFeedback(false);
            setIsCorrect(null);
            setIsSubmittingAiAnswer(false);
          }
        }, feedbackDelay);
      } else {
        // Start of AI quiz
        setCurrentAiQuestion(data);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setIsCorrect(null);
        setIsSubmittingAiAnswer(false);
      }
    } catch (error) {
      console.error("Error interacting with AI quiz API:", error);
      // Consider how to handle errors, maybe go to results or show an error message
      setQuizState("results"); // Go to results on error for now
      setCurrentAiQuestion(null);
      setShowFeedback(false);
      setIsCorrect(null);
      setIsSubmittingAiAnswer(false);
    }
  }, [feedbackDelay, aiTotalAnswered]); // Add aiTotalAnswered dependency

  const submitAnswer = () => {
    if (isAiQuiz) {
      if (!selectedAnswer || !currentAiTopic || !currentAiQuestion || isSubmittingAiAnswer || showFeedback) return;

      // Prevent submission if we've already reached the max questions (edge case)
      if (aiTotalAnswered >= MAX_QUESTIONS) {
        setQuizState("results");
        return;
      }

      const payload: AIQuizAnswerPayload = {
        type: "answer",
        topic: currentAiTopic,
        question: currentAiQuestion.question,
        answer: selectedAnswer,
      };
      fetchAiQuestion(currentAiTopic, payload);
    } else {
      // Predefined Quiz Logic
      if (!currentQuestion || !selectedAnswer || showFeedback) return;

      const newAnswers = { ...answers };
      newAnswers[currentQuestion.id] = selectedAnswer;
      setAnswers(newAnswers);

      const correct = selectedAnswer === currentQuestion.correctAnswer;
      setIsCorrect(correct);
      setShowFeedback(true);

      setTimeout(() => {
        setShowFeedback(false);
        setIsCorrect(null);

        // Check against totalQuestions which respects MAX_QUESTIONS
        if (currentQuestionIndex < totalQuestions - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
        } else {
          setQuizState("results");
        }
      }, feedbackDelay);
    }
  };

  const returnToSelection = () => {
    setQuizState("selection");
    setSelectedQuizId(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowFeedback(false);
    setIsCorrect(null);
    setIsAiQuiz(false);
    setCurrentAiTopic(null);
    setCurrentAiQuestion(null);
    setAiScore(0);
    setAiTotalAnswered(0);
    setIsSubmittingAiAnswer(false);
  };

  const restartQuiz = () => {
    if (!isAiQuiz && selectedQuizId) {
      setQuizState("intro");
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setAnswers({});
      setShowFeedback(false);
      setIsCorrect(null);
    } else {
      if (isAiQuiz && currentAiTopic) {
        restartAiQuiz();
      } else {
        returnToSelection();
      }
    }
  };

  const calculateScore = () => {
    if (isAiQuiz) {
      // Return score for AI quiz
      return {
        score: aiScore,
        total: aiTotalAnswered, // Use the actual number answered, capped at MAX_QUESTIONS
        percentage: aiTotalAnswered > 0 ? Math.round((aiScore / aiTotalAnswered) * 100) : 0,
      };
    }

    // Original logic for predefined quizzes
    if (!selectedQuiz) return { score: 0, total: 0, percentage: 0 };

    let score = 0;
    // Ensure we only score up to totalQuestions (which is capped at MAX_QUESTIONS)
    selectedQuiz.questions.slice(0, totalQuestions).forEach((q) => {
      // Assuming answers keys are the question IDs
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    }); // Correctly close the forEach loop

    return {
      score,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0,
    };
  };

  const selectAiQuiz = useCallback((topic: string) => {
    setIsAiQuiz(true);
    setSelectedQuizId(null);
    setCurrentAiTopic(topic);
    setCurrentAiQuestion(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(null);
    setAiScore(0);
    setAiTotalAnswered(0);
    setQuizState("quiz");

    const startPayload: AIQuizStartPayload = { type: "start", topic };
    fetchAiQuestion(topic, startPayload);
  }, [fetchAiQuestion]);

  const restartAiQuiz = useCallback(() => {
    if (currentAiTopic) {
      setCurrentAiQuestion(null);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(null);
      setAiScore(0);
      setAiTotalAnswered(0);
      setIsSubmittingAiAnswer(false);
      const startPayload: AIQuizStartPayload = { type: "start", topic: currentAiTopic };
      fetchAiQuestion(currentAiTopic, startPayload);
    }
  }, [currentAiTopic, fetchAiQuestion]);

  return {
    quizState,
    quizzes,
    selectedQuiz,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions: totalQuestions, // Use the calculated totalQuestions
    selectedAnswer,
    answers,
    showFeedback,
    isCorrect,
    isAiQuiz,
    currentAiQuestion,
    aiScore,
    aiTotalAnswered,
    isSubmittingAiAnswer,
    actions: {
      selectQuiz,
      selectAiQuiz,
      restartAiQuiz,
      startQuiz,
      handleAnswerSelect,
      submitAnswer,
      restartQuiz,
      returnToSelection,
    },
    calculateScore,
  };
}
