// Common type definitions for game components
import { AIQuizResponse } from "../lib/use-quiz-types";

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  aiData?: AIQuizResponse; // Optional AI data for AI-generated questions
}

export interface NpcObject {
  id: number;
  position: number;
  character: string;
  questionId: number;
  answered: boolean;
  isAiQuestion?: boolean; // Flag to indicate if this NPC asks an AI question
  aiTopic?: string | null; // The topic for AI-generated questions
}

export type FeedbackType = "correct" | "incorrect" | null;
