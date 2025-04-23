import { AzureOpenAI } from "openai"; // Import AzureOpenAI from 'openai'

// Define the system prompt
const systemPrompt = `
      You are an intelligent, engaging (supplied topic) tutor designed to help high school students better understand historical events, themes, and patterns. Your goal is not just to test knowledge, but to foster curiosity and deeper thinking through tailored questioning and interactive guidance. 
      First Step: 
      Begin by greeting the student and asking what area or topic in supplied topic they’re currently studying or find difficult. Then generate your first tailored question JSON format explained below. 
      Primary Functionality: 
      You assist students by asking questions, adapting the difficulty and style based on: 
      What the student says they want to learn or struggle with. 
      How the student answers previous questions. 
      You never directly provide answers. Instead, your role is to: 
      Prompt critical thinking and guide the student toward discovering answers. 
      Adjust your strategy if a student is struggling (by offering hints, analogies, historical context, or simpler sub-questions). 
      Create an encouraging, inquisitive atmosphere. 
      
      AI response: 
      You response in a JSON format with the following structure:

      You output only a JSON object immediately after your chat response, using this exact format:

      e.g.

      { 
        "question": "What was the main purpose of the Magna Carta, signed in 1215?", 
        "type": "multiple-choice", 
        "options": ["A", "B", "C", "D"], 
        "previousResponseCorrect": true, 
        "explanation": "Let's start with an open-ended question to get us thinking. The Magna Carta was a significant historical document. Try to explain its purpose and its impact on governance.", 
        "tag": "Medieval History"
      }
      
      Description of parameter “explanation”: This is a natural, friendly message guiding the student: 
      Ask your next question. 
      Provide context or hints if needed. 
      Adapt to the student’s apparent skill level. 
      Always reply with multiple choice options.
      Encourage the student to explain or reflect on their answers. 
            
      Do not supply any other information or context outside of the JSON object.
      `;

export async function POST(req: Request) {
  console.log("--- New Request to /api/chat ---"); // Log start of request
  const azureOpenAiApiKey = process.env.AZURE_OPENAI_API_KEY;
  const azureOpenAiEndpoint = process.env.AZURE_COGNITIVE_SERVICE_ENDPOINT;
  const azureDeploymentName = process.env.AZURE_DEPLOYMENT_NAME || "gpt-4o"; // Use env var or default

  // Log environment variables (excluding key for security)
  console.log("Using Azure Endpoint:", azureOpenAiEndpoint);
  console.log("Using Azure Deployment:", azureDeploymentName);

  if (!azureOpenAiApiKey || !azureOpenAiEndpoint) {
    console.error("Azure OpenAI API credentials are missing."); // Log missing credentials
    return new Response(JSON.stringify({ error: "Azure OpenAI API credentials are missing." }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  // Instantiate AzureOpenAI with endpoint and key
  const client = new AzureOpenAI({
    endpoint: azureOpenAiEndpoint,
    apiKey: azureOpenAiApiKey,
    apiVersion: "2025-01-01-preview", // Use a valid API version
    deployment: azureDeploymentName, // Pass deployment name during initialization
  });

  let userMessages; // Rename to avoid confusion
  try {
    const body = await req.json();
    userMessages = body.messages; // Expecting only user/assistant messages from client
    console.log("Received user messages:", JSON.stringify(userMessages, null, 2)); // Log incoming messages
  } catch (parseError) {
    console.error("Error parsing request body:", parseError);
    return new Response(JSON.stringify({ error: "Invalid request body." }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  if (!userMessages || !Array.isArray(userMessages) || userMessages.length === 0) { // Add check for array and length
    console.error("No valid messages found in request body.");
    return new Response(JSON.stringify({ error: "Missing or invalid messages in request body." }), { // Updated error message
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  // Prepend the system prompt to the user messages
  const messages = [
    { role: "system", content: systemPrompt },
    ...userMessages,
  ];
  console.log("Messages sent to API:", JSON.stringify(messages, null, 2)); // Log messages including system prompt

  try {
    console.log("Calling Azure OpenAI API..."); // Log before API call
    // Use client.chat.completions.create
    const response = await client.chat.completions.create({
      messages, // Send the combined messages array
      max_tokens: 2000, // Use snake_case for parameters
      // model is implicitly set by the deployment name during client initialization
    });

    console.log("Azure OpenAI Raw Response:", JSON.stringify(response, null, 2)); // Log the raw successful response

    const chatbotResponse = response.choices?.[0]?.message?.content || "";

    if (!chatbotResponse) {
      console.warn("AI response content is empty."); // Log warning if content is empty
      // Decide if empty response is an error or valid (e.g., content filtering)
      // For now, let's return it but log a warning.
      // return new Response(JSON.stringify({ error: "AI response is empty." }), {
      //   headers: { "Content-Type": "application/json" },
      //   status: 500,
      // });
    }

    console.log("Extracted Chatbot Response:", chatbotResponse); // Log the extracted response

    return new Response(chatbotResponse, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) { // Type error as any to access properties
    console.error("Error calling Azure OpenAI API:", error); // Log the full error
    // Log specific details if available (e.g., from Azure API error structure)
    if (error.response) {
      console.error("Azure API Error Response Status:", error.response.status);
      console.error("Azure API Error Response Data:", error.response.data);
    } else if (error.request) {
      console.error("Azure API No Response Received:", error.request);
    } else {
      console.error("Azure API Error Message:", error.message);
    }
    return new Response(JSON.stringify({ error: "Failed to fetch AI response." }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
