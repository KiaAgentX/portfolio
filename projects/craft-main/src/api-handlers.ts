import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the Gemini client as guided by the gemini-api skill
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment. Please configure it in your Secrets panel.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

function mapType(t: string): Type {
  switch (t.toUpperCase()) {
    case 'NUMBER': return Type.NUMBER;
    case 'INTEGER': return Type.INTEGER;
    case 'BOOLEAN': return Type.BOOLEAN;
    default: return Type.STRING;
  }
}

export async function handleGenerate(reqBody: {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  topP?: number;
}) {
  const { prompt, systemInstruction, temperature, topP } = reqBody;
  if (!prompt) {
    throw new Error("Prompt is required");
  }

  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      systemInstruction: systemInstruction || "You are a helpful and creative AI writing assistant.",
      temperature: temperature !== undefined ? Number(temperature) : 0.7,
      topP: topP !== undefined ? Number(topP) : 0.95,
    },
  });

  return { text: response.text || "" };
}

export async function handleGenerateJson(reqBody: {
  instruction: string;
  schemaFields: Array<{ name: string; type: string; description: string }>;
}) {
  const { instruction, schemaFields } = reqBody;
  if (!instruction || !schemaFields || schemaFields.length === 0) {
    throw new Error("Instruction and at least one schema field are required");
  }

  const ai = getGeminiClient();

  // Dynamically map fields to Type
  const properties: Record<string, { type: Type; description?: string }> = {};
  const requiredFields: string[] = [];

  for (const field of schemaFields) {
    const fieldName = field.name.trim().replace(/\s+/g, "_");
    if (!fieldName) continue;
    properties[fieldName] = {
      type: mapType(field.type),
      description: field.description || undefined,
    };
    requiredFields.push(fieldName);
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: instruction,
    config: {
      temperature: 0.2, // Low temperature for high conformity to structured schemas
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        description: "A list of records matching the requested schema fields",
        items: {
          type: Type.OBJECT,
          properties,
          required: requiredFields,
        },
      },
    },
  });

  const rawText = response.text || "[]";
  try {
    return JSON.parse(rawText.trim());
  } catch (err) {
    return { error: "Failed to parse generated JSON response", rawText };
  }
}
