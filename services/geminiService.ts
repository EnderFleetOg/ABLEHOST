import { GoogleGenAI, Type } from "@google/genai";
import { PAD, CareerPath, LocationSimulation } from "../types";

// Helper to get a fresh instance of the Gemini API client
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Suggests career paths based on user's accessibility profile and interests.
 * Uses gemini-3-pro-preview for complex reasoning tasks.
 */
export const getCareerGuidance = async (pad: PAD, interests: string): Promise<CareerPath[]> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Suggest 3 career paths for a person with this Personal Accessibility DNA (PAD): ${JSON.stringify(pad)} and these interests: "${interests}". 
    CRITICAL INSTRUCTIONS:
    1. Use VERY SIMPLE ENGLISH (Grade 4 level/Primary school level). No complex words or metaphors.
    2. Response must be "Ability-First": Explain why their perspective is a professional advantage.
    3. Be extremely concise: STRICTLY 1-2 sentences per role.
    4. Persona: Supportive, humanoid, and warm. NEVER use AI jargon or robot-talk.
    Return a JSON array of objects with the specified schema properties.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            compatibility: { type: Type.NUMBER },
            description: { type: Type.STRING },
            skills: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            visualAlternativeNeeded: { type: Type.BOOLEAN },
            speechSupportLevel: { 
              type: Type.STRING,
              description: "Must be 'low', 'medium', or 'high'."
            }
          },
          required: ["title", "compatibility", "description", "skills", "visualAlternativeNeeded", "speechSupportLevel"]
        }
      }
    }
  });

  try {
    // Accessing .text property directly as per guidelines
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse career guidance", e);
    return [];
  }
};

/**
 * Analyzes surroundings from an image for accessibility barriers and navigation info.
 */
export const analyzeSurroundings = async (imageData: string): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: imageData.split(',')[1], mimeType: 'image/jpeg' } },
        { text: "Describe surroundings for a person with disabilities. Identify obstacles and signage. CRITICAL: 1-2 SENTENCES MAX. Use SIMPLE SCHOOL-LEVEL ENGLISH. Supportive tone. No robot-talk." }
      ]
    }
  });
  // Accessing .text property directly
  return response.text || "Description unavailable.";
};

/**
 * Analyzes a specific location against user's PAD DNA to provide a guided simulation.
 * Fixes the missing export error in MapModule.tsx.
 */
export const getSimulationAnalysis = async (pad: PAD, loc: LocationSimulation): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the accessibility of this location: "${loc.name}" (Type: ${loc.type}) for a person with this Personal Accessibility DNA (PAD): ${JSON.stringify(pad)}. 
    The location has features: ${loc.accessibilityFeatures.join(', ')} and potential hazards: ${loc.potentialHazards.join(', ')}.
    Explain how their traits (${pad.visual} and ${pad.speech}) fit this place.
    STRICTLY 1-2 SENTENCES. Use VERY SIMPLE ENGLISH (Grade 4 level). Be warm and humanoid. No metaphors or complex ideas.`,
  });
  // Accessing .text property directly
  return response.text || "Simulation analysis unavailable.";
};
