"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function GameModePage() {
  return (
    <div
      className="flex flex-col min-h-screen p-4 relative"
      style={{
        backgroundImage: "url('/images/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Semi-transparent overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(200, 200, 200, 0.6)",
          pointerEvents: "none",
        }}
      ></div>

      {/* Content positioned above the overlay */}
      <div className="flex-1 relative z-10">
        <h1 className="text-3xl font-bold mb-6 ml-2 mt-4 text-black">
          Start your studying
        </h1>
        <div className="flex flex-col gap-4">
          <Link href="/choose-subject" className="w-full">
            <Button
              className="text-xl w-full justify-start relative h-16 border-0 shadow-none bg-white"
              variant={"outline"}
            >
              <div className="absolute left-4 w-6 h-6">
                <Image
                  src="/images/file.png"
                  alt="Study"
                  width={160}
                  height={160}
                />
              </div>
              <div className="flex-1 text-center">Study</div>
            </Button>
          </Link>

          <Link href="/game" className="w-full">
            <Button
              className="text-xl w-full justify-start relative h-16 border-0 shadow-none bg-white"
              variant={"outline"}
            >
              <div className="absolute left-4 w-6 h-6">
                <Image
                  src="/images/pen.png"
                  alt="Train for exam"
                  width={126}
                  height={126}
                />
              </div>
              <div className="flex-1 text-center">Train for exam</div>
            </Button>
          </Link>

          <div className="w-full">
            <Button
              variant={"outline"}
              className="text-xl w-full justify-start relative h-16 opacity-60 border-0 shadow-none bg-white"
              disabled={true}
            >
              <div className="absolute left-4 w-6 h-6">
                <Image
                  src="/images/beker.png"
                  alt="Challenge"
                  width={208}
                  height={208}
                />
              </div>
              <div className="flex-1 text-center">
                Challenge your classmates
              </div>
            </Button>
          </div>

          <Link href="/game" className="w-full">
            <Button
              className="text-xl w-full justify-start relative h-16 border-0 shadow-none bg-white"
              variant={"outline"}
            >
              <div className="absolute left-4 w-6 h-6">
                <Image
                  src="/images/medal.png"
                  alt="Medals and progress"
                  width={277}
                  height={394}
                />
              </div>
              <div className="flex-1 text-center">My medals and progress</div>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
