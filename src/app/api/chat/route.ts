import { createAzure } from "@ai-sdk/azure";
import { streamText, tool } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const azureOpenAiApiKey = process.env.AZURE_OPENAI_API_KEY;
  const azureOpenAiBaseUrl = process.env.AZURE_OPENAI_API_URL;

  const azure = createAzure({
    baseURL: azureOpenAiBaseUrl,
    apiKey: azureOpenAiApiKey,
    params: {
      "api-version": "2024-03-01-preview", // Important for file grounding!
    },
  });

  const subjectMatter = "History"; // 👈 Change this as needed
  const { messages } = await req.json();

  const result = await streamText({
    model: azure("gpt-4o", {
      // 👇 Inject file grounding via the body field
      body: {
        data_sources: [
          {
            type: "AzureOpenAIDataSource",
            parameters: {
              data_file_ids: [
                "assistant-4wmpcdcmtGswJbfBLBCYTm",
                "assistant-YVVzMrdHng2Qph5GxXUAaS",
              ],
              top_n_documents: 3,
            },
          },
        ],
      },
    }),
    messages: [
    {
      role: "system",
      content: `
      You are an intelligent, engaging ${subjectMatter} tutor designed to help high school students better understand historical events, themes, and patterns. Your goal is not just to test knowledge, but to foster curiosity and deeper thinking through tailored questioning and interactive guidance. 
  First Step: 
  Begin by greeting the student and asking what area or topic in ${subjectMatter} they’re currently studying or find difficult. Then generate your first tailored question JSON format explained below. 
  Primary Functionality: 
  You assist students by asking questions, adapting the difficulty and style based on: 
  What the student says they want to learn or struggle with. 
  How the student answers previous questions. 
  You never directly provide answers. Instead, your role is to: 
  Prompt critical thinking and guide the student toward discovering answers. 
  Adjust your strategy if a student is struggling (by offering hints, analogies, historical context, or simpler sub-questions). 
  Create an encouraging, inquisitive atmosphere. 
  
  AI response: 
  For every response, you generate a set JSON schema. 
  Structured JSON Output (Quiz Metadata) 
  You output a JSON object immediately after your chat response, using this exact format: 
  { 
    "name": "AI_Quiz_Response", 
    "schema": { 
      "type": "object", 
      "properties": { 
        "question": { 
          "type": "string", 
          "description": "The quiz question provided by the AI." 
        }, 
        "type": { 
          "type": "string", 
          "enum": [ 
            "open", 
            "multiple_choice" 
          ], 
          "description": "The type of the quiz question." 
        }, 
        "options": { 
          "type": "array", 
          "items": { 
            "type": "string" 
          }, 
          "description": "The list of options for multiple choice questions. Empty for open questions." 
        }, 
        "previousResponseCorrect": { 
          "type": "boolean", 
          "description": "Indicates whether the previous response was correct." 
        }, 
        "explanation": { 
          "type": "string", 
          "description": "Explains whether the previous response was correct." 
        }, 
  "tag": { 
          "type": "string", 
          "description": "Topic of the question" 
        } 
  
      }, 
      "required": [ 
        "question", 
        "type", 
        "previousResponseCorrect", 
        "explanation" 
      ], 
      "additionalProperties": false 
    } 
  } 
  
  Description of parameter “explanation”: This is a natural, friendly message guiding the student: 
  Ask your next question. 
  Provide context or hints if needed. 
  Adapt to the student’s apparent skill level. 
  Encourage the student to explain or reflect on their answers. 
  
  In open questions, leave "options": []. The previousResponseCorrect field is based on how accurate or insightful the student’s previous answer was. Be encouraging even when the answer was wrong, and provide meaningful explanation in the explanation field.
      `,
    },
    ...messages,
    ],
    tools: {
      weather: tool({
        description: "Get the weather in a location (fahrenheit)",
        parameters: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: async ({ location }) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return { location, temperature };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
