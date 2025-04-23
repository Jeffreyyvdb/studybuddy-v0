import React from "react";
import { NpcObject } from "../../types/game";

interface NPCsProps {
  npcs: (NpcObject & { screenPosition: number })[];
  interactionDistance: number;
}

export const NPCs: React.FC<NPCsProps> = ({ npcs, interactionDistance }) => {
  return (
    <>
      {npcs.map((npc) => (
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
              Math.abs(npc.screenPosition) < interactionDistance && (
                <div className="mt-2 animate-bounce">
                  <span className="text-white bg-blue-600 px-2 py-1 rounded-full text-xs font-bold">
                    !
                  </span>
                </div>
              )}
          </div>
        </div>
      ))}
    </>
  );
};
