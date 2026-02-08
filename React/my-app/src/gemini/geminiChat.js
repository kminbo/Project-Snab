import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { SYSTEM_PROMPT } from "./systemPrompt.js";

// Safety settings tuned for mental health context:
// - Allow users to safely discuss difficult emotions (anxiety, anger, fear)
// - Block genuinely harmful content (suicide/self-harm, harassment, hate speech)
// - Balance openness with protection, as a therapist must do
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let chat = null;

export function initializeGemini() {
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not set in environment variables");
  }
  genAI = new GoogleGenerativeAI(API_KEY);
}

export function startChat() {
  if (!genAI) {
    initializeGemini();
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    safetySettings,
  });

  chat = model.startChat();

  return chat;
}

// Handles sending a standard message to the AI and waiting for the full response
export async function sendMessage(userMessage) {
  if (!chat) {
    startChat();
  }

  const result = await chat.sendMessage(userMessage);
  const response = await result.response;
  return response.text();
}

// Sends a message and streams the response back for a "typewriter" effect in the UI
export async function sendMessageStream(userMessage, onChunk) {
  if (!chat) {
    startChat();
  }

  const result = await chat.sendMessageStream(userMessage);
  let accumulated = "";

  for await (const chunk of result.stream) {
    accumulated += chunk.text();
    onChunk(accumulated); // Call the provided function with the latest text
  }

  return accumulated;
}

// Resets the chat history to start a fresh conversation
export function resetChat() {
  chat = null;
}

// Analyzes the user's message to determine which therapeutic tool (Mind Map, Visualizer, etc.) is most appropriate
export async function analyzeTheme(userMessage) {
  // Use a fresh model for this analysis to avoiding polluting the main chat
  if (!genAI) {
    initializeGemini();
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
  Analyze the following user message to determine the best therapeutic tool. 
  
  Themes:
  1. Specificity (User mentions a specific event, person, or scenario they are navigating)
  2. Complexity (User vaguely describes a complex messy situation or relationship)
  3. Simplicity (User expresses a raw emotion like anxiety, stress, anger, depression with little context)
  4. Unclear (Absolute gibberish, "hello", or "idk". NOTE: If there is ANY hint of emotion or situation, CLASSIFY it instead of Unclear.)

  If Simplicity, determine the emotion category:
  - "Stress + Overthinking + Anxiety" -> Game: "Crystal Race"
  - "Depression, Trauma, PTSD" -> Game: "Glitter Maze"
  - "Depression, Anger Issues" -> Game: "Dragon Flyer"
  - "Grief, Stress, Anxiety" -> Game: "Magic Paint"
  - "Trauma, PTSD, Anxiety" -> Game: "Star Catcher"

  Return JSON:
  {
    "theme": "Specificity" | "Complexity" | "Simplicity" | "Unclear",
    "targetMode": "visualizer" | "mind_map" | "game_selection" | null,
    "targetGame": "Game Name" | null
  }

  User Message: "${userMessage}"
  `;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Error analyzing message:", error);
    return { theme: null };
  }
}

export async function analyzeConfirmation(userMessage) {
  if (!genAI) {
    initializeGemini();
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
    Analyze the following user message to see if they are confirming/agreeing to a suggestion (e.g., "Yes", "Sure", "Okay", "Sounds good") or rejecting/ignoring it.
    
    Return JSON:
    {
      "isConfirmed": boolean
    }
  
    User Message: "${userMessage}"
    `;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Error analyzing confirmation:", error);
    return { isConfirmed: false };
  }
}
