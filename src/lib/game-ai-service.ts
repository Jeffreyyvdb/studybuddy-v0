import { AIQuizResponse } from "./use-quiz-types";
import { QuizQuestion } from "../types/game";

// Cache for AI questions to avoid repeated API calls for the same question
const aiQuestionsCache: Record<string, QuizQuestion> = {};

/**
 * Fetches a single AI-generated question on demand
 * @param topic The topic for the question
 * @param npcId The NPC ID to use as a cache key
 * @returns Promise with single AI-generated question
 */
export async function fetchSingleAIQuestion(
  topic: string = "general knowledge",
  npcId: number
): Promise<QuizQuestion | null> {
  // Generate a unique cache key for this NPC and topic
  const cacheKey = `${npcId}-${topic}`;

  // Check if we already have a cached question for this NPC
  if (aiQuestionsCache[cacheKey]) {
    return aiQuestionsCache[cacheKey];
  }

  try {
    // Initialize the chat with a question request
    const message = {
      role: "user",
      content: `I want to learn about ${topic}. Please give me a multiple-choice question with 4 options where the first option is the correct answer.`,
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
      question: data.question,
      options: data.options || [],
      type: data.type === "multiple_choice" ? "multiple-choice" : "open",
      explanation: data.explanation || "",
      previousResponseCorrect: false,
      tag: data.tag || topic,
    };

    // Convert to game-compatible QuizQuestion format
    const gameQuestion: QuizQuestion = {
      id: npcId,
      question: aiQuestion.question,
      options:
        aiQuestion.type === "multiple-choice"
          ? aiQuestion.options
          : ["Yes", "No"],
      correctAnswer:
        aiQuestion.type === "multiple-choice" && aiQuestion.options.length > 0
          ? aiQuestion.options[0] // First option is correct in this implementation
          : aiQuestion.question,
      aiData: aiQuestion, // Keep the original AI data for reference
    };

    // Cache the question
    aiQuestionsCache[cacheKey] = gameQuestion;

    return gameQuestion;
  } catch (error) {
    console.error("Error fetching AI question for NPC:", error);
    return null;
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
