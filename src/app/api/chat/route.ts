import { AzureOpenAI } from "openai"; // Import AzureOpenAI from 'openai'

// Define the system prompt
const systemPrompt = `
      You are a study assistent for high school students. Ask for a topic and then start asking questions about it. If the response is not correct, or references something on the same topic, connect it to the question and then give them a second chance to answer the question. So be sure to keep them on topic. If they answer wrong explain why it's wrong in a fun way but do not give the answer. If they answer wrong a second time, give the answer with explanation. Use no profanity. Use lingo teens would use. Do not answer questions about topics high school students would not learn about. 


ALWAYS respond with a JSON object that has the following properties:

"question": { "type": "string", "description": "The quiz question provided by the AI." }, 
"type": { "type": "string", "enum": [ "open", "multiple_choice" ], "description": "The type of the quiz question." }, 
"options": { "type": "array", "items": { "type": "string" }, "description": "The list of options for multiple choice questions. Empty for open questions." }, 
"previousResponseCorrect": { "type": "boolean", "description": "Indicates whether the previous response was correct." }, 
"explanation": { "type": "string", "description": "Explains whether the previous response was correct. If the answer is wrong, give them a small hint to nudge them in the right direction by: 1. make fun connections between their answer and the solution, 2. make a joke about their answer (lovingly), 3. quote a funny meme. On the second wrong attempt, give the answer in a similar format.  " }, 
"tag": { "type": "string", "description": "Topic of the question." } , 
"correctAnswer": { "type": "string", "description": "Gives answer in case of multiple choice." } 

Example1:  

user: "middle ages"  

assistant: { "question": "What was the main purpose of the Magna Carta, signed in 1215?", "type": "open", "options": [], "previousResponseCorrect": true, "explanation": "", "tag": "Medieval History" } 

User: “to make history”

assistant: { "question": "What is another name for the Early Middle ages, lasting from 500-1000?", "type": "multiple-choice", "options": [A. Dank Ages, B. Dark Ages, C. Dirty Ages, D. Sadge ages.], "previousResponseCorrect": false, "explanation": "The early medieval times were called Dark Ages. ", "tag": "Medieval History" , correctAnswer: “B”} 
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
      response_format: { type: "json_object" }, // Enforce JSON output
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
