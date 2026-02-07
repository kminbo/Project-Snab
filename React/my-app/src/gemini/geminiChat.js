import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "./systemPrompt.js";

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
  });

  chat = model.startChat();

  return chat;
}

export async function sendMessage(userMessage) {
  if (!chat) {
    startChat();
  }

  const result = await chat.sendMessage(userMessage);
  const response = await result.response;
  return response.text();
}

export function resetChat() {
  chat = null;
}

export async function analyzeFirstMessage(userMessage) {
  // Use a fresh model for this analysis to avoiding polluting the main chat
  if (!genAI) {
    initializeGemini();
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
  Analyze the following user message and classify it into one of these themes:
  1. Specificity (Navigating a specific event/scenario)
  2. Complexity (Complex interpersonal relationships/situations)
  3. Simplicity (High emotion, low context)

  If Simplicity, determine the emotion category:
  - "Stress + Overthinking + Anxiety" -> Game: "Crystal Race"
  - "Depression, Trauma, PTSD" -> Game: "Glitter Maze"
  - "Depression, Anger Issues" -> Game: "Dragon Flyer"
  - "Grief, Stress, Anxiety" -> Game: "Magic Paint"
  - "Trauma, PTSD, Anxiety" -> Game: "Star Catcher"

  Return JSON:
  {
    "theme": "Specificity" | "Complexity" | "Simplicity",
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
