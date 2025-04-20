import { QuizData } from "./index";

export const scienceQuiz: QuizData = {
  id: "science",
  title: "Science Quiz",
  description:
    "Challenge your scientific knowledge with questions about physics, chemistry, and biology.",
  category: "Science",
  image: "/images/science-quiz.png", // You might need to add this image
  questions: [
    {
      id: 1,
      question: "What is the chemical symbol for gold?",
      options: ["Go", "Au", "Ag", "Gd"],
      correctAnswer: "Au",
    },
    {
      id: 2,
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Jupiter", "Mars", "Saturn"],
      correctAnswer: "Mars",
    },
    {
      id: 3,
      question: "What is the smallest unit of matter?",
      options: ["Atom", "Cell", "Molecule", "Electron"],
      correctAnswer: "Atom",
    },
    {
      id: 4,
      question: "What is the process by which plants make their own food?",
      options: ["Photosynthesis", "Respiration", "Fermentation", "Digestion"],
      correctAnswer: "Photosynthesis",
    },
    {
      id: 5,
      question: "What force keeps planets in orbit around the Sun?",
      options: ["Electromagnetic", "Nuclear", "Gravity", "Friction"],
      correctAnswer: "Gravity",
    },
  ],
};
