import { QuizData } from "./index";

export const literatureQuiz: QuizData = {
  id: "literature",
  title: "Literature Quiz",
  description:
    "Test your knowledge of famous authors, books, and literary movements.",
  category: "Literature",
  image: "/images/literature-quiz.png", // You might need to add this image
  questions: [
    {
      id: 1,
      question: "Who wrote 'Romeo and Juliet'?",
      options: [
        "Charles Dickens",
        "Jane Austen",
        "William Shakespeare",
        "Mark Twain",
      ],
      correctAnswer: "William Shakespeare",
    },
    {
      id: 2,
      question:
        "Which novel begins with the line 'It was the best of times, it was the worst of times'?",
      options: [
        "Moby Dick",
        "A Tale of Two Cities",
        "Pride and Prejudice",
        "Great Expectations",
      ],
      correctAnswer: "A Tale of Two Cities",
    },
    {
      id: 3,
      question: "Who is the author of the Harry Potter series?",
      options: [
        "J.R.R. Tolkien",
        "J.K. Rowling",
        "C.S. Lewis",
        "George R.R. Martin",
      ],
      correctAnswer: "J.K. Rowling",
    },
    {
      id: 4,
      question:
        "What is the name of the fictional country where 'The Lion, the Witch and the Wardrobe' is set?",
      options: ["Narnia", "Middle-earth", "Westeros", "Hogwarts"],
      correctAnswer: "Narnia",
    },
    {
      id: 5,
      question: "Who wrote '1984'?",
      options: ["Aldous Huxley", "Ray Bradbury", "George Orwell", "H.G. Wells"],
      correctAnswer: "George Orwell",
    },
  ],
};
