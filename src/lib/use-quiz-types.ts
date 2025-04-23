export interface AIQuizResponse {
  question: string;
  options: string[];
  type: 'multiple-choice';
  // Optional: Add explanation if the AI provides it
  explanation?: string;
  previousResponseCorrect: boolean;
  tag: string;
}
