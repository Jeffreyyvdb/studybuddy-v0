import { UIMessage } from "ai";
import { useEffect, useRef, useLayoutEffect } from "react";
import { MessageBubble } from "./message-bubble";

interface MessageListProps {
  messages: UIMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Run on initial page load
  useLayoutEffect(() => {
    scrollToBottom();
  }, []);

  // Run when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 pb-4 mb-16">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex whitespace-pre-wrap mb-4 ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <MessageBubble message={message} />
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
