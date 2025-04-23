import { useState, useEffect, useCallback } from "react";
import { NpcObject, QuizQuestion, FeedbackType } from "../types/game";
import { fetchSingleAIQuestion } from "./game-ai-service";

// Default questions for the game
const defaultQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    correctAnswer: "Paris",
  },
  {
    id: 2,
    question: "Which planet is closest to the Sun?",
    options: ["Mercury", "Venus", "Earth", "Mars"],
    correctAnswer: "Mercury",
  },
  {
    id: 3,
    question: "What is 2 + 2?",
    options: ["4", "3", "5", "22"],
    correctAnswer: "4",
  },
  {
    id: 4,
    question: "Who wrote Romeo and Juliet?",
    options: ["William Shakespeare", "Charles Dickens", "Jane Austen"],
    correctAnswer: "William Shakespeare",
  },
  {
    id: 5,
    question: "What is the largest mammal?",
    options: ["Blue Whale", "Elephant", "Giraffe", "Polar Bear"],
    correctAnswer: "Blue Whale",
  },
];

// Different NPC types
const defaultNpcTypes = ["🧙", "👩‍🏫", "👨‍🔬", "🧑‍⚕️", "👮"];

// Topics for AI-generated questions
const aiQuizTopics = [
  "History",
  "Science",
  "Math",
  "Geography",
  "Literature",
  "General Knowledge",
];

interface UseGameOptions {
  questions?: QuizQuestion[];
  npcTypes?: string[];
  npcSpawnInterval?: number;
  npcInteractionDistance?: number;
  movementSpeed?: number;
  worldWidth?: number;
  feedbackDuration?: number;
  useAiQuestions?: boolean;
  aiQuestionTopic?: string;
}

