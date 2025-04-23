import React from "react";

export const Player: React.FC = () => {
  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white text-3xl">🚶</span>
      </div>
    </div>
  );
};
