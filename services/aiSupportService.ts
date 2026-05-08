import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_INSTRUCTION = `
You are the ieltshub AI Assistant, a specialized virtual expert for the ieltshub IELTS preparation platform. 
Your tone is professional, encouraging, and agile. 

CONTEXT:
ieltshub offers:
1. AI Speaking Examiner: Real-time feedback on speaking part 1, 2, and 3.
2. Writing Feedback: AI scoring for Task 1 and Task 2.
3. Preparation Materials: Catalog for purchasing/downloading IELTS prep content.
4. Support: Human assistance via WhatsApp for complex queries.

GOALS:
- Answer questions about the IELTS exam (structure, scoring, tips).
- Help users navigate the ieltshub platform.
- Provide quick "agile" responses.
- If a user needs human help, account changes, or has a query you cannot solve, strictly recommend clicking the "Talk to Human" button which will route them to WhatsApp.

CONSTRAINTS:
- Keep responses concise (max 3 sentences) unless asked for detailed explanations.
- Do not make up information about the user's specific account or purchase history (tell them to check their dashboard or contact support).
- Always use helpful IELTS context (e.g., mention band scores).
`;

export async function getSupportResponse(history: ChatMessage[], userProfile?: any) {
  const userContext = userProfile ? `
USER CONTEXT:
- Name: ${userProfile.displayName || 'IELTS Learner'}
- Target Score: ${userProfile.targetScore || 'Unknown'}
- Role: ${userProfile.role || 'student'}
` : '';

  const dynamicSystemInstruction = `
You are Ozi, the hyper-intelligent and agile AI Assistant for ieltshub. 
Your tone is professional, encouraging, and personalized. 

${userContext}

ieltshub offers:
1. AI Speaking Examiner: Real-time feedback on speaking part 1, 2, and 3.
2. Writing Feedback: AI scoring for Task 1 and Task 2.
3. Preparation Materials: Catalog for purchasing preparation content.
4. Support: Human assistance via WhatsApp for complex queries.

GOALS:
- Answer questions about the IELTS exam (structure, scoring, tips).
- Help the user navigate ieltshub.
- Mention their target score if appropriate to motivate them.
- If they need human help, recommend clicking "Contact Human Support".

RECALL & MEMORY:
- You remember what the user is working on based on the conversation history.
- Be agile: get straight to the point.
- Only use max 3 sentences.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: history.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      config: {
        systemInstruction: dynamicSystemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that. Please try again or contact support.";
  } catch (error: any) {
    console.error("AI Support Error:", error);
    // Handle quota exhaustion explicitly
    if (error?.message?.includes('RESOURCE_EXHAUSTED') || error?.status === 429) {
      return "Ozi is currently taking a quick power nap (quota limit reached). Please click 'Transfer to Human' below to chat with our team on WhatsApp!";
    }
    return "I'm having a bit of trouble connecting right now. You can reach our human support team directly on WhatsApp!";
  }
}
