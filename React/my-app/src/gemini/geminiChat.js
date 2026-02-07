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

export async function sendMessage(userMessage) {
  if (!chat) {
    startChat();
  }

  const result = await chat.sendMessage(userMessage);
  const response = await result.response;
  return response.text();
}

export async function sendMessageStream(userMessage, onChunk) {
  if (!chat) {
    startChat();
  }

  const result = await chat.sendMessageStream(userMessage);
  let accumulated = "";

  for await (const chunk of result.stream) {
    accumulated += chunk.text();
    onChunk(accumulated);
  }

  return accumulated;
}

export function resetChat() {
  chat = null;
}
