import React from "react";
import Image from "next/image";

interface PlayerProps {
  direction: number; // -1 for left, 0 for stationary, 1 for right
  isMoving: boolean;
}

export const Player: React.FC<PlayerProps> = ({ direction, isMoving }) => {
  // Calculate animation class and transform style based on direction and movement
  const getAnimationClass = () => {
    if (!isMoving) return "";
    return direction === -1 ? "animate-move-left" : "animate-move-right";
  };

  // Apply horizontal flip when moving left
  const getTransformStyle = () => {
    return direction === -1 ? { transform: "scaleX(-1)" } : {};
  };

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
      <div
        className={`w-32 h-32 flex items-center justify-center ${getAnimationClass()} transition-transform duration-300`}
      >
        <Image
          src="/images/study-buddy.png"
          alt="Study Buddy character"
          width={1024}
          height={1024}
          priority
          className="object-contain"
          style={getTransformStyle()}
        />
      </div>
    </div>
  );
};
