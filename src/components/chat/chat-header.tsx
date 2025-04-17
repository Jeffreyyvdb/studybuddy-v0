"use client";

import { ModeToggle } from "@/components/ui/mode-toggle";

interface ChatHeaderProps {
  debugMode: boolean;
  setDebugMode: (value: boolean) => void;
}

export function ChatHeader({ debugMode, setDebugMode }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full p-4">
      <ModeToggle />
      <button
        onClick={() => setDebugMode(!debugMode)}
        className="text-xs text-muted-foreground"
      >
        {debugMode ? "Using Sample Data" : "Using AI"}
      </button>
    </div>
  );
}
