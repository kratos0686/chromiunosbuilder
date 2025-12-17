import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize the API client
// CRITICAL: process.env.API_KEY is assumed to be available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, // Lower temperature for more technical/factual answers
      },
    });
  }
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const chat = getChatSession();
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "No response text received.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const sendMessageStreamToGemini = async function* (message: string) {
    const chat = getChatSession();
    try {
        const streamResponse = await chat.sendMessageStream({ message });
        for await (const chunk of streamResponse) {
             const c = chunk as GenerateContentResponse;
             if (c.text) {
                 yield c.text;
             }
        }
    } catch (error) {
        console.error("Gemini Stream Error:", error);
        throw error;
    }
}
