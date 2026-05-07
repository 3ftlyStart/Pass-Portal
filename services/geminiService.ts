
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

export const evaluateSpeaking = async (transcript: string): Promise<{ feedback: string; band: number }> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following IELTS Speaking transcript. Provide a concise overall band score (0-9) and a brief paragraph of constructive feedback on fluency, vocabulary, and grammar.
    
    Transcript:
    ${transcript}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          feedback: { type: Type.STRING },
          band: { type: Type.NUMBER }
        },
        required: ["feedback", "band"]
      }
    }
  });

  return JSON.parse(response.text || '{"feedback": "No feedback available.", "band": 0}');
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
      systemInstruction: "You are an official IELTS Speaking Examiner. Your goal is to conduct a professional, formal 3-part interview while providing clear guidance to the candidate throughout the process.\n\n**Structure of the Interview:**\n\n1. **Part 1: Introduction and Familiar Topics (4-5 minutes):**\n   - Begin by asking the candidate's name and then transition to general questions on familiar topics such as their daily routine and hobbies.\n   - Explicitly guide them: 'In this first part, I’d like to ask you some questions about yourself. Let’s talk about your daily routine...'\n\n2. **Part 2: Individual Long Turn (3-4 minutes):**\n   - Explain the format: 'Now, I’m going to give you a topic and I’d like you to talk about it for one to two minutes. Before you talk, you’ll have one minute to think about what you’re going to say.'\n   - Topic: 'Describe a memorable event from your past.'\n   - Manually manage the 1-minute preparation time before inviting them to speak.\n\n3. **Part 3: Two-Way Discussion (4-5 minutes):**\n   - Transition by saying: 'We’ve been talking about a memorable event from your past, and I’d now like to discuss with you one or two more general questions related to this.'\n   - Focus: Compare and contrast their memorable event from Part 2 with a similar event from a different cultural context.\n   - Encourage deeper discussion and abstract thinking about societal trends or cultural significance.\n\n**Examiner Persona:**\n- Be professional, slightly formal, and encouraging.\n- Use natural transition phrases between parts to guide the candidate.\n- Ask follow-up questions to push the candidate to speak at length.",
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
