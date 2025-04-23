import { QuizData } from "./index";

export const historyQuiz: QuizData = {
  id: "history",
  title: "History Quiz",
  description:
    "Test your knowledge of historical events and figures with our interactive quiz.",
  category: "History",
  image: "/images/history-quiz.png", // You might need to add this image
  questions: [
    {
      id: 1,
      question: "Who was the first president of the United States?",
      options: [
        "Thomas Jefferson",
        "George Washington",
        "John Adams",
        "Benjamin Franklin",
      ],
      correctAnswer: "George Washington",
    },
    {
      id: 2,
      question: "In what year did World War II end?",
      options: ["1943", "1944", "1945", "1946"],
      correctAnswer: "1945",
    },
    {
      id: 3,
      question: "Which ancient civilization built the Great Pyramids of Giza?",
      options: ["Romans", "Greeks", "Egyptians", "Persians"],
      correctAnswer: "Egyptians",
    },
    {
      id: 4,
      question: "Who wrote the Declaration of Independence?",
      options: [
        "George Washington",
        "Thomas Jefferson",
        "John Adams",
        "Benjamin Franklin",
      ],
      correctAnswer: "Thomas Jefferson",
    },
    {
      id: 5,
      question: "Which event marked the start of World War I?",
      options: [
        "Assassination of Archduke Franz Ferdinand",
        "The invasion of Poland",
        "The sinking of the Lusitania",
        "The bombing of Pearl Harbor",
      ],
      correctAnswer: "Assassination of Archduke Franz Ferdinand",
    },
  ],
};
