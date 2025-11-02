

import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const recognizeMedicineFromImage = async (base64Image: string, mimeType: string): Promise<{ name: string; description: string }> => {
  try {
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: "From the image of a medicine package, identify the medicine's name and provide a brief, one-sentence description of its common use. If you cannot determine the name, return an empty string for the 'name' field. If you cannot determine the use, return an empty string for the 'description' field.",
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "The brand or generic name of the medicine."
            },
            description: {
              type: Type.STRING,
              description: "A brief, one-sentence description of the medicine's common use."
            }
          },
          required: ["name", "description"]
        }
      }
    });
    
    const result = JSON.parse(response.text);

    if (!result.name) {
        throw new Error("AI could not recognize the medicine's name from the image.");
    }

    return result;

  } catch (error) {
    console.error("Error recognizing medicine from image:", error);
    if (error instanceof Error && error.message.includes("AI could not recognize")) {
        throw error;
    }
    throw new Error("Failed to identify medicine from the image. Please enter the details manually.");
  }
};

export const suggestMedicineName = async (name: string): Promise<string> => {
  const trimmedName = name.trim();
  if (trimmedName.length < 3) {
    return "";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Correct any spelling mistakes in the following common medicine name. If it seems correct, return the original text. Only return the corrected name. Input: "${trimmedName}"`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    const suggestion = response.text.trim();
    if (suggestion.toLowerCase() === trimmedName.toLowerCase()) {
        return '';
    }
    return suggestion;
  } catch (error) {
    console.error("Error suggesting medicine name:", error);
    return "";
  }
};


export const translateText = async (text: string, targetLanguageFullName: string): Promise<string> => {
  if (!text.trim()) {
    return "";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the following text to ${targetLanguageFullName}: "${text}"`,
      config: {
        systemInstruction: "You are a translation assistant. Only return the translated text, with no extra formatting, explanations, or quotation marks."
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error(`Error translating text to ${targetLanguageFullName}:`, error);
    return text; // Fallback to original text on error
  }
};