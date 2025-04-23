// Common type definitions for game components

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface NpcObject {
  id: number;
  position: number;
  character: string;
  questionId: number;
  answered: boolean;
}

export type FeedbackType = "correct" | "incorrect" | null;
