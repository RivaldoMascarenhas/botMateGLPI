import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import context from "./system_prompt";
import { GEMINI_API_KEY } from "./index";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function sendTextToIA(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text }] }],
    config: {
      systemInstruction: context,
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });
  const output = response.text;
  return output;
}
