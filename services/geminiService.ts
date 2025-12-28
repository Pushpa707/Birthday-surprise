
import { GoogleGenAI, Type } from "@google/genai";
import { BirthdayProfile, GeneratedMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateBirthdayMessage = async (profile: BirthdayProfile): Promise<GeneratedMessage> => {
  const prompt = `
    Generate a deeply personalized, ${profile.tone.toLowerCase()} birthday message for my ${profile.relationship.toLowerCase()}, ${profile.recipientName}. 
    From: ${profile.senderName}.
    Include these shared memories: ${profile.sharedMemories}.
    Make it feel modern, 2025-ready, and touching.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A catchy romantic title" },
          body: { type: Type.STRING, description: "The main emotional content" },
          closing: { type: Type.STRING, description: "A heartwarming sign-off" },
        },
        required: ["title", "body", "closing"]
      }
    }
  });

  try {
    const text = response.text;
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return {
      title: `Happy Birthday, ${profile.recipientName}!`,
      body: `May your special day be filled with endless joy and magic. You mean the world to me.`,
      closing: `With all my love, ${profile.senderName}`
    };
  }
};

export const generatePersonalizedImage = async (prompt: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image generation failed", error);
  }
  return undefined;
};
