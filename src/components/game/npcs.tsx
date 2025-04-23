import React from "react";
import Image from "next/image";
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
          className="absolute bottom-18"
          style={{
            left: `calc(50% + ${npc.screenPosition}px)`,
            transform: "translateX(-50%)",
            opacity: npc.answered ? 0.5 : 1,
            zIndex: 15,
          }}
        >
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 flex items-center jus\tify-center">
              <Image
                src="/images/robotV0.1-02.png"
                alt={`NPC ${npc.character}`}
                width={5417}
                height={5417}
                priority
                className="object-contain"
              />
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
