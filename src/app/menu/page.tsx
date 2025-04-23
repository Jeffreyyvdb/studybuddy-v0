"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function GameModePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject") || "history";

  const studyOptions = [
    {
      id: "study",
      name: "Study",
      icon: "📁", // Using emoji as placeholder
      available: true,
    },
    {
      id: "train",
      name: "Train for exam",
      icon: "✏️", // Using emoji as placeholder
      available: true,
    },
    {
      id: "challenge",
      name: "Challenge your classmates",
      icon: "🏆", // Using emoji as placeholder
      available: false,
    },
    {
      id: "progress",
      name: "My medals and progress",
      icon: "🥇", // Using emoji as placeholder
      available: true,
    },
  ];

  const handleOptionClick = (optionId: string, available: boolean) => {
    if (!available) return;

    router.push(`/game?mode=${optionId}&subject=${subject}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-sky-100 p-4 relative">
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-6 ml-2 mt-4">
          Start your studying
        </h1>
        <div className="flex flex-col gap-4">
          {studyOptions.map((option) => (
            <Button
              key={option.id}
              className={`text-xl w-full justify-start relative h-16 ${
                !option.available ? "opacity-60" : ""
              }`}
              onClick={() => handleOptionClick(option.id, option.available)}
              disabled={!option.available}
            >
              <div className="absolute left-4">{option.icon}</div>
              <div className="flex-1 text-center">{option.name}</div>
              {!option.available && (
                <span className="absolute right-4">🔒</span>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
