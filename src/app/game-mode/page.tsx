"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GameModePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject") || "history";

  const studyOptions = [
    {
      id: "study",
      name: "Study",
      icon: "📕", // Using emoji as placeholder
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
            // <Card
            //   key={option.id}
            //   className={`p-4 rounded-xl flex items-center cursor-pointer transition-all ${
            //     option.available ? "bg-white" : "bg-gray-100"
            //   }`}
            //   onClick={() => handleOptionClick(option.id, option.available)}
            // >
            //   <div
            //     className={`w-10 h-10 mr-4 flex items-center justify-center text-2xl ${
            //       option.id === "study"
            //         ? "text-orange-500"
            //         : option.id === "train"
            //         ? "text-blue-500"
            //         : option.id === "challenge"
            //         ? "text-yellow-500"
            //         : "text-yellow-500"
            //     }`}
            //   >
            //     {option.icon}
            //   </div>

            //   <span className="text-xl font-normal">{option.name}</span>

            //   {!option.available && (
            //     <div className="ml-auto flex items-center">
            //       <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs mr-2">
            //         locked
            //       </span>
            //       <span className="text-xl">🔒</span>
            //     </div>
            //   )}

            //   {option.id === "study" && (
            //     <div className="ml-auto">
            //       <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
            //         comfortable
            //       </span>
            //     </div>
            //   )}
            // </Card>
            <Button key={option.id}>{option.name}</Button>
          ))}
        </div>
      </div>

      <div className="h-16 bg-green-400 fixed bottom-0 left-0 right-0">
        {/* Bottom green bar */}
      </div>
    </div>
  );
}
