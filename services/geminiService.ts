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

/**
 * Handles companion conversations with active knowledge of user memory cards.
 */
export const generateCompanionResponse = async (
  messages: { role: 'user' | 'assistant'; content: string }[],
  memories: string[],
  padSettings?: any
): Promise<string> => {
  const ai = getAi();
  
  const formattedMemories = memories.length > 0 
    ? memories.map((m, i) => `${i + 1}. [${m}]`).join('\n')
    : "No structured memories stored yet. Treat this as a fresh connection.";

  const visualTone = padSettings?.visual || 'standard';
  const cognitiveTone = padSettings?.cognitive || 'standard';

  const systemInstructions = `You are "ABLE AI Core", an empathetic, highly specialized Life Companion for individuals with diverse physical, sensory, or neurological abilities.
  
  CRITICAL HISTORICAL CONTEXT (ALWAYS INCORPORATE AND RESPECT THESE MEMORIES):
  ${formattedMemories}
  
  SYSTEM INTERFACE STATUS:
  - User Visual Ability: ${visualTone}
  - User Cognitive Level: ${cognitiveTone}
  
  CORE INTERACTION MANDATES:
  1. DO NOT exceed three sentences. Be concise, direct, and emotionally supportive.
  2. If user memories specify a struggle (e.g. anxiety with tasks, trouble seeing, glaucoma), adapt your response (e.g. check on them, suggest simpler paces, remind them they have support). Refer back to past details naturally.
  3. Keep the tone loving, humanoid, and warm. Avoid terms like "As an AI..." or "Based on my memory..." Speak like a trusted physical mentor.
  4. Frequently ask supportive or clarifying follow-up questions regarding their well-being, goals, or progress relative to their memories.`;

  // Format conversion
  const contents = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents as any,
      config: {
        systemInstruction: systemInstructions
      }
    });
    return response.text || "I am here with you. Your sync channels are perfectly active.";
  } catch (err) {
    console.error("Failed to generate companion response", err);
    return "I am right here with you. Synaptic connection is steady. What shall we focus on together?";
  }
};

/**
 * Parses user input to check if they shared a new memory candidate (e.g., goal, preference, condition).
 */
export const detectMemoryInsight = async (
  userMessage: string
): Promise<{ detected: boolean; category?: string; content?: string; confidenceExplanation?: string } | null> => {
  const ai = getAi();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Analyze this conversational message from an accessible platform user. Determine if they are stating a personal challenge, symptom, health status, anxiety, life goal, preference, or accessibility requirement they'd want their AI companion to remember:
      
      "${userMessage}"
      
      Return JSON if a clear personal attribute, goal, difficulty, or constraint has been declared. Categories: 'Disability' | 'Anxiety' | 'Goal' | 'Preference' | 'Accessibility' | 'Health' | 'Past Conversation'
      
      Only set "detected" to true if there is a concrete, clear personal fact worth saving.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detected: { type: Type.BOOLEAN },
            category: { type: Type.STRING, description: "Must be Disability, Anxiety, Goal, Preference, Accessibility, Health, or Past Conversation" },
            content: { type: Type.STRING, description: "Clear, concise 1-sentence summary of the fact to remember, written in 3rd person (e.g., 'User experiences anxiety under light contrast settings')" },
            confidenceExplanation: { type: Type.STRING }
          },
          required: ["detected"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to detect Memory Insight", e);
    return null;
  }
};
