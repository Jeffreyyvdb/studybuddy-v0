import React from "react";

interface GameUIProps {
  score: number;
  distance: number;
}

export const GameUI: React.FC<GameUIProps> = ({ score, distance }) => {
  return (
    <div className="absolute inset-x-0 top-0 p-4 flex justify-between items-center bg-black/50 text-white z-10">
      <div className="text-lg font-bold">Score: {score}</div>
      <div className="text-lg">Distance: {Math.floor(distance)}m</div>
    </div>
  );
};
