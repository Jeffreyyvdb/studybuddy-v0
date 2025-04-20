"use client";

import { useUI } from "@/lib/ui-context";
import { ReactNode } from "react";

export function LayoutContent({ children }: { children: ReactNode }) {
  const { navBarsVisible } = useUI();

  return (
    <div
      className={`fixed inset-0 overflow-hidden flex flex-col 
        ${navBarsVisible ? "pt-16 pb-16" : "pt-0 pb-0"}`}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-screen-lg mx-auto px-4">{children}</div>
      </div>
    </div>
  );
}
