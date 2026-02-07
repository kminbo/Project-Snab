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
