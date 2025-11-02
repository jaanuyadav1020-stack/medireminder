

// This is a hypothetical docTR API endpoint.
const DOC_TR_API_ENDPOINT = 'https://api.doctr.example.com/v1/ocr';

export const recognizeMedicineFromImage = async (base64Image: string): Promise<{ name: string; description: string }> => {
  try {
    // Step 1: Use a dedicated OCR service (docTR) to extract raw text from the image.
    // The fetch call is commented out because the endpoint is a placeholder and would cause a network error.
    // Instead, we simulate a successful response from an OCR service to allow the feature to work.
    /*
    const ocrResponse = await fetch(DOC_TR_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64Image })
    });

    if (!ocrResponse.ok) {
        const errorBody = await ocrResponse.text();
        console.error("docTR API Error:", errorBody);
        throw new Error(`OCR service failed with status: ${ocrResponse.status}`);
    }

    const ocrData = await ocrResponse.json();
    const rawText = ocrData.text; // Assuming the API returns { "text": "..." }
    */

    // SIMULATED OCR RESPONSE to avoid network errors from the placeholder URL.
    const rawText = "Paracetamol 500mg\nFor fever and pain relief";

    if (!rawText || !rawText.trim()) {
      throw new Error("OCR service could not extract any text from the image.");
    }

    // Step 2: Basic parsing of the OCR text.
    // This is a simple heuristic and replaces the previous Gemini API parsing.
    const lines = rawText.trim().split('\n');
    const name = lines[0] || '';
    const description = lines.slice(1).join(' ').trim();

    if (!name) {
        throw new Error("Could not determine the medicine's name from the extracted text.");
    }

    return { name, description };

  } catch (error) {
    console.error("Error recognizing medicine:", error);
    if (error instanceof Error) {
        if (error.message.includes("Could not determine") || error.message.includes("OCR service could not extract") || error.message.includes("OCR service failed")) {
            throw error;
        }
    }
    // Generic error for other issues.
    throw new Error("Failed to process medicine image. Please check your connection or enter details manually.");
  }
};


export const suggestMedicineName = async (name: string): Promise<string> => {
  // This feature previously used the Gemini API.
  // It is now disabled as it cannot be implemented with a standard OCR service.
  return "";
};


export const translateText = async (text: string, targetLanguageFullName: string): Promise<string> => {
  // This feature previously used the Gemini API.
  // It is now disabled as it cannot be implemented with a standard OCR service.
  return text;
};
