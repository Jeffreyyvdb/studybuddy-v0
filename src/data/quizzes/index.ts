import { historyQuiz } from "./history";
import { scienceQuiz } from "./science";
import { mathQuiz } from "./math";
import { literatureQuiz } from "./literature";

export interface QuizData {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export const quizzes: QuizData[] = [
  historyQuiz,
  scienceQuiz,
  mathQuiz,
  literatureQuiz,
];
