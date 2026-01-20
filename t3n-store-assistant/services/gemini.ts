
import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

let chatSession: Chat | null = null;

export const initChat = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
    },
  });
  return chatSession;
};

export const sendMessage = async (message: string) => {
  if (!chatSession) {
    chatSession = initChat();
  }

  try {
    const result = await chatSession.sendMessageStream({ message });
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
