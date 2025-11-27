import { GoogleGenAI, Type } from "@google/genai";
import { PredictionRequest, GeminiAnalysis } from '../types';

export const getGeminiAnalysis = async (input: PredictionRequest, predictedPrice: number): Promise<GeminiAnalysis> => {
  if (!process.env.API_KEY) {
    console.error("API Key not found");
    return {
      estimatedPriceRange: "N/A",
      marketSentiment: "API Key Missing",
      keyFactors: ["Ensure API_KEY is set in environment variables."]
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are a luxury real estate appraiser. 
    A simple linear regression model has estimated a house price at $${predictedPrice.toLocaleString()} 
    for a property with the following specs:
    - Square Footage: ${input.sqft} sqft
    - Bedrooms: ${input.bedrooms}
    - Bathrooms: ${input.bathrooms}

    Please provide a refined analysis.
    1. A realistic price range considering modern market volatility.
    2. A brief sentiment analysis of the market for this size of home.
    3. Three key factors that would increase this specific property's value.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedPriceRange: { type: Type.STRING, description: "e.g., $450k - $480k" },
            marketSentiment: { type: Type.STRING, description: "1-2 sentences on market demand." },
            keyFactors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 3 factors."
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as GeminiAnalysis;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      estimatedPriceRange: `$${(predictedPrice * 0.95).toFixed(0)} - $${(predictedPrice * 1.05).toFixed(0)}`,
      marketSentiment: "Unable to retrieve real-time market data. Showing standard variance.",
      keyFactors: ["Location", "Condition", "Market Trends"]
    };
  }
};