import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import context from "../system_prompt.ts";
import console from "console"; // Use Node.js console as logger

if (!process.env.GEMINI_API_KEY) {
  console.error("Configure GEMINI_API_KEY no .env");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function sendTextToIA(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text }] }],
    config: {
      systemInstruction: context,
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });
  const output = response.text;
  return output;
}
