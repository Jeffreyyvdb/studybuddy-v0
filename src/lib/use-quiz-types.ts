export interface AIQuizResponse {
  question: string;
  options: string[]; // Keep options for multiple choice, might be empty for open
  type: "multiple-choice" | "open"; // Add 'open' type
  // Optional: Add explanation if the AI provides it
  explanation?: string;
  previousResponseCorrect: boolean;
  tag: string;
  feedback?: string; // Feedback on previous answers
  correctAnswer?: string; // Explicit correct answer for open questions
}
