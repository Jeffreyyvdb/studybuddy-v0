import { Brain } from "lucide-react";
import Link from "next/link";

export function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 border-t border-border bg-background z-10">
      <div className="h-16 max-w-screen-lg max-auto px-4">
        <div className="flex items-center justify-around h-full">
          <Link href="#" className="flex items-center gap-1">
            <div className="bg-red-500 rounded-lg p-1 px-2 flex items-center">
              <Brain className="w-6 h-6 mr-1" />
              <span className="text-white font-bold text-lg">999</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
