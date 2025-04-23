// Common type definitions for game components

export interface QuizQuestion {
  id: number | string; // Allow string IDs from AI
  question: string;
  options?: string[]; // Make options optional for open questions
  correctAnswer: string; // Still needed for predefined, maybe used by AI for context
  explanation?: string; // Add explanation from AI feedback
  previousResponseCorrect?: boolean; // Add feedback status
  tag: string; // Tag for AI questions
}

export interface NpcObject {
  id: number;
  position: number;
  character: string;
  answered: boolean;
}

export type FeedbackType = "correct" | "incorrect" | "error" | null; // Add 'error' type
