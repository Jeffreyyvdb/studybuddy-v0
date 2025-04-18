import { UIMessage } from "ai";

export const sampleMessages: UIMessage[] = [
  {
    id: "user-1",
    createdAt: new Date("2025-04-17T23:05:23.526Z"),
    role: "user",
    content: "Hi there!",
    parts: [
      {
        type: "text",
        text: "Hi there!",
      },
    ],
  },
  {
    id: "assistant-1",
    createdAt: new Date("2025-04-17T23:05:23.930Z"),
    role: "assistant",
    content: "Hello! How can I assist you today?",
    parts: [
      {
        type: "text",
        text: "Hello! How can I assist you today?",
      },
    ],
  },
  {
    id: "user-2",
    createdAt: new Date("2025-04-17T23:06:15.526Z"),
    role: "user",
    content: "I need help with my math homework.",
    parts: [
      {
        type: "text",
        text: "I need help with my math homework.",
      },
    ],
  },
  {
    id: "assistant-2",
    createdAt: new Date("2025-04-17T23:06:20.930Z"),
    role: "assistant",
    content:
      "I'd be happy to help with your math homework! What specific topic or problem are you working on?",
    parts: [
      {
        type: "text",
        text: "I'd be happy to help with your math homework! What specific topic or problem are you working on?",
      },
    ],
  },
  {
    id: "user-3",
    createdAt: new Date("2025-04-17T23:07:10.526Z"),
    role: "user",
    content: "I'm trying to solve this equation: 2x + 5 = 15",
    parts: [
      {
        type: "text",
        text: "I'm trying to solve this equation: 2x + 5 = 15",
      },
    ],
  },
  {
    id: "assistant-3",
    createdAt: new Date("2025-04-17T23:07:15.930Z"),
    role: "assistant",
    content:
      "Let's solve this step by step:\n\n1) First, subtract 5 from both sides:\n   2x + 5 - 5 = 15 - 5\n   2x = 10\n\n2) Now divide both sides by 2:\n   2x ÷ 2 = 10 ÷ 2\n   x = 5\n\nTherefore, x = 5 is the solution to the equation 2x + 5 = 15. You can verify this by substituting x = 5 back into the original equation:\n\n2(5) + 5 = 10 + 5 = 15 ✓",
    parts: [
      {
        type: "text",
        text: "Let's solve this step by step:\n\n1) First, subtract 5 from both sides:\n   2x + 5 - 5 = 15 - 5\n   2x = 10\n\n2) Now divide both sides by 2:\n   2x ÷ 2 = 10 ÷ 2\n   x = 5\n\nTherefore, x = 5 is the solution to the equation 2x + 5 = 15. You can verify this by substituting x = 5 back into the original equation:\n\n2(5) + 5 = 10 + 5 = 15 ✓",
      },
    ],
  },
  {
    id: "user-4",
    createdAt: new Date("2025-04-17T23:08:20.526Z"),
    role: "user",
    content: "Thanks! Can you also help me with a tool invocation example?",
    parts: [
      {
        type: "text",
        text: "Thanks! Can you also help me with a tool invocation example?",
      },
    ],
  },
  {
    id: "assistant-4",
    createdAt: new Date("2025-04-17T23:08:25.930Z"),
    role: "assistant",
    content: "Here's a tool invocation example for you:",
    parts: [
      {
        type: "text",
        text: "Here's a tool invocation example for you:",
      },
      {
        type: "tool-invocation",
        toolInvocation: {
          state: "call",
          step: 0,
          toolName: "calculator",
          args: {
            operation: "calculate",
            expression: "(15 * 3) + (27 / 3)",
          },
          toolCallId: "call_calculator_example",
        },
      },
      {
        type: "text",
        text: "The result of this calculation would be 54.",
      },
    ],
    toolInvocations: [
      {
        state: "call",
        step: 0,
        toolName: "calculator",
        args: {
          operation: "calculate",
          expression: "(15 * 3) + (27 / 3)",
        },
        toolCallId: "call_calculator_example",
      },
    ],
  },
  {
    id: "user-5",
    createdAt: new Date("2025-04-17T23:09:30.526Z"),
    role: "user",
    content: "K",
    parts: [
      {
        type: "text",
        text: "K",
      },
    ],
  },
  {
    id: "assistant-5",
    createdAt: new Date("2025-04-17T23:09:35.930Z"),
    role: "assistant",
    content: "Is there anything else you'd like help with today?",
    parts: [
      {
        type: "text",
        text: "Is there anything else you'd like help with today?",
      },
    ],
  },
];
