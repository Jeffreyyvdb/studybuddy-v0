import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MoveRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-grow flex-col items-center justify-center bg-background">
      <div className="container flex flex-col items-center px-4 py-6 space-y-6 max-w-md">
        {/* Logo or badge */}
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" />
            <circle cx="17" cy="7" r="5" />
          </svg>
        </div>
        {/* Hero title */}
        <h1 className="text-4xl md:text-5xl font-bold text-center tracking-tight">
          Study Buddy
        </h1>
        <p className="text-muted-foreground text-center text-base max-w-xs">
          Your AI-powered study assistant. Get homework help, exam prep, and
          learning support anytime.
        </p>
        {/* Robot image - reduced size */}
        <div className="w-48 h-48 relative">
          <Image
            src="/images/study-buddy.png"
            alt="StudyBuddy Robot"
            fill
            className="object-contain"
            priority
          />
        </div>
        <Link href="/chat" className="w-full max-w-xs">
          <Button size="lg" className="w-full gap-2 font-medium">
            Get Started
            <MoveRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
