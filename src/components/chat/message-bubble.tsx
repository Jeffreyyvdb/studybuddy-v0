import { ChatMessage, MessagePart } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={`p-3 rounded-lg inline-block ${
        message.role === "user"
          ? "bg-primary/10 max-w-[80%]"
          : "bg-muted max-w-[80%]"
      }`}
    >
      {message.parts.map((part: MessagePart, i) => {
        switch (part.type) {
          case "text":
            return <div key={i}>{part.text}</div>;
          case "tool-invocation":
            return (
              <pre
                key={i}
                className="overflow-x-auto text-sm bg-background/50 p-2 rounded"
              >
                {JSON.stringify(part.toolInvocation, null, 2)}
              </pre>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
