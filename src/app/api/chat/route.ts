import { createAzure } from "@ai-sdk/azure";
import { streamText, tool } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const azureOpenAiApiKey = process.env.AZURE_OPENAI_API_KEY;
  const azureOpenAiBaseUrl = process.env.AZURE_OPENAI_API_URL;

  const azure = createAzure({
    baseURL: azureOpenAiBaseUrl,
    apiKey: azureOpenAiApiKey,
  });

  const { messages } = await req.json();

  const result = streamText({
    model: azure("gpt-4o"),
    messages,
    tools: {
      weather: tool({
        description: "Get the weather in a location (fahrenheit)",
        parameters: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: async ({ location }) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return {
            location,
            temperature,
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
