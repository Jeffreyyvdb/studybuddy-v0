import { useState, useEffect, useCallback } from "react";
import { NpcObject, QuizQuestion, FeedbackType } from "../types/game";
import { fetchSingleAIQuestion } from "./game-ai-service";

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
  npcTypes?: string[];
  npcSpawnInterval?: number;
  npcInteractionDistance?: number;
  movementSpeed?: number;
  worldWidth?: number;
  feedbackDuration?: number;
}

export function useGame({
  npcTypes = defaultNpcTypes,
  npcSpawnInterval = 150,
  npcInteractionDistance = 50,
  movementSpeed = 3,
  worldWidth = 5000,
  feedbackDuration = 2000,
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
  const [previousAnswerFeedback, setPreviousAnswerFeedback] = useState<
    string | null
  >(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<number>(0);
  const [questionHistoryForNPC, setQuestionHistoryForNPC] = useState<
    Record<
      number,
      {
        question: string;
        userAnswer: string;
        correctAnswer: string;
      }
    >
  >({});

  // Initialize NPCs
  useEffect(() => {
    const initialNpcs: NpcObject[] = [];
    // Place NPCs throughout the world at intervals
    for (let i = npcSpawnInterval; i < worldWidth; i += npcSpawnInterval) {
      const randomNpcType =
        npcTypes[Math.floor(Math.random() * npcTypes.length)];

      // Assign a random topic to each NPC
      const aiTopic =
        aiQuizTopics[Math.floor(Math.random() * aiQuizTopics.length)];

      initialNpcs.push({
        id: i,
        position: i,
        character: randomNpcType,
        questionId: -1, // No longer need specific question IDs
        answered: false,
        isAiQuestion: true, // All NPCs now ask AI questions
        aiTopic: aiTopic,
        questionsAsked: 0, // Track how many questions this NPC has asked
      });
    }
    setNpcs(initialNpcs);
  }, [npcSpawnInterval, worldWidth, npcTypes]);

  // Fetch AI question for a specific NPC
  const fetchNpcQuestion = useCallback(
    async (npc: NpcObject) => {
      if (!npc.aiTopic) {
        return null;
      }

      setIsLoadingQuestion(true);
      try {
        // Check if we have history for this NPC to provide feedback
        const previousAnswer = questionHistoryForNPC[npc.id];
        const question = await fetchSingleAIQuestion(
          npc.aiTopic,
          npc.id,
          previousAnswer
        );

        // If there was a previous answer, extract the feedback
        if (previousAnswer && question?.aiData?.feedback) {
          setPreviousAnswerFeedback(question.aiData.feedback);
        } else {
          setPreviousAnswerFeedback(null);
        }

        setIsLoadingQuestion(false);
        return question;
      } catch (error) {
        console.error("Error fetching question for NPC:", error);
        setIsLoadingQuestion(false);
        return null;
      }
    },
    [questionHistoryForNPC]
  );

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

      // Fetch an AI question for this NPC
      const aiQuestion = await fetchNpcQuestion(nearbyNpc);
      if (aiQuestion) {
        setCurrentQuestion(aiQuestion);
      } else {
        // If fetching fails, create a simple fallback question
        setCurrentQuestion({
          id: nearbyNpc.id,
          question: "What do you think about AI?",
          options: [
            "It's amazing",
            "It's concerning",
            "It's the future",
            "Still developing",
          ],
          correctAnswer: "It's amazing",
        });
      }
    }
  }, [distance, npcs, npcInteractionDistance, fetchNpcQuestion]);

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

  // Handle getting the next question after answering the current one
  const handleGetNextQuestion = useCallback(async () => {
    if (!activeNpc || !currentQuestion) return;

    // Increment the number of questions this NPC has asked
    setNpcs((prev) =>
      prev.map((npc) =>
        npc.id === activeNpc.id
          ? { ...npc, questionsAsked: (npc.questionsAsked || 0) + 1 }
          : npc
      )
    );

    // If NPC has asked enough questions (3 seems like a good number), mark them as answered
    const currentNpc = npcs.find((npc) => npc.id === activeNpc.id);
    if (currentNpc && (currentNpc.questionsAsked || 0) >= 2) {
      // Mark as answered after 3 questions (0, 1, 2)
      setNpcs((prev) =>
        prev.map((npc) =>
          npc.id === activeNpc.id ? { ...npc, answered: true } : npc
        )
      );

      // Clear the question and allow movement again
      setCurrentQuestion(null);
      setActiveNpc(null);
      setPreviousAnswerFeedback(null);
      return;
    }

    // Fetch the next question for this NPC
    const aiQuestion = await fetchNpcQuestion(activeNpc);
    if (aiQuestion) {
      setCurrentQuestion(aiQuestion);
    } else {
      // If fetching fails, mark the NPC as answered to avoid getting stuck
      setNpcs((prev) =>
        prev.map((npc) =>
          npc.id === activeNpc.id ? { ...npc, answered: true } : npc
        )
      );
      setCurrentQuestion(null);
      setActiveNpc(null);
      setPreviousAnswerFeedback(null);
    }
  }, [activeNpc, currentQuestion, npcs, fetchNpcQuestion]);

  // Handle question answers
  const handleAnswer = useCallback(
    (selectedAnswer: string) => {
      if (!currentQuestion || !activeNpc) return;

      // For open questions or multiple choice, we handle scoring the same way for now
      const isCorrect =
        selectedAnswer.toLowerCase() ===
        currentQuestion.correctAnswer.toLowerCase();

      // Add points to the score
      if (isCorrect) {
        setScore((prev) => prev + 10);
        setFeedbackMessage("Correct!");
        setFeedbackType("correct");
      } else {
        setFeedbackMessage(
          `Incorrect. The correct answer is ${currentQuestion.correctAnswer}.`
        );
        setFeedbackType("incorrect");
      }

      // Increment the number of questions answered
      setAnsweredQuestions((prev) => prev + 1);

      // Store the question and user's answer to provide feedback in the next question
      setQuestionHistoryForNPC((prev) => ({
        ...prev,
        [activeNpc.id]: {
          question: currentQuestion.question,
          userAnswer: selectedAnswer,
          correctAnswer: currentQuestion.correctAnswer,
        },
      }));

      // Clear feedback after a short delay
      setTimeout(() => {
        setFeedbackMessage(null);
        setFeedbackType(null);
      }, feedbackDuration);
    },
    [currentQuestion, activeNpc, feedbackDuration]
  );

  // Handle closing the question popup and resuming gameplay
  const handleCloseQuestion = useCallback(() => {
    // Mark the current NPC as completely answered
    if (activeNpc) {
      setNpcs((prev) =>
        prev.map((npc) =>
          npc.id === activeNpc.id ? { ...npc, answered: true } : npc
        )
      );
    }

    // Clear question-related state
    setCurrentQuestion(null);
    setActiveNpc(null);
    setPreviousAnswerFeedback(null);
  }, [activeNpc]);

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
    previousAnswerFeedback,
    answeredQuestions,

    // Actions
    handleMobileButtonPress,
    handleMobileButtonRelease,
    handleAnswer,
    handleGetNextQuestion,
    handleCloseQuestion, // Add the new function to the returned object
  };
}
