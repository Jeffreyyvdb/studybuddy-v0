import { AIQuizResponse } from "./use-quiz-types";
import { QuizQuestion } from "../types/game";

// Cache for AI questions to avoid repeated API calls for the same question
const aiQuestionsCache: Record<string, QuizQuestion> = {};

/**
 * Fetches a single AI-generated question on demand
 * @param topic The topic for the question
 * @param npcId The NPC ID to use as a cache key
 * @param previousAnswer Information about the previous answer (for feedback)
 * @returns Promise with single AI-generated question
 */
export async function fetchSingleAIQuestion(
  topic: string = "general knowledge",
  npcId: number,
  previousAnswer?: {
    question: string;
    userAnswer: string;
    correctAnswer: string;
  }
): Promise<QuizQuestion | null> {
  // Generate a unique cache key for this NPC and topic
  const cacheKey = `${npcId}-${topic}`;

  // Check if we already have a cached question for this NPC
  // Only use cache for first questions, not for follow-ups with feedback
  if (aiQuestionsCache[cacheKey] && !previousAnswer) {
    return aiQuestionsCache[cacheKey];
  }

  try {
    // Determine if we should use open-ended or multiple-choice format
    // 30% chance for open question
    const questionType = Math.random() > 0.7 ? "open" : "multiple-choice";

    // Create the prompt based on whether we're providing feedback or requesting a new question
    let prompt = "";
    if (previousAnswer) {
      prompt = `I answered "${previousAnswer.userAnswer}" to the question "${previousAnswer.question}". The correct answer was "${previousAnswer.correctAnswer}". 
        Please provide detailed feedback on my answer and then generate a new ${questionType} question about ${topic}.
        If it's a multiple-choice question, provide exactly 4 options where the first one is the correct answer.
        For open questions, provide one correct answer and a detailed explanation of the concept.
        Format your response with a clear explanation of my previous answer, followed by the new question.`;
    } else {
      prompt = `Generate an educational ${questionType} question about ${topic}.
        ${
          questionType === "multiple-choice"
            ? "Provide exactly 4 options where the first option is the correct answer."
            : "For this open question, provide an appropriate correct answer and explanation that I can use to evaluate user responses."
        }
        Include a brief explanation that helps with learning.`;
    }

    // Initialize the chat with our prompt
    const message = {
      role: "user",
      content: prompt,
    };

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [message],
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    // Parse the response as JSON
    const data = await response.json();

    // Create an AIQuizResponse for the question
    const aiQuestion: AIQuizResponse = {
      question: data.question || `Question about ${topic}`,
      options: data.options || [],
      type: questionType === "multiple-choice" ? "multiple-choice" : "open",
      explanation: data.explanation || `This is related to ${topic}`,
      previousResponseCorrect: previousAnswer
        ? data.previousResponseCorrect
        : false,
      tag: topic,
      feedback: previousAnswer ? data.feedback : undefined,
    };

    // For multiple choice questions, ensure we have options
    if (
      aiQuestion.type === "multiple-choice" &&
      (!aiQuestion.options || aiQuestion.options.length < 4)
    ) {
      aiQuestion.options = [
        `Correct answer about ${topic}`,
        `Incorrect option 1 about ${topic}`,
        `Incorrect option 2 about ${topic}`,
        `Incorrect option 3 about ${topic}`,
      ];
    }

    // Convert to game-compatible QuizQuestion format
    const gameQuestion: QuizQuestion = {
      id: npcId,
      question: aiQuestion.question,
      options: aiQuestion.type === "multiple-choice" ? aiQuestion.options : [],
      correctAnswer:
        aiQuestion.type === "multiple-choice" && aiQuestion.options.length > 0
          ? aiQuestion.options[0]
          : data.correctAnswer || aiQuestion.question,
      aiData: aiQuestion,
    };

    // Only cache initial questions, not follow-ups with feedback
    if (!previousAnswer) {
      aiQuestionsCache[cacheKey] = gameQuestion;
    }

    return gameQuestion;
  } catch (error) {
    console.error("Error fetching AI question for NPC:", error);

    // Create a fallback question if the API call fails
    const fallbackQuestion: QuizQuestion = {
      id: npcId,
      question: `What's an interesting fact about ${topic}?`,
      options: [
        `${topic} is one of the most studied subjects`,
        `${topic} originated in ancient Greece`,
        `${topic} was discovered in the 18th century`,
        `${topic} has changed significantly in recent decades`,
      ],
      correctAnswer: `${topic} is one of the most studied subjects`,
    };

    // Cache the fallback question
    if (!previousAnswer) {
      aiQuestionsCache[cacheKey] = fallbackQuestion;
    }

    return fallbackQuestion;
  }
}

/**
 * Clears the AI questions cache to force a refresh
 */
export function clearAIQuestionsCache() {
  Object.keys(aiQuestionsCache).forEach((key) => {
    delete aiQuestionsCache[key];
  });
}