export function useGame({
  questions = defaultQuestions,
  npcTypes = defaultNpcTypes,
  npcSpawnInterval = 150,
  npcInteractionDistance = 50,
  movementSpeed = 3,
  worldWidth = 5000,
  feedbackDuration = 2000,
  useAiQuestions = true,
  aiQuestionTopic = "general knowledge",
}: UseGameOptions = {}) {
  // Game state
  const [position, setPosition] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [direction, setDirection] = useState(0); // -1: left, 0: stopped, 1: right
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(
    null
  );
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [npcs, setNpcs] = useState<NpcObject[]>([]);
  const [activeNpc, setActiveNpc] = useState<NpcObject | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);

  // Initialize NPCs
  useEffect(() => {
    const initialNpcs: NpcObject[] = [];
    // Place NPCs throughout the world at intervals
    for (let i = npcSpawnInterval; i < worldWidth; i += npcSpawnInterval) {
      const randomNpcType =
        npcTypes[Math.floor(Math.random() * npcTypes.length)];

      // Determine if this NPC will use an AI question
      const useAiQuestion = useAiQuestions && Math.random() > 0.3; // 70% chance to use AI question

      // For AI questions, we don't need to select a question ID now - we'll generate the question later
      // For non-AI questions, assign a random question from the predefined list
      const questionId = !useAiQuestion
        ? Math.floor(Math.random() * questions.length)
        : -1;

      // For AI NPCs, assign a random topic
      const aiTopic = useAiQuestion
        ? aiQuizTopics[Math.floor(Math.random() * aiQuizTopics.length)]
        : null;

      initialNpcs.push({
        id: i,
        position: i,
        character: randomNpcType,
        questionId: questionId,
        answered: false,
        isAiQuestion: useAiQuestion,
        aiTopic: aiTopic,
      });
    }
    setNpcs(initialNpcs);
  }, [npcSpawnInterval, worldWidth, npcTypes, questions, useAiQuestions]);

  // Fetch AI question for a specific NPC
  const fetchNpcQuestion = useCallback(async (npc: NpcObject) => {
    if (!npc.isAiQuestion || !npc.aiTopic) {
      return null;
    }

    setIsLoadingQuestion(true);
    try {
      const question = await fetchSingleAIQuestion(npc.aiTopic, npc.id);
      setIsLoadingQuestion(false);
      return question;
    } catch (error) {
      console.error("Error fetching question for NPC:", error);
      setIsLoadingQuestion(false);
      return null;
    }
  }, []);

  // Check if player is near an NPC to trigger question
  const checkNpcInteractions = useCallback(async () => {
    // Player is always at center of screen, so player position = distance
    const playerPosition = distance;

    // Find NPCs within interaction distance
    const nearbyNpc = npcs.find(
      (npc) =>
        !npc.answered &&
        Math.abs(npc.position - playerPosition) < npcInteractionDistance
    );

    if (nearbyNpc) {
      // Stop movement and show question
      setIsMoving(false);
      setActiveNpc(nearbyNpc);

      if (nearbyNpc.isAiQuestion) {
        // For AI questions, fetch on demand
        const aiQuestion = await fetchNpcQuestion(nearbyNpc);
        if (aiQuestion) {
          setCurrentQuestion(aiQuestion);
        } else {
          // Fallback to a default question if AI fails
          setCurrentQuestion(questions[0]);
        }
      } else {
        // For regular questions, use the predefined one
        setCurrentQuestion(questions[nearbyNpc.questionId % questions.length]);
      }
    }
  }, [distance, npcs, npcInteractionDistance, questions, fetchNpcQuestion]);

  // Handle movement logic
  useEffect(() => {
    if (!isMoving || currentQuestion || isLoadingQuestion) return;

    let animationId: number;

    const animate = () => {
      // Move background based on direction and speed
      const moveAmount = direction * movementSpeed;
      setPosition((prev) => prev - moveAmount); // Subtract to move background in opposite direction

      // Update distance traveled (only count forward movement)
      if (direction === 1) {
        setDistance((prev) => prev + movementSpeed);
      } else if (direction === -1) {
        setDistance((prev) => Math.max(0, prev - movementSpeed));
      }

      // Check for NPC interactions
      checkNpcInteractions();

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [
    isMoving,
    direction,
    currentQuestion,
    movementSpeed,
    checkNpcInteractions,
    isLoadingQuestion,
  ]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentQuestion || isLoadingQuestion) return; // Disable movement during questions or loading

      switch (e.key) {
        case "ArrowLeft":
          setDirection(-1);
          setIsMoving(true);
          break;
        case "ArrowRight":
          setDirection(1);
          setIsMoving(true);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && direction === -1) {
        setIsMoving(false);
        setDirection(0);
      } else if (e.key === "ArrowRight" && direction === 1) {
        setIsMoving(false);
        setDirection(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [direction, currentQuestion, isLoadingQuestion]);

  // Handle player actions
  const handleMobileButtonPress = useCallback(
    (dir: number) => {
      if (currentQuestion || isLoadingQuestion) return; // Disable movement during questions or loading
      setDirection(dir);
      setIsMoving(true);
    },
    [currentQuestion, isLoadingQuestion]
  );

  const handleMobileButtonRelease = useCallback(() => {
    setIsMoving(false);
    setDirection(0);
  }, []);

  // Handle question answers
  const handleAnswer = useCallback(
    (selectedAnswer: string) => {
      if (!currentQuestion || !activeNpc) return;

      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

      // Mark this NPC's question as answered
      setNpcs((prev) =>
        prev.map((npc) =>
          npc.id === activeNpc.id ? { ...npc, answered: true } : npc
        )
      );

      if (isCorrect) {
        setScore((prev) => prev + 10);
        setFeedbackMessage("Correct!");
        setFeedbackType("correct");
      } else {
        setFeedbackMessage(
          `Incorrect. The answer is ${currentQuestion.correctAnswer}.`
        );
        setFeedbackType("incorrect");
      }

      // Clear feedback and question after a short delay
      setTimeout(() => {
        setFeedbackMessage(null);
        setFeedbackType(null);
        setCurrentQuestion(null);
        setActiveNpc(null);
      }, feedbackDuration);
    },
    [currentQuestion, activeNpc, feedbackDuration]
  );

  // Calculate positions for visible NPCs relative to the player's position
  const getVisibleNpcs = useCallback(() => {
    const playerPosition = distance;
    const screenWidth =
      typeof window !== "undefined" ? window.innerWidth : 1000;

    // Return NPCs that are on screen
    return npcs
      .filter((npc) => {
        const relativePosition = npc.position - playerPosition;
        return Math.abs(relativePosition) < screenWidth;
      })
      .map((npc) => ({
        ...npc,
        screenPosition: npc.position - playerPosition, // Position relative to player
      }));
  }, [distance, npcs]);

  return {
    // State
    position,
    isMoving,
    direction,
    score,
    distance,
    currentQuestion,
    feedbackMessage,
    feedbackType,
    activeNpc,
    npcInteractionDistance,
    visibleNpcs: getVisibleNpcs(),
    isLoadingQuestion,

    // Actions
    handleMobileButtonPress,
    handleMobileButtonRelease,
    handleAnswer,
  };
}
