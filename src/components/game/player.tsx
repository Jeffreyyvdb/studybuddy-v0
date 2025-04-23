import React from "react";
import Image from "next/image";

export const Player: React.FC = () => {
  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
      <div className="w-32 h-32 flex items-center justify-center shadow-lg">
        <Image
          src="/images/study-buddy.png"
          alt="Study Buddy character"
          width={100}
          height={100}
          priority
          className="object-contain"
        />
      </div>
    </div>
  );
};
