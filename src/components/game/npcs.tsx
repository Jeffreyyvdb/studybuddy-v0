import React from "react";
import { NpcObject } from "../../types/game";

interface NPCsProps {
  npcs: (NpcObject & { screenPosition: number })[];
  interactionDistance: number;
}

export const NPCs: React.FC<NPCsProps> = ({ npcs, interactionDistance }) => {
  return (
    <>
      {npcs.map((npc) => {
        // Define the visual style based on NPC type and state
        const npcBgColor = npc.answered
          ? "bg-gray-400" // Already answered
          : npc.isAiQuestion
          ? "bg-purple-500" // AI questions get purple background
          : "bg-yellow-400"; // Regular questions get yellow background

        const npcBorderStyle = npc.isAiQuestion ? "border-4 border-white" : "";

        return (
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
                className={`w-14 h-14 ${npcBgColor} ${npcBorderStyle} rounded-full flex items-center justify-center shadow-lg`}
              >
                <span className="text-2xl">{npc.character}</span>
              </div>
              {!npc.answered &&
                Math.abs(npc.screenPosition) < interactionDistance && (
                  <div className="mt-2 animate-bounce flex flex-col items-center">
                    <span
                      className={`text-white ${
                        npc.isAiQuestion ? "bg-purple-600" : "bg-blue-600"
                      } px-2 py-1 rounded-full text-xs font-bold mb-1`}
                    >
                      {npc.isAiQuestion ? "AI" : "!"}
                    </span>
                    {npc.isAiQuestion && npc.aiTopic && (
                      <span className="bg-black/70 text-white px-2 py-0.5 rounded text-[10px] whitespace-nowrap">
                        Topic: {npc.aiTopic}
                      </span>
                    )}
                  </div>
                )}
            </div>
          </div>
        );
      })}
    </>
  );
};
