
import { GoogleGenAI, Type, Modality, GenerateContentResponse, LiveServerMessage } from "@google/genai";
import { ProspectGenerationResult, ContactEnrichment, CompanyEnrichment, PitchScript } from '../types';

// Helper for Audio Work
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function encodeAudio(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const prospectSchema = {
    type: Type.OBJECT,
    properties: {
        contacts: {
            type: Type.ARRAY,
            description: "List of generated contacts.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    email: { type: Type.STRING },
                    title: { type: Type.STRING },
                    companyName: { type: Type.STRING },
                    location: { type: Type.STRING },
                    linkedinUrl: { type: Type.STRING },
                    status: { type: Type.STRING },
                    leadScore: { type: Type.INTEGER }
                },
                 required: ["id", "name", "email", "title", "companyName", "location", "linkedinUrl", "status", "leadScore"],
            },
        },
        companies: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    industry: { type: Type.STRING },
                    size: { type: Type.STRING },
                    location: { type: Type.STRING },
                    website: { type: Type.STRING },
                    description: { type: Type.STRING },
                },
                 required: ["id", "name", "industry", "size", "location", "website", "description"],
            },
        },
    },
    required: ["contacts", "companies"],
};

// Use 'gemini-3-flash-preview' for basic text tasks
export const findProspects = async (title: string, industry: string, location: string, searchType: 'PEOPLE' | 'COMPANIES' = 'PEOPLE'): Promise<ProspectGenerationResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    let prompt = "";
    if (searchType === 'PEOPLE') {
      prompt = `Generate 15 realistic B2B contacts and their corresponding companies. 
      Focus on individuals with the Job Title: ${title}, in the Industry: ${industry}, based in Location: ${location}. 
      For each contact, assign a realistic 'leadScore' between 0-100 based on their seniority and industry relevance.`;
    } else {
      prompt = `Generate 15 realistic B2B companies (businesses) in the Industry: ${industry}, based in Location: ${location}. 
      Keywords/Focus: ${title}. 
      For each company, also provide 1 primary contact person.`;
    }

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: prospectSchema },
    });
    return JSON.parse(response.text) as ProspectGenerationResult;
};

// Use 'gemini-3-flash-preview' for basic text tasks
export const enrichProspect = async (contactName: string, companyName: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const prompt = `Enrich prospect ${contactName} at ${companyName} with simulated LinkedIn activity and company news.`;
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" },
    });
    return JSON.parse(response.text);
};

// Use 'gemini-3-flash-preview' for basic text tasks
export const enrichCompany = async (companyName: string, companyIndustry: string): Promise<CompanyEnrichment> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide funding, tech stack, and news for ${companyName} in ${companyIndustry}.`,
        config: { responseMimeType: "application/json" },
    });
    return JSON.parse(response.text);
};

// Image generation with Imagen models returns base64 bytes directly in imageBytes
export const generateCompanyLogo = async (companyName: string, companyIndustry: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `Minimalist vector logo for ${companyName} (${companyIndustry}). White background.`,
        config: { numberOfImages: 1, outputMimeType: 'image/png' },
    });
    return response.generatedImages[0].image.imageBytes;
};

// Improved subtask generation with schema
export const generateSubtasks = async (taskTitle: string, description: string): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Break down the following sales-related task into 4-7 logical, actionable subtasks.
        Task Title: ${taskTitle}
        Context: ${description}`,
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    subtasks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING }
                            },
                            required: ["title"]
                        }
                    }
                },
                required: ["subtasks"]
            }
        },
    });
    const data = JSON.parse(response.text);
    return data.subtasks.map((s: any) => s.title);
};

/**
 * Provide AI-driven analysis of a contact's lead score.
 */
export const analyzeLeadScore = async (contact: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const prompt = `Analyze why this B2B lead has a score of ${contact.leadScore}/100. 
  Name: ${contact.name}
  Title: ${contact.title}
  Company: ${contact.companyName}
  Status: ${contact.status}
  Provide a concise 2-3 sentence strategic analysis of their potential.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  return response.text || '';
};

/**
 * Generate a personalized pitch script.
 */
export const generatePitchScript = async (contact: any, company: any): Promise<PitchScript> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const prompt = `Create a high-converting 30-second personalized video script for:
  Prospect: ${contact.name} (${contact.title})
  Company: ${contact.companyName} (${company?.description || 'Technology'})
  Recent Signal: ${contact.enrichment?.recentPost || 'General Industry Growth'}
  Tone: Professional, direct, and outcome-focused.
  Include: 1. A punchy hook, 2. A specific value prop, 3. A clear CTA.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                hook: { type: Type.STRING },
                valueProp: { type: Type.STRING },
                callToAction: { type: Type.STRING },
                fullText: { type: Type.STRING }
            },
            required: ['hook', 'valueProp', 'callToAction', 'fullText']
        }
    }
  });
  return JSON.parse(response.text) as PitchScript;
};

/**
 * Generate a video using Veo API.
 */
export const generateOutreachVideo = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");
  
  const videoResp = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await videoResp.blob();
  return URL.createObjectURL(blob);
};

/**
 * Scout territory using Google Maps grounding.
 */
export const scoutTerritory = async (query: string, lat?: number, lng?: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Identify high-potential B2B businesses in this area: ${query}. Focus on companies that might need sales enablement or CRM software. Provide a tactical summary of the territory's potential.`,
    config: {
      tools: [{ googleMaps: {} }, { googleSearch: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: lat && lng ? { latitude: lat, longitude: lng } : undefined
        }
      }
    }
  });
  return {
    text: response.text || '',
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

// --- NEW KNOWLEDGE BASE & ASSISTANT FEATURES ---

/**
 * Perform a search with Google Search Grounding for current information.
 */
export const searchWithGrounding = async (query: string): Promise<{ text: string, links: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return {
    text: response.text || '',
    links: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

/**
 * Complex reasoning/strategy using Thinking Mode.
 */
export const analyzeWithThinking = async (context: string, query: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Context: ${context}\n\nQuery: ${query}`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  return response.text || '';
};

/**
 * Text-to-Speech using Flash Preview TTS.
 */
export const textToSpeech = async (text: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } }
      }
    }
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
};

/**
 * Create a chat session with Gemini 3 Pro.
 */
export const createChat = (instruction: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: { systemInstruction: instruction }
  });
};

/**
 * Connect to Live API for real-time voice.
 */
export const connectLive = (callbacks: {
  onopen: () => void;
  onmessage: (m: LiveServerMessage) => void;
  onerror: (e: any) => void;
  onclose: (e: any) => void;
}) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
      },
      systemInstruction: 'You are an elite sales performance coach named Puck. Keep responses concise and focused on high-stakes negotiation strategy.'
    }
  });
};
