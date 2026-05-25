import { GoogleGenAI, Type } from "@google/genai";
import { PAD, AbilityProfile } from "../types";

// Helper to get a fresh instance of the Gemini API client
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes user-described disabilities/symptoms and returns a tailored AbilityProfile configuration.
 */
export const analyzeAbilityProfile = async (description: string): Promise<AbilityProfile> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: `Analyze the following description of a user's disabilities, medical conditions, symptoms, or accessibility challenges, and generate a customized Personal Accessibility Profile to configure their adaptive operating system:
    
    "${description}"
    
    CRITICAL INSTRUCTIONS:
    1. Infer the correct VisualAbility, SpeechStyle, CognitiveMode, HearingNeed, and VisionNeed based on descriptions.
    2. Suggest highContrast (boolean) and largeText (boolean) adjustments.
    3. Suggest speechRate (number between 0.5 for slow, to 1.5 for fast. Normal is 1.0).
    4. Provide a warm, emotionally supportive, highly humanoid explanation outlining why these settings were selected, and encouraging the user. Under 3 sentences. No AI jargon or robot-talk.
    5. Be extremely precise and mapping to the exact enum values:
       - VisualAbility: 'standard', 'blurry', 'low-contrast', 'partial-blindness'
       - SpeechStyle: 'standard', 'stutter-aware', 'frequent-pauses', 'non-verbal'
       - CognitiveMode: 'standard', 'simplified', 'high-focus'
       - HearingNeed: 'standard', 'hard-of-hearing', 'deaf'
       - VisionNeed: 'standard', 'low-vision', 'blind'`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          visual: { type: Type.STRING, description: "Must be standard, blurry, low-contrast, or partial-blindness" },
          speech: { type: Type.STRING, description: "Must be standard, stutter-aware, frequent-pauses, or non-verbal" },
          cognitive: { type: Type.STRING, description: "Must be standard, simplified, or high-focus" },
          hearing: { type: Type.STRING, description: "Must be standard, hard-of-hearing, or deaf" },
          vision: { type: Type.STRING, description: "Must be standard, low-vision, or blind" },
          largeText: { type: Type.BOOLEAN },
          highContrast: { type: Type.BOOLEAN },
          speechRate: { type: Type.NUMBER, description: "Between 0.5 and 1.5" },
          explanation: { type: Type.STRING, description: "Under 3 sentences, warm, human" }
        },
        required: ["visual", "speech", "cognitive", "hearing", "vision", "largeText", "highContrast", "speechRate", "explanation"]
      }
    }
  });

  try {
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse ability profile", e);
    return {
      visual: 'standard' as any,
      speech: 'standard' as any,
      cognitive: 'standard' as any,
      hearing: 'standard' as any,
      vision: 'standard' as any,
      largeText: false,
      highContrast: false,
      speechRate: 1.0,
      explanation: "We've synced your core profile. Standard channels are open."
    };
  }
};
