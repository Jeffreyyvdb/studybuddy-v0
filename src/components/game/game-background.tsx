import React from "react";

interface GameBackgroundProps {
  position: number;
}

export const GameBackground: React.FC<GameBackgroundProps> = ({ position }) => {
  return (
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
  );
};
