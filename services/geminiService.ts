
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WritingScore, SpeakingScore } from "../types";
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

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

export const evaluateSpeaking = async (transcript: string, audioBase64?: string): Promise<{ feedback: string; band: number; scores: SpeakingScore }> => {
  const contents = audioBase64 
    ? [
        {
          inlineData: {
            mimeType: "audio/mp3", // Assuming mp3/wav based on most recording setups
            data: audioBase64
          }
        },
        {
          text: `Analyze the following IELTS Speaking transcript AND the associated audio recording. 
          Provide detailed feedback based on the 4 official IELTS assessment criteria. 
          Pay special attention to pronunciation and intonation in the audio.
          
          Transcript:
          ${transcript}`
        }
      ]
    : `Analyze the following IELTS Speaking transcript. Provide detailed feedback based on the 4 official IELTS assessment criteria. 
    
    Transcript:
    ${transcript}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          feedback: { type: Type.STRING, description: "A brief overall summary of the candidate's performance." },
          band: { type: Type.NUMBER, description: "The estimated overall band score (0-9)." },
          scores: {
            type: Type.OBJECT,
            properties: {
              overallBand: { type: Type.NUMBER },
              fluencyCoherence: { type: Type.STRING, description: "Feedback on fluency and coherence." },
              lexicalResource: { type: Type.STRING, description: "Feedback on vocabulary usage." },
              grammaticalRange: { type: Type.STRING, description: "Feedback on grammar accuracy and range." },
              pronunciation: { type: Type.STRING, description: "Feedback on pronunciation (based on transcript clues)." }
            },
            required: ["overallBand", "fluencyCoherence", "lexicalResource", "grammaticalRange", "pronunciation"]
          }
        },
        required: ["feedback", "band", "scores"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '');
  } catch (e) {
    console.error("Failed to parse AI evaluation:", e);
    const fallback: SpeakingScore = {
      overallBand: 0,
      fluencyCoherence: "Not available.",
      lexicalResource: "Not available.",
      grammaticalRange: "Not available.",
      pronunciation: "Not available."
    };
    return { feedback: "Evaluation failed.", band: 0, scores: fallback };
  }
};

export const getLiveSession = (callbacks: any, systemInstruction?: string) => {
  return ai.live.connect({
    model: 'gemini-3.1-flash-live-preview',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
      },
      systemInstruction: systemInstruction || "You are an official IELTS Speaking Examiner. Your goal is to conduct a professional, formal interview while providing clear guidance to the candidate throughout the process.",
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    },
  });
};

export const pcm16ToFloat32 = (pcmData: Uint8Array): Float32Array => {
  const int16Array = new Int16Array(pcmData.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
};

export const float32ToPcm16 = (float32Array: Float32Array): Uint8Array => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 32768 : s * 32767;
  }
  return new Uint8Array(int16Array.buffer);
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

export const saveSpeakingSession = async (userId: string, sessionData: any) => {
  try {
    const sessionRef = doc(collection(db, `users/${userId}/speakingSessions`));
    await setDoc(sessionRef, {
      ...sessionData,
      id: sessionRef.id,
      date: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving speaking session:", error);
    throw error;
  }
};

export const getSpeakingHistory = async (userId: string) => {
  try {
    const q = query(
      collection(db, `users/${userId}/speakingSessions`),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      date: doc.data().date instanceof Timestamp ? doc.data().date.toDate().toISOString() : doc.data().date
    }));
  } catch (error) {
    console.error("Error fetching speaking history:", error);
    return [];
  }
};
