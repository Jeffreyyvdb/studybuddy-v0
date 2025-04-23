import { useState, useEffect, useCallback } from "react";
import { NpcObject, QuizQuestion, FeedbackType } from "../types/game";
import { Message } from "ai";
import confetti from "canvas-confetti";

// Different NPC types
const defaultNpcTypes = ["🧙", "👩‍🏫", "👨‍🔬", "🧑‍⚕️", "👮"];

interface UseGameOptions {
  npcTypes?: string[];
  npcSpawnInterval?: number;
  npcInteractionDistance?: number;
  movementSpeed?: number;
  worldWidth?: number;
  feedbackDuration?: number;
  subject?: string; // Add subject option
}

// Define expected AI response structure for game questions
interface AIGameQuestionResponse {
  question: string;
  options: string[];
  id: number | string;
  previousResponseCorrect?: boolean; // Make optional as it might not be in the first response
  explanation?: string; // Make optional
  tag: string; // Tag for AI questions
}

// Define expected AI response structure for game feedback
interface AIGameFeedbackResponse {
  question?: string; // Keep optional
  options?: string[]; // Keep optional
  id?: number | string; // Keep optional
  previousResponseCorrect: boolean; // Required for feedback
  explanation: string; // Required for feedback
}

export function useGame({
  npcTypes = defaultNpcTypes,
  npcSpawnInterval = 450,
  npcInteractionDistance = 50,
  movementSpeed = 3,
  worldWidth = 5000,
  subject = "General Knowledge", // Default subject
  feedbackDuration = 8000
}: UseGameOptions = {}) {
  // Game state
  const [position, setPosition] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [isAnswering] = useState(false);
  const [direction, setDirection] = useState(0);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [npcs, setNpcs] = useState<NpcObject[]>([]);
  const [activeNpc, setActiveNpc] = useState<NpcObject | null>(null);
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);

  const currentQuestion =
    questions.length > 0 ? questions[questions.length - 1] : null;

  // Initialize NPCs (without pre-assigned questions)
  useEffect(() => {
    const initialNpcs: NpcObject[] = [];
    for (let i = npcSpawnInterval; i < worldWidth; i += npcSpawnInterval) {
      const randomNpcType =
        npcTypes[Math.floor(Math.random() * npcTypes.length)];
      initialNpcs.push({
        id: i,
        position: i,
        character: randomNpcType,
        answered: false,
      });
    }
    setNpcs(initialNpcs);
  }, [npcSpawnInterval, worldWidth, npcTypes]);

  // Function to fetch the NEXT question for a NEW NPC, using existing history
  const fetchInitialQuestion = useCallback(
    async (npc: NpcObject) => {
      if (isFetchingQuestion || isSubmittingAnswer) return;

      setIsFetchingQuestion(true);
      setActiveNpc(npc);
      setQuestions([]); // Still reset questions for the new NPC interaction
      setFeedbackMessage(null);
      setFeedbackType(null);
      // DO NOT reset messageHistory here

      // Create the user message asking for the next question based on history
      const nextQuestionPrompt: Omit<Message, "id"> = {
        role: "user",
        // Ask for the next question based on the existing conversation
        content:
          "Based on our previous conversation, please provide the next quiz question.",
      };

      if (!messageHistory || messageHistory.length === 0) {
        // Use the subject parameter to specify the quiz topic
        nextQuestionPrompt.content = `Start a quiz about ${subject}. Give me a question.`;
      }

      // Send the existing history PLUS the new prompt
      const historyToSend = [...messageHistory, nextQuestionPrompt as Message];
      // Update history state immediately
      setMessageHistory(historyToSend);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: historyToSend, // Send the full history + new prompt
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const nextQuestionData =
          (await response.json()) as AIGameQuestionResponse; // Expecting a question

        // Validate the response contains a question
        if (
          !nextQuestionData ||
          !nextQuestionData.question ||
          !nextQuestionData.options
        ) {
          // Handle case where AI doesn't provide a next question (e.g., end of topic)
          console.warn(
            "AI did not provide a next question or format is invalid."
          );
          setFeedbackMessage("Looks like that's all the questions for now!");
          setFeedbackType("incorrect"); // Use a neutral feedback type
          setActiveNpc(null); // End interaction immediately
          // Mark NPC as answered even if no question was asked, to avoid re-triggering
          setNpcs((prev) =>
            prev.map((n) => (n.id === npc.id ? { ...n, answered: true } : n))
          );
          setTimeout(() => {
            // Clear feedback after delay
            setFeedbackMessage(null);
            setFeedbackType(null);
          }, feedbackDuration);
        } else {
          // Process the received question
          const nextQuestion: QuizQuestion = {
            ...nextQuestionData,
            correctAnswer: "", // Assuming multiple choice answers aren't needed upfront
            // Reset feedback fields for the new question
            explanation: "",
            previousResponseCorrect: undefined,
          };
          setQuestions([nextQuestion]); // Set this as the current question for the NPC

          // Add the AI's response (the new question) to the history
          const aiResponse: Omit<Message, "id"> = {
            role: "assistant",
            content: JSON.stringify(nextQuestionData),
          };
          // Update history state with the AI's response
          setMessageHistory((prev) => [...prev, aiResponse as Message]);
        }
      } catch (error) {
        console.error("Error fetching next question:", error);
        setFeedbackMessage(
          "Error getting the next question. Please try again."
        );
        setFeedbackType("error");
        setActiveNpc(null);
        setQuestions([]);
        // Optionally clear history on error? For now, keep it.
        setTimeout(() => {
          setFeedbackMessage(null);
          setFeedbackType(null);
        }, feedbackDuration);
      } finally {
        setIsFetchingQuestion(false);
      }
    },
    [
      isFetchingQuestion,
      isSubmittingAnswer,
      feedbackDuration,
      messageHistory,
      subject, // Add subject as dependency
    ]
  );

  // Check if player is near an NPC to trigger interaction
  const checkNpcInteractions = useCallback(() => {
    if (
      questions.length > 0 ||
      activeNpc ||
      isFetchingQuestion ||
      isSubmittingAnswer
    )
      return;

    const playerPosition = distance;
    const nearbyNpc = npcs.find(
      (npc) =>
        !npc.answered &&
        Math.abs(npc.position - playerPosition) < npcInteractionDistance
    );

    if (nearbyNpc) {
      setIsMoving(false);
      fetchInitialQuestion(nearbyNpc);
    }
  }, [
    distance,
    npcs,
    npcInteractionDistance,
    questions.length,
    activeNpc,
    isFetchingQuestion,
    isSubmittingAnswer,
    fetchInitialQuestion,
  ]);

  // Handle movement logic
  useEffect(() => {
    if (
      !isMoving ||
      questions.length > 0 ||
      activeNpc ||
      isFetchingQuestion ||
      isSubmittingAnswer
    )
      return;

    let animationId: number;
    const animate = () => {
      const moveAmount = direction * movementSpeed;
      setPosition((prev) => prev - moveAmount);
      if (direction === 1) {
        setDistance((prev) => prev + movementSpeed);
      } else if (direction === -1) {
        setDistance((prev) => Math.max(0, prev - movementSpeed));
      }
      checkNpcInteractions();
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [
    isMoving,
    direction,
    questions.length,
    activeNpc,
    isFetchingQuestion,
    isSubmittingAnswer,
    movementSpeed,
    checkNpcInteractions,
  ]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        questions.length > 0 ||
        activeNpc ||
        isFetchingQuestion ||
        isSubmittingAnswer
      )
        return;
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
  }, [
    direction,
    questions.length,
    activeNpc,
    isFetchingQuestion,
    isSubmittingAnswer,
  ]);

  // Handle mobile controls
  const handleMobileButtonPress = useCallback(
    (dir: number) => {
      if (
        questions.length > 0 ||
        activeNpc ||
        isFetchingQuestion ||
        isSubmittingAnswer
      )
        return;
      setDirection(dir);
      setIsMoving(true);
    },
    [questions.length, activeNpc, isFetchingQuestion, isSubmittingAnswer]
  );

  const handleMobileButtonRelease = useCallback(() => {
    setIsMoving(false);
    setDirection(0);
  }, []);

  // Modified function to submit answer, get feedback, and end interaction
  const submitAnswerToAI = useCallback(
    async (selectedAnswer: string) => {
      if (
        !currentQuestion ||
        !activeNpc ||
        isSubmittingAnswer ||
        isFetchingQuestion
      )
        return;

      setIsSubmittingAnswer(true);
      setFeedbackMessage(null);
      setFeedbackType(null);

      // 1. Create user messages for this turn
      const userAnswerMessage: Omit<Message, "id"> = {
        role: "user",
        content: `My answer to question ID ${currentQuestion.id} is: ${selectedAnswer}`,
      };
      // Modify prompt: Only ask for feedback
      const userPromptMessage: Omit<Message, "id"> = {
        role: "user",
        content: "Give me feedback on my answer.", // Changed prompt
      };

      // 2. Create the history to be sent (append to existing history)
      const historyToSend = [
        ...messageHistory,
        userAnswerMessage as Message,
        userPromptMessage as Message,
      ];

      // 3. Update the state *before* the API call
      setMessageHistory(historyToSend);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: historyToSend, // Send the updated history
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        // Expecting feedback, potentially without a next question
        const result = (await response.json()) as AIGameFeedbackResponse; // Use FeedbackResponse interface
        console.log("AI Feedback Response:", result);

        // 4. Add AI response to history
        const aiResponseMessage: Omit<Message, "id"> = {
          role: "assistant",
          content: JSON.stringify(result), // Store the raw feedback response
        };
        // Append AI feedback to the history
        setMessageHistory((prev) => [...prev, aiResponseMessage as Message]);

        // --- Process Feedback ---
        if (
          result.explanation === undefined ||
          result.previousResponseCorrect === undefined
        ) {
          console.warn(
            "API response missing required feedback fields.",
            result
          );
          setFeedbackMessage("Feedback processing error.");
          setFeedbackType("error");
        } else {
          if (result.previousResponseCorrect) {
            setScore((prev) => prev + 10);
            triggerConfetti(); // Trigger confetti for correct answer
          }
          setFeedbackMessage(result.explanation);
          setFeedbackType(
            result.previousResponseCorrect ? "correct" : "incorrect"
          );
        }

        // --- End Interaction with this NPC (Always happens after feedback for single question) ---
        setNpcs((prev) =>
          prev.map((npc) =>
            npc.id === activeNpc.id ? { ...npc, answered: true } : npc
          )
        );

        // Clear interaction state after feedback duration
        setTimeout(() => {
          setFeedbackMessage(null);
          setFeedbackType(null);
          setQuestions([]); // Clear questions
          setActiveNpc(null);
          setIsSubmittingAnswer(false);
          // messageHistory persists
        }, feedbackDuration);
      } catch (error) {
        console.error("Error submitting answer to AI:", error);
        setFeedbackMessage("Error evaluating answer. Please try again.");
        setFeedbackType("error");
        if (activeNpc) {
          setNpcs((prev) =>
            prev.map((npc) =>
              npc.id === activeNpc.id ? { ...npc, answered: true } : npc
            )
          );
        }
        setTimeout(() => {
          setFeedbackMessage(null);
          setFeedbackType(null);
          setQuestions([]);
          setActiveNpc(null);
          setIsSubmittingAnswer(false);
          // messageHistory persists
        }, feedbackDuration);
      }
    },
    [
      currentQuestion,
      activeNpc,
      isSubmittingAnswer,
      isFetchingQuestion,
      feedbackDuration,
      messageHistory, // Keep history as dependency
    ]
  );

  // Calculate visible NPCs
  const getVisibleNpcs = useCallback(() => {
    const playerPosition = distance;
    const screenWidth =
      typeof window !== "undefined" ? window.innerWidth : 1000;
    return npcs
      .filter((npc) => {
        const relativePosition = npc.position - playerPosition;
        return Math.abs(relativePosition) < screenWidth;
      })
      .map((npc) => ({
        ...npc,
        screenPosition: npc.position - playerPosition,
      }));
  }, [distance, npcs]);

  return {
    position,
    isMoving,
    isAnswering,
    direction,
    score,
    distance,
    currentQuestion,
    questions,
    feedbackMessage,
    feedbackType,
    activeNpc,
    npcInteractionDistance,
    visibleNpcs: getVisibleNpcs(),
    isFetchingQuestion,
    isSubmittingAnswer,
    handleMobileButtonPress,
    handleMobileButtonRelease,
    submitAnswerToAI,
  };
}

// Function to trigger confetti
function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}