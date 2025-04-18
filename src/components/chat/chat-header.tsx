"use client";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ChatHeaderProps {
  debugMode: boolean;
  setDebugMode: (value: boolean) => void;
}

export function ChatHeader({ debugMode, setDebugMode }: ChatHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background border-b p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Study Buddy</h1>

      <div className="flex items-center space-x-2">
        <Switch
          id="debug-mode"
          checked={debugMode}
          onCheckedChange={setDebugMode}
        />
        <Label htmlFor="debug-mode" className="text-sm text-muted-foreground">
          Debug Mode
        </Label>
      </div>
    </div>
  );
}
