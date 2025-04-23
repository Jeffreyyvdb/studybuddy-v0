import React from "react";

export const LoadingQuestion: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 bg-black/70">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-xl font-bold mb-2">Loading Question...</h3>
          <p className="text-muted-foreground text-center">
            The AI is generating a question about this topic just for you!
          </p>
        </div>
      </div>
    </div>
  );
};
