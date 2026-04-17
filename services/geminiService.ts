
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WritingScore } from "../types";

// Initialize Gemini client strictly using process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const evaluateWriting = async (prompt: string, essay: string): Promise<WritingScore> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Evaluate the following IELTS Writing Task 2 essay based on the official descriptors. 
    Prompt: ${prompt}
    Essay: ${essay}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallBand: { type: Type.NUMBER },
          taskResponse: { type: Type.STRING },
          coherenceCohesion: { type: Type.STRING },
          lexicalResource: { type: Type.STRING },
          grammaticalRange: { type: Type.STRING },
          suggestedCorrections: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["overallBand", "taskResponse", "coherenceCohesion", "lexicalResource", "grammaticalRange", "suggestedCorrections"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as WritingScore;
};

export const getLiveSession = (callbacks: any) => {
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: {
      // responseModalities must contain exactly one Modality.AUDIO element
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
      },
      systemInstruction: 'You are an official IELTS Speaking Examiner. Conduct a formal 3-part interview. Part 1: Intro & familiar topics. Part 2: Cue card (give them 1 min to prepare, 2 mins to speak). Part 3: Deep discussion. Be professional, slightly formal, and encourage the candidate to speak at length.',
    },
  });
};

export const encodeAudio = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const decodeAudio = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

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
