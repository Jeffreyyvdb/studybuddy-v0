import { QuizData } from "./index";

export const mathQuiz: QuizData = {
  id: "math",
  title: "Math Quiz",
  description:
    "Test your mathematical skills with problems ranging from algebra to calculus.",
  category: "Mathematics",
  image: "/images/math-quiz.png", // You might need to add this image
  questions: [
    {
      id: 1,
      question: "What is the value of π (pi) to two decimal places?",
      options: ["3.12", "3.14", "3.16", "3.18"],
      correctAnswer: "3.14",
    },
    {
      id: 2,
      question: "What is the square root of 144?",
      options: ["12", "14", "16", "18"],
      correctAnswer: "12",
    },
    {
      id: 3,
      question: "If x + 5 = 12, what is the value of x?",
      options: ["5", "7", "8", "17"],
      correctAnswer: "7",
    },
    {
      id: 4,
      question: "What is the formula for the area of a circle?",
      options: ["πr", "2πr", "πr²", "2πr²"],
      correctAnswer: "πr²",
    },
    {
      id: 5,
      question: "What is 15% of 200?",
      options: ["15", "20", "30", "40"],
      correctAnswer: "30",
    },
  ],
};
