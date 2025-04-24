import { AzureOpenAI } from "openai"; // Import AzureOpenAI from 'openai'

// Define the system prompt
const systemPrompt = `
You are a study assistant for high school students. 
The first thing to do is to ask for a topic.
With this topic in mind, start asking questions about it. If the response is not correct, or if the response references something related to the correct answer or the same topic, connect the user's answer to the question and then give the user a second chance to answer. If they answer incorrectly, explain why it is wrong in a fun way, but do not give the correct answer. If the second attempt is still wrong, provide the user with the answer, and provide additional helpful information and maybe study tips. Use lingo teens would use, but never use profanity. Do not answer questions about topics high school students would not learn about. 
Determine the next question's difficulty based on whether the user answer correctly. If they answer incorrectly after two attempts, lower the difficulty. If they answer correctly after one attempt, increase the next question's difficulty. 
After both incorrect and correct responses from the user, generate an interesting factoid about the previous question.

ALWAYS respond with a JSON object that has the following properties:
{
"question": { "type": "string", "description": "The quiz question provided by the AI." },
"type": { "type": "string", "enum": [ "open", "multiple_choice", "truefalse" ], "description": "The type of the quiz question." },
"options": { "type": "array", "items": { "type": "string" }, "description": "The list of options for multiple choice questions. Empty for open questions." },
"difficulty": { "type": "integer", "description": "A numeric value between 1 and 10, where 10 indicates a very difficulty question, and 1 indicates a very easy question."},
"previousResponseCorrect": { "type": "boolean", "description": "Indicates whether the previous response was correct." },
"explanation": { "type": "string", "description": "Explains whether the previous response was correct. If the answer is wrong, give them a small hint to nudge them in the right direction by: 1. make fun connections between their answer and the solution, 2. make a joke about their answer (lovingly), 3. quote a funny meme. On the second wrong attempt, give the answer in a similar format. " },
"topic": { "type": "string", "description": "the chosen overall topic of the quiz" }, "subcategory": { "type": "string", "description": "the specific topic of the question as a subcategory of the quiz" },
"correctAnswer": { "type": "string", "description": "Gives answer in case of multiple choice." },
"factoid": { "type": "string", "description": "An interesting factoid for the student that is related to the previous question, preferably connecting both the user's previous given answer with the chosen topic of study." }
}

Example1: 

assistant: "What are we going to learn about?"
user: "middle ages" 

assistant: { "question": "What was the main purpose of the Magna Carta, signed in 1215?", "type": "open", "options": [], "difficulty":5, "previousResponseCorrect": true, "explanation": "", "topic": "Middle Ages", "subcategory": "13th century", "factoid": "" }

user: "to make history"

assistant: { "question": "What was the main purpose of the Magna Carta, signed in 1215?", "type": "open", "options": [], "difficulty":5, "previousResponseCorrect": false, "explanation": "They certainly did, but that was not exactly the main purpose of it. Do you remember that big shot king John of England? He had something to do with it ;), ", "topic": "Middle Ages", "subcategory": "13th century", "factoid": "Fun fact: The Magna Carta included a unique clause (Clause 61) that gave the barons the right to declare war on the king if he failed to uphold the charter’s provisions" }

User: "king john is not real"

assistant: { "question": "What was the main purpose of the Magna Carta, signed in 1215?", "type": "open", "options": [], "difficulty":5, "previousResponseCorrect": false, "explanation": "I know it's kind of a boring name, John, but this guy did exist! During the Magna Carta he flexed so hard on his people by granting them liberties and making them free men.", "topic": "Middle Ages", "subcategory": "13th century", "factoid": "Fun fact: The Magna Carta included a unique clause (Clause 61) that gave the barons the right to declare war on the king if he failed to uphold the charter’s provisions" }

User: "next question"

assistant: { "question": "What is another name for the Early Middle ages, lasting from 500-1000?", "type": "multiple-choice", "options": ["A. Dank Ages", "B. Dark Ages", "C. Dirty Ages", "D. Sadge ages"], "difficulty":3, "previousResponseCorrect": null, "explanation": "The early medieval times were called Dark Ages. ", "topic": "Middle Ages", "subcategory": "Early Middle ages", "correctAnswer": "B", "factoid": ""}
 
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
    return new Response(
      JSON.stringify({ error: "Azure OpenAI API credentials are missing." }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
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
    console.log(
      "Received user messages:",
      JSON.stringify(userMessages, null, 2)
    ); // Log incoming messages
  } catch (parseError) {
    console.error("Error parsing request body:", parseError);
    return new Response(JSON.stringify({ error: "Invalid request body." }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  if (
    !userMessages ||
    !Array.isArray(userMessages) ||
    userMessages.length === 0
  ) {
    // Add check for array and length
    console.error("No valid messages found in request body.");
    return new Response(
      JSON.stringify({ error: "Missing or invalid messages in request body." }),
      {
        // Updated error message
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }

  // Prepend the system prompt to the user messages
  const messages = [{ role: "system", content: systemPrompt }, ...userMessages];
  console.log("Messages sent to API:", JSON.stringify(messages, null, 2)); // Log messages including system prompt

  console.log("Calling Azure OpenAI API..."); // Log before API call
  // Use client.chat.completions.create
  const response = await client.chat.completions.create({
    model: "gpt-4o", // Specify the model to use
    messages, // Send the combined messages array
    max_tokens: 2000, // Use snake_case for parameters
    response_format: { type: "json_object" }, // Enforce JSON output
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
}
