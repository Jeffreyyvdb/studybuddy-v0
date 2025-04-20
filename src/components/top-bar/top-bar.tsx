"use client";

import { Brain, Flame } from "lucide-react";
import Link from "next/link";
import { useUI } from "@/lib/ui-context";

export function TopBar() {
  const { navBarsVisible } = useUI();

  // Don't render the TopBar if it should be hidden
  if (!navBarsVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 border-b border-border bg-background z-50">
      <div className="h-16 max-w-screen-lg max-auto px-4">
        <div className="flex justify-between h-full">
          <Link href="#" className="flex items-center gap-1">
            <div className="bg-red-500 rounded-lg p-1 px-2 flex items-center">
              <Brain className="text-white w-6 h-6 mr-1" />
              <span className="text-white font-bold text-lg">999</span>
            </div>
          </Link>
          <Link href="#" className="flex items-center gap-1">
            <div className="bg-orange-500 rounded-lg p-1 px-2 flex items-center">
              <Flame className=" text-white w-6 h-6 mr-1" />
              <span className="text-white font-bold text-lg">999</span>
            </div>
          </Link>

          <Link href="#" className="flex items-center gap-1">
            <div className="bg-purple-500 rounded-lg p-1 px-2 flex items-center">
              <span className=" text-white font-bold  mr-1">LVL</span>
              <span className="text-white font-bold text-lg">999</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
