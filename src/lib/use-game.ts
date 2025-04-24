import { useState, useEffect, useCallback } from "react";
import { NpcObject, QuizQuestion, FeedbackType } from "../types/game";
import { Message } from "ai";
import confetti from 'canvas-confetti';

// Different NPC types
const defaultNpcTypes = ["🧙", "👩‍🏫", "👨‍🔬", "🧑‍⚕️", "👮"];

interface UseGameOptions {
  npcTypes?: string[];
  npcSpawnInterval?: number;
  npcInteractionDistance?: number;
  movementSpeed?: number;
  worldWidth?: number;
  feedbackDuration?: number;
  showFloatingQuestionMarks?: boolean; // Add this line
}

// Define expected AI response structure for game questions
interface AIGameQuestionResponse {
  question: string;
  options: string[];
  id: number | string;
  previousResponseCorrect?: boolean; // Make optional as it might not be in the first response
  explanation?: string; // Make optional
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
  npcSpawnInterval = 400, // Increased from 100
  npcInteractionDistance = 30, // Decreased from 50 for more precise interactions
  movementSpeed = 3,
  worldWidth = 5000,
  feedbackDuration = 2000,
  showFloatingQuestionMarks = true, // Add this line
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
  const [showFactoid, setShowFactoid] = useState(false);
  const [factoid, setFactoid] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const questionDistance = 100; // Distance between questions

  const currentQuestion =
    questions.length > 0 ? questions[questions.length - 1] : null;

  const INTERACTION_COOLDOWN = 1000; // 1 second cooldown
  const [canInteract, setCanInteract] = useState(true);

  // Initialize NPCs (without pre-assigned questions)
  useEffect(() => {
    const spacing = 100; // Fixed spacing between NPCs
    const initialNpcs: NpcObject[] = [];
    
    // Limit the number of NPCs to a reasonable amount (e.g., 10)
    const maxNPCs = 10;
    
    for (let i = 0; i < maxNPCs; i++) {
      const randomNpcType = npcTypes[Math.floor(Math.random() * npcTypes.length)];
      initialNpcs.push({
        id: i,
        position: (i + 1) * spacing * 4, // Multiply by 4 to create larger gaps
        character: randomNpcType,
        answered: false,
      });
    }
    setNpcs(initialNpcs);
  }, [npcTypes]); // Remove unnecessary dependencies

