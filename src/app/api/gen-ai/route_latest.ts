import { NextResponse } from 'next/server';
import { activityService } from '@/lib/activityService';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatRequest {
    messages: ChatMessage[];
    preferences?: {
        destination?: string;
        budget?: string;
        tripType?: string;
        interests?: string[];
    };
}

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// -------------------------
// GEMINI CALL WRAPPER
// -------------------------
async function callGemini(prompt: string, modelName = "gemini-2.0-flash-lite") {
    if (!genAI) throw new Error("NO_GEMINI_KEY");

    try {
        const model = genAI.getGenerativeModel({
            model: modelName   // this is correct
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        if (!text) throw new Error("EMPTY_RESPONSE");
        return text;
    } catch (err: any) {
        console.error(`[Gemini Error - ${modelName}]:`, err?.message || err);
        throw err;
    }
}

// Safe JSON parser
function parseJSON(raw: string) {
    try {
        return JSON.parse(
            raw.replace(/```json/g, "").replace(/```/g, "").trim()
        );
    } catch (e) {
        console.warn("Failed to parse Gemini JSON. Raw:", raw);
        return { updatedPreferences: null, intent: "general_question" };
    }
}

// -------------------------
// MAIN AI LOGIC
// -------------------------
async function generateAgenticResponse(userMessage: string, currentPreferences: any) {
    if (!genAI) {
        return {
            message: "AI service is not configured. Please check your API key."
        };
    }

    try {
        // 1. Intent Analysis
        const intentPrompt = `
        You are a travel assistant. Analyze user preferences and extract updated fields.
        Current Preferences: ${JSON.stringify(currentPreferences)}
        User Message: "${userMessage}"
        
        Return JSON ONLY:
        {
            "updatedPreferences": { ... } or null,
            "intent": "update_preferences" | "general_question"
        }
        `;

        const intentRaw = await callGemini(intentPrompt);
        const intentJson = parseJSON(intentRaw);

        let finalPreferences = currentPreferences;
        let activityCount = 0;
        let activitiesFound: any[] = [];

        // 2. Apply Updates & Fetch Activities
        if (intentJson.updatedPreferences) {
            finalPreferences = {
                priceRange: {
                    min: 0,
                    max: 100
                }, ...currentPreferences, ...intentJson.updatedPreferences
            };

            try {
                activitiesFound = await activityService.getActivities(finalPreferences);
                activityCount = activitiesFound.length;
            } catch (e) {
                console.error("Activity fetch error:", e);
            }
        }

        // 3. Generate Response
        const responsePrompt = `
        You are a helpful travel assistant.
        
        User said: "${userMessage}"
        Intent: ${intentJson.intent}
        Updated Preferences: ${JSON.stringify(intentJson.updatedPreferences)}
        Activities Found: ${activityCount}
        Top 3 Activities: ${JSON.stringify(activitiesFound.slice(0, 3).map((a: any) => a.title))}
        
        Give a natural, friendly text response. No JSON.
        `;

        const finalMessage = await callGemini(responsePrompt);

        return {
            message: finalMessage,
            updatedPreferences: intentJson.updatedPreferences || null,
            priceRange: {
                min: 0,
                max: 100
            }
        };

    } catch (err: any) {
        console.error("Agentic Flow Error:", err);

        if (err.message?.includes("429") || err.message?.includes("Quota")) {
            return {
                message: "I'm experiencing high traffic right now 🧠💥 Please try again in a moment!"
            };
        }

        return {
            message: "I encountered an error processing your request. Please try again."
        };
    }
}

// -------------------------
// NEXT.JS API ROUTE
// -------------------------
export async function POST(request: Request) {
    try {
        const body: ChatRequest = await request.json();
        const lastUserMessage = body.messages.filter(m => m.role === 'user').pop();

        if (!lastUserMessage) {
            return NextResponse.json({ error: "Missing user message" }, { status: 400 });
        }

        const aiResult = await generateAgenticResponse(lastUserMessage.content, body.preferences);
        return NextResponse.json(aiResult);

    } catch (error) {
        console.error("Chat Route Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
