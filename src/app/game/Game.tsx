"use client";

import { useState, useEffect, useCallback } from "react";

// Sample questions for the game
const questions = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Paris", "Berlin", "Madrid"],
    correctAnswer: "Paris",
  },
  {
    id: 2,
    question: "Which planet is closest to the Sun?",
    options: ["Venus", "Earth", "Mercury", "Mars"],
    correctAnswer: "Mercury",
  },
  {
    id: 3,
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "22"],
    correctAnswer: "4",
  },
  {
    id: 4,
    question: "Who wrote Romeo and Juliet?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen"],
    correctAnswer: "William Shakespeare",
  },
  {
    id: 5,
    question: "What is the largest mammal?",
    options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
    correctAnswer: "Blue Whale",
  },
];

// Different NPC types
const npcTypes = ["🧙", "👩‍🏫", "👨‍🔬", "🧑‍⚕️", "👮"];

interface NpcObject {
  id: number;
  position: number; // x-position in the world
  character: string; // emoji character
  questionId: number; // ID of the question this NPC will ask
  answered: boolean; // whether the player has already answered this NPC's question
}

const Game = () => {
  // Game state
  const [position, setPosition] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [direction, setDirection] = useState(0); // -1: left, 0: stopped, 1: right
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<
    (typeof questions)[0] | null
  >(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<
    "correct" | "incorrect" | null
  >(null);
  const [npcs, setNpcs] = useState<NpcObject[]>([]);
  const [activeNpc, setActiveNpc] = useState<NpcObject | null>(null);

  const npcSpawnInterval = 150; // Distance between NPCs in pixels
  const npcInteractionDistance = 50; // How close player needs to be to interact with NPC
  const movementSpeed = 3; // Pixels per frame
  const worldWidth = 5000; // Total width of the game world

  // Check if player is near an NPC to trigger question
  const checkNpcInteractions = useCallback(() => {
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
      //   setIsMoving(false);
      //   setActiveNpc(nearbyNpc);
      //   setCurrentQuestion(questions[nearbyNpc.questionId]);
    }
  }, [distance, npcs, npcInteractionDistance]);

  // Initialize NPCs
  useEffect(() => {
    const initialNpcs: NpcObject[] = [];
    // Place NPCs throughout the world at intervals
    for (let i = npcSpawnInterval; i < worldWidth; i += npcSpawnInterval) {
      const randomNpcType =
        npcTypes[Math.floor(Math.random() * npcTypes.length)];
      const randomQuestionId = Math.floor(Math.random() * questions.length);

      initialNpcs.push({
        id: i,
        position: i,
        character: randomNpcType,
        questionId: randomQuestionId,
        answered: false,
      });
    }
    setNpcs(initialNpcs);
  }, []);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentQuestion) return; // Disable movement during questions

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
  }, [direction, currentQuestion]);

  // Handle mobile button controls
  const handleMobileButtonPress = (dir: number) => {
    if (currentQuestion) return; // Disable movement during questions
    setDirection(dir);
    setIsMoving(true);
  };

  const handleMobileButtonRelease = () => {
    setIsMoving(false);
    setDirection(0);
  };

  // Animation frame for smooth movement
  useEffect(() => {
    if (!isMoving || currentQuestion) return;

    let lastTime = performance.now();
    let animationId: number;

    const animate = (time: number) => {
      lastTime = time;

      // Move background based on direction and speed
      const moveAmount = direction * movementSpeed;
      setPosition((prev) => {
        const newPos = prev - moveAmount; // Subtract to move background in opposite direction
        return newPos;
      });

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
  }, [isMoving, direction, currentQuestion, npcs, checkNpcInteractions]);

  // Handle question answer
  const handleAnswer = (selectedAnswer: string) => {
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
    }, 2000);
  };

  // Calculate positions for visible NPCs relative to the player's position
  const getVisibleNpcs = () => {
    const playerPosition = distance;
    const screenWidth =
      typeof window !== "undefined" ? window.innerWidth : 1000;

    // Return NPCs that are on screen (position relative to player is within +/- half screenWidth)
    return npcs
      .filter((npc) => {
        const relativePosition = npc.position - playerPosition;
        return Math.abs(relativePosition) < screenWidth;
      })
      .map((npc) => ({
        ...npc,
        screenPosition: npc.position - playerPosition, // Position relative to player
      }));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-800">
      {/* Scrolling background using pseudo-element technique - fixed for smooth scrolling */}
      <div
        className="absolute inset-0 w-full h-full"
        style={
          {
            position: "relative",
            backgroundImage: "url(/images/background.jpg)",
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
            height: "100%",
            width: "100%",
            overflow: "hidden",
            // Don't use modulo which causes flashing - just continuously scroll the background
            "--bg-position": `${position}px`,
          } as React.CSSProperties
        }
      >
        <style jsx>{`
          div::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: inherit;
            background-repeat: inherit;
            background-size: inherit;
            background-position-x: var(--bg-position);
          }
        `}</style>
      </div>

      {/* Fixed game UI elements */}
      <div className="absolute inset-x-0 top-0 p-4 flex justify-between items-center bg-black/50 text-white z-10">
        <div className="text-lg font-bold">Score: {score}</div>
        <div className="text-lg">Distance: {Math.floor(distance)}m</div>
      </div>

      {/* Player character (fixed position in center) */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-3xl">🚶</span>
        </div>
      </div>

      {/* NPCs in the world */}
      {getVisibleNpcs().map((npc) => (
        <div
          key={npc.id}
          className="absolute bottom-20"
          style={{
            left: `calc(50% + ${npc.screenPosition}px)`,
            transform: "translateX(-50%)",
            opacity: npc.answered ? 0.5 : 1,
            zIndex: 15,
          }}
        >
          <div className="flex flex-col items-center">
            <div
              className={`w-14 h-14 ${
                npc.answered ? "bg-gray-400" : "bg-yellow-400"
              } rounded-full flex items-center justify-center`}
            >
              <span className="text-2xl">{npc.character}</span>
            </div>
            {!npc.answered &&
              Math.abs(npc.screenPosition) < npcInteractionDistance && (
                <div className="mt-2 animate-bounce">
                  <span className="text-white bg-blue-600 px-2 py-1 rounded-full text-xs font-bold">
                    !
                  </span>
                </div>
              )}
          </div>
        </div>
      ))}

      {/* Mobile controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4 z-30 md:hidden">
        <button
          className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg active:bg-blue-700"
          onTouchStart={() => handleMobileButtonPress(-1)}
          onTouchEnd={handleMobileButtonRelease}
          onMouseDown={() => handleMobileButtonPress(-1)}
          onMouseUp={handleMobileButtonRelease}
          onMouseLeave={handleMobileButtonRelease}
        >
          ←
        </button>
        <button
          className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg active:bg-blue-700"
          onTouchStart={() => handleMobileButtonPress(1)}
          onTouchEnd={handleMobileButtonRelease}
          onMouseDown={() => handleMobileButtonPress(1)}
          onMouseUp={handleMobileButtonRelease}
          onMouseLeave={handleMobileButtonRelease}
        >
          →
        </button>
      </div>

      {/* Question popup */}
      {currentQuestion && activeNpc && (
        <div className="fixed inset-0 flex items-center justify-center z-40 bg-black/70">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl">{activeNpc.character}</span>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {currentQuestion.question}
            </h2>
            <div className="space-y-2">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  className="w-full py-3 px-4 bg-blue-100 hover:bg-blue-200 rounded-lg text-left font-medium transition-colors"
                  onClick={() => handleAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feedback message */}
      {feedbackMessage && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 pointer-events-none`}
        >
          <div
            className={`py-4 px-8 rounded-lg text-xl font-bold ${
              feedbackType === "correct"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {feedbackMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
