import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Role: You are the "Yearly Herald," the supreme strategic lead of the Slayer Corps' Intelligence Division. Your goal is to provide a "Tactical Path to Victory" for every mission (task/meeting) identified in the input.

Current Reference Time: {{CURRENT_TIME}}

The Visual Identity & Logic:
1. The Nichiran (Daily Mission Guide): Tanjiro Style. Provide a "Breathing Form" execution guide for every task:
   - Step-by-Step Logic: 3-4 specific actions to complete the task.
   - Performance Tip: Technical/Practical advice for "best work" (e.g., specific libraries, citation styles, or communication strategies).

2. The Cross-Dispatch (Immediate Payload): Nezuko Style. 
   - Propose context-aware drafts immediately.
   - List all Allies (Email IDs) involved.
   - Communication Recommendation: Provide a specific "Strategic Intent" for the email (e.g., "Strike a tone of urgent cooperation to ensure the Water Pipeline deployment is not delayed by bureaucratic friction").
   - Tone: Professional, protective of the party, and clear.
   - MANDATORY: Include a signature identifying the "Yearly Herald - Strategic Intelligence Division".

3. Task Dispatch (Deep Logistics): Zenitsu Style.
   - Provide a "Task Dispatch Workflow": A detailed, exhaustive step-by-step guide on EXACTLY how to accomplish the task (e.g., specific software steps, logic implementation, or research directions).
   - Provide "Recommended Sources": Real-world URLs, documentation links, or specialized references that would help (e.g., MDN, React Docs, IEEE standards).

4. Tactical Map (Proactive Briefing): Inosuke Style.
   - Wild, energetic, but strategic.
   - Reminders for the next 24 hours are "Action Briefs".

5. Active Operation (Current Focus): Muzan Style.
   - Absolute precision and high priority.

Constraint:
You MUST provide a structured JSON response matching the schema. Reference specific artifacts and details found in the input.
`;

export interface QuestEvent {
  questName: string;
  timeToImpact: string; 
  allyIntel: string[]; // Emails
  communicationRecommendation: string;
  draftType: 'Water Style (Formal)' | 'Flame Style (Urgent)' | 'Thunder Style (Short)';
  subject?: string;
  theDraft: string;
  tacticalGuide: string[]; // 3-5 logical steps
  taskDispatchWorkflow: string; // Detailed workflow guide
  recommendedSources: string[]; // List of help sources/URLs
  optimizationStrategy: string[]; // 1-2 best performance tips
  payloadDetails: string; // Specific details extracted from input/file
  commandRecommendation: string; // Strategic advice
  missingGear?: string[]; // List of missing artifacts
  hasConflict?: boolean;
}

export interface WorkflowOutput {
  events: QuestEvent[];
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    events: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questName: { type: Type.STRING },
          timeToImpact: { type: Type.STRING },
          allyIntel: { type: Type.ARRAY, items: { type: Type.STRING } },
          communicationRecommendation: { type: Type.STRING },
          draftType: { type: Type.STRING, enum: ['Water Style (Formal)', 'Flame Style (Urgent)', 'Thunder Style (Short)'] },
          subject: { type: Type.STRING },
          theDraft: { type: Type.STRING },
          tacticalGuide: { type: Type.ARRAY, items: { type: Type.STRING } },
          taskDispatchWorkflow: { type: Type.STRING },
          recommendedSources: { type: Type.ARRAY, items: { type: Type.STRING } },
          optimizationStrategy: { type: Type.ARRAY, items: { type: Type.STRING } },
          payloadDetails: { type: Type.STRING },
          commandRecommendation: { type: Type.STRING },
          missingGear: { type: Type.ARRAY, items: { type: Type.STRING } },
          hasConflict: { type: Type.BOOLEAN }
        },
        required: ['questName', 'timeToImpact', 'allyIntel', 'communicationRecommendation', 'draftType', 'theDraft', 'tacticalGuide', 'taskDispatchWorkflow', 'recommendedSources', 'optimizationStrategy', 'payloadDetails', 'commandRecommendation']
      }
    }
  },
  required: ['events']
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeSchedule(schedule: string, files?: { data: string; mimeType: string }[]): Promise<WorkflowOutput> {
  const currentTime = new Date().toLocaleString();
  const parts: any[] = [{ text: schedule || "Analyze this schedule and generate local tactical intel." }];
  
  if (files && files.length > 0) {
    files.forEach(file => {
      parts.push({
        inlineData: {
          data: file.data.split(',')[1] || file.data, // Remove data:mime;base64, prefix if present
          mimeType: file.mimeType
        }
      });
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION.replace('{{CURRENT_TIME}}', currentTime),
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  return JSON.parse(response.text || '{"events": []}');
}
