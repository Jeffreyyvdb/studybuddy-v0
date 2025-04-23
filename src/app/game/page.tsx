"use client";

import Game from "./Game";
import { useEffect } from "react";

export default function GamePage() {
  // Prevent scrolling and ensure full screen on mount
  useEffect(() => {
    // Save original styles to restore them on unmount
    const originalStyle = window.getComputedStyle(document.body);
    const originalOverflow = originalStyle.overflow;
    const originalHeight = originalStyle.height;
    const originalPosition = originalStyle.position;

    // Apply styles to prevent scrolling
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";

    // Clean up when component unmounts
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
      document.body.style.position = originalPosition;
      document.body.style.width = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full">
      <Game />
    </div>
  );
}