  // Function to fetch the NEXT question for a NEW NPC, using existing history
  const fetchInitialQuestion = useCallback(
    async (npc: NpcObject) => {
      if (isFetchingQuestion || isSubmittingAnswer) return;

      setIsFetchingQuestion(true);
      setActiveNpc(npc);
      // Clear existing questions first
      setQuestions([]); 
      setFeedbackMessage(null);
      setFeedbackType(null);

      // Create the user message asking for the next question based on history
      const nextQuestionPrompt: Omit<Message, "id"> = {
        role: "user",
        content: "Based on our previous conversation, please provide the next quiz question.",
      };

      if (!messageHistory || messageHistory.length === 0) {
        nextQuestionPrompt.content = "Start a quiz about math. Give me a question.";
      }

      const historyToSend = [...messageHistory, nextQuestionPrompt as Message];
      
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
          console.warn("AI did not provide a next question or format is invalid.");
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
            text: nextQuestionData.question, // Map 'question' to 'text'
            correctAnswer: "", // Assuming multiple choice answers aren't needed upfront
            // Reset feedback fields for the new question
            explanation: "",
            previousResponseCorrect: undefined,
          };
          // Replace existing questions instead of adding
          setQuestions([nextQuestion]);

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
        setFeedbackMessage("Error getting the next question. Please try again.");
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
      messageHistory, // Add messageHistory as a dependency
    ]
  );

  // Check if player is near an NPC to trigger interaction
  const checkNpcInteractions = useCallback(() => {
    if (!canInteract || questions.length > 0 || activeNpc || isFetchingQuestion || isSubmittingAnswer || showFactoid)
      return;

    const playerPosition = distance;
    const nearbyNpc = npcs.find(
      (npc) =>
        !npc.answered &&
        Math.abs(npc.position - playerPosition) < npcInteractionDistance
    );

    if (nearbyNpc) {
      setCanInteract(false);
      setIsMoving(false);
      fetchInitialQuestion(nearbyNpc);
      
      // Reset interaction cooldown
      setTimeout(() => {
        setCanInteract(true);
      }, INTERACTION_COOLDOWN);
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
    showFactoid,
    canInteract
  ]);

  // Handle movement logic
  useEffect(() => {
    if (
      !isMoving ||
      questions.length > 0 ||
      activeNpc ||
      isFetchingQuestion ||
      isSubmittingAnswer ||
      showFactoid  // Add this condition to prevent movement during factoid
    )
      return;

    let animationId: number;
    const animate = () => {
      const moveAmount = direction * movementSpeed;
      setPosition((prev) => prev - moveAmount);
      if (direction === 1) {
        setDistance((prev) => {
          const newDistance = prev + movementSpeed;
          
          // Check if we've reached the factoid trigger point
          const triggerPoint = localStorage.getItem('factoidTriggerPoint');
          if (triggerPoint && !showFactoid) {
            const triggerDistance = parseFloat(triggerPoint);
            if (newDistance >= triggerDistance) {
              setShowFactoid(true);
              localStorage.removeItem('factoidTriggerPoint'); // Clear the trigger point
            }
          }
          
          return newDistance;
        });
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
    showFactoid,  // Add to dependencies
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
        isSubmittingAnswer ||
        showFactoid  // Add this condition
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
    showFactoid  // Add to dependencies
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
      // Add additional check for existing questions
      if (!currentQuestion || !activeNpc || isSubmittingAnswer || isFetchingQuestion || questions.length !== 1) return;

      setIsSubmittingAnswer(true);
      setFeedbackMessage(null);
      setFeedbackType(null);

      // 1. Create user messages for this turn
      const userAnswerMessage: Omit<Message, 'id'> = {
        role: "user",
        content: `My answer to question ID ${currentQuestion.id} is: ${selectedAnswer}`
      };
      // Modify prompt: Only ask for feedback
      const userPromptMessage: Omit<Message, 'id'> = {
        role: "user",
        content: "Give me feedback on my answer." // Changed prompt
      };

      // 2. Create the history to be sent (append to existing history)
      const historyToSend = [...messageHistory, userAnswerMessage as Message, userPromptMessage as Message];

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
        const result = await response.json() as AIGameFeedbackResponse; // Use FeedbackResponse interface
        console.log("AI Feedback Response:", result);

        // 4. Add AI response to history
        const aiResponseMessage: Omit<Message, 'id'> = {
          role: "assistant",
          content: JSON.stringify(result) // Store the raw feedback response
        };
        // Append AI feedback to the history
        setMessageHistory(prev => [...prev, aiResponseMessage as Message]);

        // --- Process Feedback ---
        if (result.explanation === undefined || result.previousResponseCorrect === undefined) {
          console.warn("API response missing required feedback fields.", result);
          setFeedbackMessage("Feedback processing error.");
          setFeedbackType("error");
        } else {
          if (result.previousResponseCorrect) {
            setScore((prev) => prev + 10);
            triggerConfetti(); // Trigger confetti for correct answer
          }
          setFeedbackMessage(result.explanation);
          setFeedbackType(result.previousResponseCorrect ? "correct" : "incorrect");
        }

        // --- End Interaction with this NPC (Always happens after feedback for single question) ---
        setNpcs((prev) =>
          prev.map((npc) =>
            npc.id === activeNpc.id ? { ...npc, answered: true } : npc
          )
        );

        // After successful answer processing:
        setLastQuestion(currentQuestion.question || '');
        setFactoid("Did you know? This is an interesting fact about the topic!");
        
        // Store the position where the factoid should appear
        const nextNpc = npcs.find(npc => !npc.answered && npc.position > distance);
        if (nextNpc) {
          // Calculate halfway point between current position and next NPC, then add 200
          const halfwayPoint = distance + ((nextNpc.position - distance) / 2) + 200;
          
          // Store this point to check against during movement
          localStorage.setItem('factoidTriggerPoint', halfwayPoint.toString());
        }

        // Clear interaction state after feedback duration
        setTimeout(() => {
          setFeedbackMessage(null);
          setFeedbackType(null);
          setQuestions([]);
          setActiveNpc(null);
          setIsSubmittingAnswer(false);
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
      distance, // Add distance
      npcs,     // Add npcs
      movementSpeed // Add movementSpeed
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

  const handleFactoidContinue = useCallback(() => {
    setShowFactoid(false);
    setFactoid('');
    
    // Find the next NPC
    const nextNpc = npcs.find(npc => !npc.answered && npc.position > distance);
    
    // If there is a next NPC, let the player continue moving
    if (nextNpc) {
      // The next question will be triggered automatically by proximity
      // through the checkNpcInteractions function
      setCanInteract(true);
    } else {
      // If no more NPCs, show completion message
      setFeedbackMessage("Congratulations! You've completed all the questions!");
      setFeedbackType("correct");
      setTimeout(() => {
        setFeedbackMessage(null);
        setFeedbackType(null);
      }, feedbackDuration);
    }
  }, [npcs, distance, feedbackDuration]);

  // Remove the duplicate setFactoid functions and replace with a proper implementation
  const setGameFactoid = (newFactoid: string) => {
    setShowFactoid(true);
    setFactoid(newFactoid);
  };

  // Fix generateNPCs function
  const generateNPCs = () => {
    const initialNpcs: NpcObject[] = [];
    const spacing = 100; // Make sure this is 100
    const startX = spacing; // Use spacing instead of npcSpawnInterval
    
    for (let i = 0; i < worldWidth / spacing; i++) {
      const randomNpcType = npcTypes[Math.floor(Math.random() * npcTypes.length)];
      initialNpcs.push({
        id: i,
        position: startX + (i * spacing),
        character: randomNpcType,
        answered: false,
      });
    }
    
    setNpcs(initialNpcs);
  };

  // Fix generateNextQuestion function
  const generateNextQuestion = useCallback(() => {
    // Clear the current factoid and question state
    setFactoid('');
    setLastQuestion('');
    setQuestions([]);
  
    // Find the next unanswered NPC
    const nextNpc = npcs.find((npc) => !npc.answered);
  
    if (nextNpc) {
      // Fetch the initial question for the next NPC
      fetchInitialQuestion(nextNpc);
    } else {
      setFeedbackMessage("Congratulations! You've completed all the questions.");
      setFeedbackType("correct");
      setTimeout(() => {
        setFeedbackMessage(null);
        setFeedbackType(null);
      }, feedbackDuration);
    }
  }, [npcs, fetchInitialQuestion, feedbackDuration]);

  useEffect(() => {
    return () => {
        localStorage.removeItem('factoidTriggerPoint');
    };
}, []);

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
    showFactoid,
    factoid,
    lastQuestion,
    handleFactoidContinue,
    generateNextQuestion,
    setGameFactoid,
    showFloatingQuestionMarks,
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

