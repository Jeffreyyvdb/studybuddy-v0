"use client";

import { useChat } from "@ai-sdk/react";
import { FormEvent, useState } from "react";
import { sampleMessages } from "@/lib/sample-messages";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";

export default function Chat() {
  // Destructure setInput from useChat
  const {
    messages: aiMessages,
    input,
    handleInputChange,
    handleSubmit,
    setInput, // Add setInput here
  } = useChat();

  const [debugMode, setDebugMode] = useState(false);
  const messages = debugMode ? sampleMessages : aiMessages;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim()) return;

    if (!debugMode) {
      handleSubmit(e); // This already clears the input
    } else {
      // Manually clear the input in debug mode
      console.log("Debug mode: Simulating send, clearing input."); // Optional: log for clarity
      setInput(""); // Clear the input state
    }
  };

  return (
    <div className="flex flex-col h-full ">
      <ChatHeader debugMode={debugMode} setDebugMode={setDebugMode} />
      <MessageList messages={messages} />
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        onSubmit={onSubmit} // Pass the updated onSubmit handler
      />
    </div>
  );
}
