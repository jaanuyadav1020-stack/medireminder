
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
        mimeType: mimeType,
        data: base64Image,
      },
    };

    const textPart = {
      text: "Identify the medicine in this image. Provide its name and a brief, one-sentence description of its common use."
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

    if (!result.name || !result.description) {
        throw new Error("Could not recognize medicine details.");
    }

    return result;

  } catch (error) {
    console.error("Error recognizing medicine:", error);
    throw new Error("Failed to identify medicine from the image. Please enter the details manually.");
  }
};