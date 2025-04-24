import { useState, useEffect, useCallback, useRef } from "react";
import { NpcObject, QuizQuestion, FeedbackType } from "../types/game";
import { Message } from "ai";
import confetti from "canvas-confetti";

// Different NPC types
const defaultNpcTypes = ["🧙", "👩‍🏫", "👨‍🔬", "🧑‍⚕️", "👮"];
const TOTAL_NPCS = 5; // Define the total number of NPCs

interface UseGameOptions {
  npcTypes?: string[];
  npcSpawnInterval?: number;
  npcInteractionDistance?: number;
  movementSpeed?: number;
  feedbackDuration?: number;
  subject?: string; // Add subject option
  showFloatingQuestionMarks?: boolean; // Add this line
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
  npcSpawnInterval = 450, // Adjust spacing based on fixed number
  npcInteractionDistance = 50,
  movementSpeed = 3,
  subject = "General Knowledge", // Default subject
  feedbackDuration = 8000
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
  const [isGameFinished, setIsGameFinished] = useState(false); // New state for game completion
  const [answeredCount, setAnsweredCount] = useState(0); // Track answered NPCs
  const [feedbackTimeRemaining, setFeedbackTimeRemaining] = useState(0); // New state for feedback timer
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null); // Reference to track the timer
  const [showFactoid, setShowFactoid] = useState(false);
  const [factoid, setFactoid] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const questionDistance = 100; // Distance between questions

  const currentQuestion =
    questions.length > 0 ? questions[questions.length - 1] : null;

  // Initialize exactly 5 NPCs
  const INTERACTION_COOLDOWN = 1000; // 1 second cooldown
  const [canInteract, setCanInteract] = useState(true);

  // Initialize NPCs (without pre-assigned questions)
  useEffect(() => {
    const spacing = 100; // Fixed spacing between NPCs
    const initialNpcs: NpcObject[] = [];
    for (let i = 0; i < TOTAL_NPCS; i++) {
      const npcPosition = (i + 1) * npcSpawnInterval; // Space them out
      const randomNpcType =
        npcTypes[Math.floor(Math.random() * npcTypes.length)];
      initialNpcs.push({
        id: npcPosition, // Use position as ID for simplicity
        position: npcPosition,
    
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
    setAnsweredCount(0); // Reset count on re-init
    setIsGameFinished(false); // Reset finished state
  }, [npcSpawnInterval, npcTypes]); // Removed worldWidth dependency here
  }, [npcTypes]); // Remove unnecessary dependencies

  // Function to fetch the NEXT question for a NEW NPC, using existing history
  const fetchInitialQuestion = useCallback(
    async (npc: NpcObject) => {
      if (isFetchingQuestion || isSubmittingAnswer || isGameFinished) return; // Prevent fetching if game is over

      setActiveNpc(npc);
      // Clear existing questions first
      setQuestions([]); 
      setFeedbackMessage(null);
      setFeedbackType(null);

      // Create the user message asking for the next question based on history
      const nextQuestionPrompt: Omit<Message, "id"> = {
        role: "user",
        // Ask for the next question based on the existing conversation
        content:
          "Based on our previous conversation, please provide the next quiz question.",
=======
        content: "Based on our previous conversation, please provide the next quiz question.",
      };

      if (!messageHistory || messageHistory.length === 0) {
        // Use the subject parameter to specify the quiz topic
        nextQuestionPrompt.content = `Start a quiz about ${subject}. Give me a question.`;
      } else {
        // Check if the last message was an assistant's response (a question or feedback)
        const lastMessage = messageHistory[messageHistory.length - 1];
        if (lastMessage.role === "assistant") {
          try {
            const lastContent = JSON.parse(lastMessage.content);
            // If the last message was a question, reuse it
            if (lastContent.question && (lastContent.options || Array.isArray(lastContent.options))) {
              console.log("Reusing last question:", lastContent);
              setQuestions([
                { ...lastContent as AIGameQuestionResponse, correctAnswer: "" },
              ]);
              return; // Don't fetch a new question
            }
            // If it was feedback, we still need a new question prompt
          } catch (e) {
            console.error("Failed to parse last assistant message:", e);
            // Proceed to ask for a new question if parsing fails
          }
        }
        // If last message was user or unparsable assistant msg, ask for next question
      }

      // Set loading state for fetching question
      setIsFetchingQuestion(true);

      // Send the existing history PLUS the new prompt
      const historyToSend = [...messageHistory, nextQuestionPrompt as Message];
      // Update history state immediately
      setMessageHistory(historyToSend);

      const currentNpcId = npc.id; // Store current NPC ID for error handling

      const historyToSend = [...messageHistory, nextQuestionPrompt as Message];
      
      try {
        console.log("Fetching question for NPC:", npc);
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

        const responseText = await response.text();
        console.log("Raw API response:", responseText);
        
        let nextQuestionData;
        try {
          nextQuestionData = JSON.parse(responseText) as AIGameQuestionResponse; 
          console.log("Parsed question data:", nextQuestionData);
        } catch (parseError) {
          console.error("Failed to parse API response as JSON:", parseError);
          throw new Error("Invalid response format");
        }

        // Validate the response contains a question
        if (
          !nextQuestionData ||
          !nextQuestionData.question ||
          (!nextQuestionData.options && !Array.isArray(nextQuestionData.options))
        ) {
          // Handle case where AI doesn't provide a next question (e.g., end of topic)
          console.warn(
            "AI did not provide a valid question structure:",
            nextQuestionData
          );
          setFeedbackMessage("Looks like that's all the questions for now!");
          setFeedbackType("incorrect"); // Use a neutral feedback type
          setActiveNpc(null); // End interaction immediately
          // Mark NPC as answered even if no question was asked, to avoid re-triggering
          setNpcs((prevNpcs) => {
            const alreadyAnswered = prevNpcs.find(
              (n) => n.id === currentNpcId
            )?.answered;
            if (!alreadyAnswered) {
              setAnsweredCount((prevCount) => prevCount + 1); // Increment count only if newly answered
            }
            return prevNpcs.map((n) =>
              n.id === currentNpcId ? { ...n, answered: true } : n
            );
          });
          setTimeout(() => {
            // Clear feedback after delay
            setFeedbackMessage(null);
            setFeedbackType(null);
            // Check if game finished after this interaction
            if (answeredCount >= TOTAL_NPCS) {
              setIsGameFinished(true);
            }
          }, feedbackDuration);
        } else {
          // Ensure options is always an array, even if empty
          if (!nextQuestionData.options) {
            nextQuestionData.options = [];
          }
          
          // Process the received question
          const nextQuestion: QuizQuestion = {
            ...nextQuestionData,
            correctAnswer: "", 
            text: nextQuestionData.question, // Map 'question' to 'text'
            correctAnswer: "", // Assuming multiple choice answers aren't needed upfront
            // Reset feedback fields for the new question
            explanation: "",
            previousResponseCorrect: undefined,
          };
          
          console.log("Setting current question:", nextQuestion);
          setQuestions([nextQuestion]); // Set this as the current question for the NPC
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
        setFeedbackMessage(
          "Error getting the next question. Please try again."
        );
        setFeedbackType("error");
        setActiveNpc(null);
        setQuestions([]);
        // Optionally clear history on error? For now, keep it.
        // Mark NPC as answered even on error to prevent getting stuck
        setNpcs((prevNpcs) => {
          const alreadyAnswered = prevNpcs.find(
            (n) => n.id === currentNpcId
          )?.answered;
          if (!alreadyAnswered) {
            setAnsweredCount((prevCount) => prevCount + 1); // Increment count only if newly answered
          }
          return prevNpcs.map((n) =>
            n.id === currentNpcId ? { ...n, answered: true } : n
          );
        });
        setTimeout(() => {
          setFeedbackMessage(null);
          setFeedbackType(null);
          // Check if game finished after this error interaction
          if (answeredCount >= TOTAL_NPCS) {
            setIsGameFinished(true);
          }
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
      subject,
      isGameFinished, // Add dependency
      // answeredCount managed internally
    ]
  );

  // Check if player is near an NPC to trigger interaction
  const checkNpcInteractions = useCallback(() => {
    if (
      questions.length > 0 ||
      activeNpc ||
      isFetchingQuestion ||
      isSubmittingAnswer ||
      isGameFinished // Don't check if game is finished
    )
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
    isGameFinished, // Add dependency
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
      isGameFinished // Stop movement if game is finished
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
    isGameFinished, // Add dependency
  ]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        questions.length > 0 ||
        activeNpc ||
        isFetchingQuestion ||
        isSubmittingAnswer ||
        isGameFinished // Ignore input if game is finished
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
      if (isGameFinished) {
        // Ensure movement stops if game finishes while key is held
        setIsMoving(false);
        setDirection(0);
        return;
      }
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
    isGameFinished, // Add dependency
    showFactoid  // Add to dependencies
  ]);

  // Handle mobile controls
  const handleMobileButtonPress = useCallback(
    (dir: number) => {
      if (
        questions.length > 0 ||
        activeNpc ||
        isFetchingQuestion ||
        isSubmittingAnswer ||
        isGameFinished // Ignore input if game is finished
      )
        return;
      setDirection(dir);
      setIsMoving(true);
    },
    [
      questions.length,
      activeNpc,
      isFetchingQuestion,
      isSubmittingAnswer,
      isGameFinished, // Add dependency
    ]
  );

  const handleMobileButtonRelease = useCallback(() => {
    // No need to check isGameFinished here, releasing always stops movement intent
    setIsMoving(false);
    setDirection(0);
  }, []);

  // Helper function to show feedback message with timer
  const showFeedbackWithTimer = useCallback((message: string, type: FeedbackType) => {
    // Clear any existing timer
    if (feedbackTimerRef.current) {
      clearInterval(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    
    setFeedbackMessage(message);
    setFeedbackType(type);
    setFeedbackTimeRemaining(feedbackDuration);
    
    // Start a timer that updates every 100ms
    const startTime = Date.now();
    feedbackTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, feedbackDuration - elapsed);
      setFeedbackTimeRemaining(remaining);
      
      if (remaining <= 0) {
        clearInterval(feedbackTimerRef.current!);
        feedbackTimerRef.current = null;
        setFeedbackMessage(null);
        setFeedbackType(null);
        setFeedbackTimeRemaining(0);
      }
    }, 100);
    
    return () => {
      if (feedbackTimerRef.current) {
        clearInterval(feedbackTimerRef.current);
      }
    };
  }, [feedbackDuration]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearInterval(feedbackTimerRef.current);
      }
    };
  }, []);

  // Modified function to submit answer, get feedback, and check for game end
  const submitAnswerToAI = useCallback(
    async (selectedAnswer: string) => {
      console.log("Submitting answer:", selectedAnswer);
      if (
        !currentQuestion ||
        !activeNpc ||
        isSubmittingAnswer ||
        isFetchingQuestion ||
        isGameFinished // Prevent submission if game is over
      ) {
        console.warn(
          "Cannot submit answer: No current question, active NPC, processing, or game finished.",
          {
            currentQuestion,
            activeNpc,
            isSubmittingAnswer,
            isFetchingQuestion,
            isGameFinished,
          }
        );
        return;
      }
      // Add additional check for existing questions
      if (!currentQuestion || !activeNpc || isSubmittingAnswer || isFetchingQuestion || questions.length !== 1) return;

      setIsSubmittingAnswer(true);
      setFeedbackMessage(null);
      setFeedbackType(null);

      // 1. Create user messages for this turn
      const userAnswerMessage: Omit<Message, "id"> = {
        role: "user",
        content: `${selectedAnswer}`,
      };

      // 2. Create the history to be sent (append to existing history)
      const historyToSend = [...messageHistory, userAnswerMessage as Message];

      // 3. Update the state *before* the API call
      setMessageHistory(historyToSend);

      const currentNpcId = activeNpc.id; // Store current NPC ID

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
          console.warn("API response missing required feedback fields.", result);
          showFeedbackWithTimer("Feedback processing error.", "error");
        } else {
          if (result.previousResponseCorrect) {
            setScore((prev) => prev + 1);
            triggerConfetti(); // Trigger confetti for correct answer
          }
          showFeedbackWithTimer(result.explanation, result.previousResponseCorrect ? "correct" : "incorrect");
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
        showFeedbackWithTimer("Error evaluating answer. Please try again.", "error");
      } finally {
        // --- End Interaction with this NPC (Always happens after feedback/error) ---
        // Ensure NPC is marked answered only once per interaction attempt
        setNpcs((prevNpcs) => {
          const alreadyAnswered = prevNpcs.find(
            (n) => n.id === currentNpcId
          )?.answered;
          if (!alreadyAnswered) {
            // Use functional update for answeredCount to ensure atomicity
            setAnsweredCount((prevCount) => prevCount + 1);
          }
          return prevNpcs.map((npc) =>
            npc.id === currentNpcId ? { ...npc, answered: true } : npc
          );
        });

        // Clear interaction state after feedback duration
        setTimeout(() => {
          setQuestions([]); // Clear questions
          setActiveNpc(null);
          setIsSubmittingAnswer(false);
          // messageHistory persists

          // Check if the game is finished *after* clearing state and incrementing count
          console.log(`Checking game end: Answered ${answeredCount}/${TOTAL_NPCS}`);
          if (answeredCount - 1  >= TOTAL_NPCS) {
            console.log("Game finished!");
            setIsGameFinished(true);
          }
        }, feedbackDuration);
      }
    },
    [
      currentQuestion,
      activeNpc,
      feedbackDuration,
      isSubmittingAnswer,
      isFetchingQuestion,
      messageHistory,
      isGameFinished,
      showFeedbackWithTimer, // Add the new callback
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
    questions, // Keep questions state for potential display during interaction
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
    isGameFinished, // Expose the game finished state
    totalNpcs: TOTAL_NPCS, // Expose total NPCs
    answeredCount, // Expose answered count
    feedbackTimeRemaining, // Expose the timer state for the UI
    feedbackDuration, // Expose total duration for calculations
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
    origin: { y: 1 },
  });
}
}