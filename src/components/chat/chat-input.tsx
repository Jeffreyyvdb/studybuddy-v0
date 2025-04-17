"use client";

import { FormEvent, useRef } from "react";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function ChatInput({
  input,
  handleInputChange,
  onSubmit,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    onSubmit(e);

    // Close the keyboard by removing focus from the input (for mobile)
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 p-4 bg-background">
      <form
        onSubmit={handleSubmit}
        className="relative max-w-screen-lg mx-auto"
      >
        <input
          ref={inputRef}
          className="w-full pl-6 p-3 pr-12 border border-input bg-background rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!input.trim()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 3 3 9-3 9 19-9Z"></path>
            <path d="M6 12h16"></path>
          </svg>
        </button>
      </form>
    </div>
  );
}
