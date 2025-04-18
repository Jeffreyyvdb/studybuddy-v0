"use client";

import { useChat } from "@ai-sdk/react";
import { FormEvent, useState } from "react";
import { sampleMessages } from "@/lib/sample-messages";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";

export default function Chat() {
  // For normal operation with AI
  const {
    messages: aiMessages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat();

  // For debugging with sample messages
  const [debugMode, setDebugMode] = useState(false);
  const messages = debugMode ? sampleMessages : aiMessages;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Only call handleSubmit if not in debug mode
    if (!debugMode) {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full pb-16">
      <ChatHeader debugMode={debugMode} setDebugMode={setDebugMode} />
      <MessageList messages={messages} />
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        onSubmit={onSubmit}
      />
    </div>
  );
}
