import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface MobileControlsProps {
  onButtonPress: (direction: number) => void;
  onButtonRelease: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onButtonPress,
  onButtonRelease,
}) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4 z-30 md:hidden ">
      <button
        className="w-16 h-16 bg-background rounded-full flex items-center justify-center text-2xl shadow-lg "
        onTouchStart={() => onButtonPress(-1)}
        onTouchEnd={onButtonRelease}
        onMouseDown={() => onButtonPress(-1)}
        onMouseUp={onButtonRelease}
        onMouseLeave={onButtonRelease}
      >
        <ArrowLeft size={32} />
      </button>
      <button
        className="w-16 h-16 bg-background rounded-full flex items-center justify-center text-2xl shadow-lg "
        onTouchStart={() => onButtonPress(1)}
        onTouchEnd={onButtonRelease}
        onMouseDown={() => onButtonPress(1)}
        onMouseUp={onButtonRelease}
        onMouseLeave={onButtonRelease}
      >
        <ArrowRight size={32} />
      </button>
    </div>
  );
};
