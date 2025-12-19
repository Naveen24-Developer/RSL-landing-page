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
        dates?: {
            from?: string;
            to?: string;
        };
        travelers?: number;
    };
    generateItinerary?: boolean; // Flag for initial trip generation
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
        You are a travel assistant. Analyze the user's message and extract updated preferences.

        Current Preferences: ${JSON.stringify(currentPreferences)}
        User Message: "${userMessage}"

        Identify:
        - destination (if mentioned)
        - tripType (if mentioned)
        - interests (if mentioned)
        - priceRange:
            {
              "min": number or null,
              "max": number or null
            }
          Only include priceRange if the user explicitly mentions prices (min, max, under, below, between, budget).
        - sort:
            An integer representing sorting order.
            Use:
              - 3  → if the user mentions "low to high", "ascending", "cheapest first", "price increasing".
              - 7  → if the user mentions "high to low", "descending", "expensive first", "price decreasing".
            Only include "sort" if the user explicitly mentions sorting direction.

        Return JSON ONLY:
        {
          "updatedPreferences": {
              "destination"?: string,
              "tripType"?: string,
              "interests"?: string[],
              "priceRange"?: {
                 "min": number | null,
                 "max": number | null
              },
              "sort"?: number
          } or null,
          "intent": "update_preferences" | "general_question"
        }
        `;

        const intentRaw = await callGemini(intentPrompt);
        const intentJson = parseJSON(intentRaw);

        let finalPreferences = currentPreferences;
        let activityCount = 0;
        let activitiesFound: any[] = [];

        // 2. Apply Updates & Fetch Activities (with conversation memory)
        if (intentJson.updatedPreferences) {

            // CONVERSATION MEMORY: Accumulate preferences across chat messages
            finalPreferences = {
                ...currentPreferences,
                ...intentJson.updatedPreferences
            };

            // Clean up priceRange if empty or irrelevant
            if (finalPreferences.priceRange) {
                const { min, max } = finalPreferences.priceRange;

                // If both are null → delete it
                if ((min == null || min === "") && (max == null || max === "")) {
                    delete finalPreferences.priceRange;
                }
            }
            // Clean sort if invalid
            if (finalPreferences.sort !== 3 && finalPreferences.sort !== 7) {
                delete finalPreferences.sort;
            }

            try {
                // Calculate number of days from date range
                let numberOfDays = 3; // Default
                if (finalPreferences.dates?.from && finalPreferences.dates?.to) {
                    const fromDate = new Date(finalPreferences.dates.from);
                    const toDate = new Date(finalPreferences.dates.to);
                    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
                    numberOfDays = daysDiff + 1; // Include both start and end day
                }

                console.log(`📅 Trip duration: ${numberOfDays} days`);

                // Fetch activities: 3 per day × number of days × 2 (to have options for AI)
                const activitiesNeeded = numberOfDays * 3 * 2;

                console.log('🎯 Fetching activities with preferences:', {
                    ...finalPreferences,
                    limit: activitiesNeeded,
                    dates: finalPreferences.dates
                });

                activitiesFound = await activityService.getActivities({
                    ...finalPreferences,
                    limit: activitiesNeeded,
                    dates: finalPreferences.dates // Pass dates for availability filtering
                });
                activityCount = activitiesFound.length;

                console.log(`✅ Fetched ${activityCount} activities for ${numberOfDays} days`);

                if (activityCount === 0) {
                    console.warn('⚠️ No activities found! Check API response.');
                }

                // Use AI to distribute activities across days
                if (activitiesFound.length >= numberOfDays * 3) {
                    const distributionPrompt = `
You are a travel itinerary planner. Distribute activities across ${numberOfDays} days.

RULES:
1. Exactly 3 activities per day
2. NO duplicate activities across days
3. Assign time of day: "Morning", "Afternoon", or "Evening"
4. Create a descriptive title for each day
5. Consider activity types and locations for logical flow

Available Activities (${activitiesFound.length} total):
${JSON.stringify(activitiesFound.slice(0, numberOfDays * 3 * 2).map((a: any, idx: number) => ({
                        index: idx,
                        id: a._id,
                        name: a.name,
                        type: a.type,
                        location: a.cityName,
                        rating: a.rating
                    })))}

Return JSON ONLY:
{
  "days": [
    {
      "day": 1,
      "title": "Descriptive day title (e.g., 'Explore Museum of The Future, Burj Khalifa...')",
      "activities": [
        { "activityIndex": 0, "timeOfDay": "Morning" },
        { "activityIndex": 1, "timeOfDay": "Afternoon" },
        { "activityIndex": 2, "timeOfDay": "Evening" }
      ]
    }
  ]
}
`;

                    const distributionRaw = await callGemini(distributionPrompt);
                    const distribution = parseJSON(distributionRaw);

                    console.log("AI distribution:", JSON.stringify(distribution, null, 2));

                    // Transform to itinerary format with day-wise organization
                    const itinerary = distribution.days.flatMap((day: any) =>
                        day.activities.map((activityRef: any, index: number) => {
                            const activity = activitiesFound[activityRef.activityIndex];
                            if (!activity) {
                                console.warn(`Activity at index ${activityRef.activityIndex} not found`);
                                return null;
                            }
                            return {
                                id: `${day.day}-${index}`,
                                day: day.day,
                                dayTitle: day.title,
                                title: activity.name || activity.title,
                                type: 'activity' as const,
                                timeOfDay: activityRef.timeOfDay,
                                sequence: index + 1,
                                location: {
                                    lat: activity.latitude || activity.location?.lat || 0,
                                    lng: activity.longitude || activity.location?.lng || 0,
                                    address: activity.location?.address || `${activity.cityName}, ${activity.countryName}` || ''
                                },
                                startTime: '09:00',
                                duration: activity.duration,
                                cost: activity?.cost || activity?.price,
                                rating: activity.rating,
                                description: activity.description,
                                image: activity?.image,
                                // Enhanced fields
                                activityId: activity._id,
                                activityType: activity.activityType || activity.type,
                                label: activity.label,
                                reviews: activity.reviews,
                                backgroundImages: activity.backgroundImage,
                                mobileBackgroundImages: activity.mobileBackgroundImage,
                                choices: activity.choices,
                                detailInfo: activity.detailInfo,
                                tags: activity.tags,
                                currency: activity.currency,
                                startingPrice: activity.startingPrice,
                                availability: activity.availability,
                                countryName: activity.countryName,
                                cityName: activity.cityName,
                                isDiscount: activity.isDiscount,
                            };
                        })
                    ).filter(Boolean); // Remove null entries

                    // 4. Generate Response
                    const responsePrompt = `
        You are a helpful travel assistant.
        
        User said: "${userMessage}"
        Intent: ${intentJson.intent}
        Trip Duration: ${numberOfDays} days
        Activities Distributed: ${itinerary.length} activities across ${numberOfDays} days
        
        Give a natural, friendly text response about the itinerary you've created. Mention the number of days and that you've organized activities day by day. No JSON.
        `;

                    const finalMessage = await callGemini(responsePrompt);

                    return {
                        message: finalMessage,
                        updatedPreferences: finalPreferences,
                        itinerary: itinerary
                    };
                } else {
                    // Not enough activities, fall back to simple list
                    const itinerary = activitiesFound.map((activity: any, index: number) => ({
                        id: activity._id || activity.id || `activity-${index}`,
                        day: Math.floor(index / 3) + 1,
                        dayTitle: `Day ${Math.floor(index / 3) + 1}`,
                        title: activity.name || activity.title,
                        type: 'activity' as const,
                        timeOfDay: index % 3 === 0 ? 'Morning' : index % 3 === 1 ? 'Afternoon' : 'Evening',
                        sequence: (index % 3) + 1,
                        location: {
                            lat: activity.latitude || activity.location?.lat || 0,
                            lng: activity.longitude || activity.location?.lng || 0,
                            address: activity.location?.address || `${activity.cityName}, ${activity.countryName}` || ''
                        },
                        startTime: '09:00',
                        duration: activity.duration,
                        cost: activity?.cost || activity?.price,
                        rating: activity.rating,
                        description: activity.description,
                        image: activity?.image,
                        // Enhanced fields
                        activityId: activity._id,
                        activityType: activity.activityType || activity.type,
                        label: activity.label,
                        reviews: activity.reviews,
                        backgroundImages: activity.backgroundImage,
                        mobileBackgroundImages: activity.mobileBackgroundImage,
                        choices: activity.choices,
                        detailInfo: activity.detailInfo,
                        tags: activity.tags,
                        currency: activity.currency,
                        startingPrice: activity.startingPrice,
                        availability: activity.availability,
                        countryName: activity.countryName,
                        cityName: activity.cityName,
                        isDiscount: activity.isDiscount,
                    }));

                    const responsePrompt = `
        You are a helpful travel assistant.
        
        User said: "${userMessage}"
        Activities Found: ${activityCount}
        
        Give a natural, friendly text response. No JSON.
        `;

                    const finalMessage = await callGemini(responsePrompt);

                    return {
                        message: finalMessage,
                        updatedPreferences: finalPreferences,
                        itinerary: itinerary
                    };
                }
            } catch (e) {
                console.error("Activity fetch error:", e);
            }
        }

        // Fallback if no activities
        const responsePrompt = `
        You are a helpful travel assistant.
        
        User said: "${userMessage}"
        
        Give a natural, friendly text response. No JSON.
        `;

        const finalMessage = await callGemini(responsePrompt);

        return {
            message: finalMessage,
            updatedPreferences: finalPreferences || null,
            itinerary: []
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
    console.log('\n🔵 ===== CHAT API CALLED ===== 🔵');
    try {
        const body: ChatRequest = await request.json();
        console.log('📦 Request body received:', JSON.stringify(body, null, 2));

        const lastUserMessage = body.messages.filter(m => m.role === 'user').pop();

        if (!lastUserMessage) {
            console.error('❌ No user message found in request');
            return NextResponse.json({ error: "Missing user message" }, { status: 400 });
        }

        console.log('💬 Last user message:', lastUserMessage.content);
        console.log('🎯 Generate itinerary flag:', body.generateItinerary);
        console.log('⚙️ Preferences:', body.preferences);

        // Check if this is an initial trip generation request
        if (body.generateItinerary && body.preferences) {
            console.log('🚀 Initial trip generation request detected');
            console.log('📍 Destination:', body.preferences.destination);
            console.log('📅 Dates:', body.preferences.dates);

            // Use AI to analyze preferences, fetch activities, and return itinerary
            const aiResult = await generateAgenticResponse(lastUserMessage.content, body.preferences);

            console.log('✅ AI Result received:', {
                hasMessage: !!aiResult.message,
                hasPreferences: !!aiResult.updatedPreferences,
                itineraryLength: aiResult.itinerary?.length || 0
            });

            // Return AI message, updated preferences, and itinerary (all from chat API)
            return NextResponse.json({
                message: aiResult.message,
                updatedPreferences: aiResult.updatedPreferences,
                itinerary: aiResult.itinerary || [],
            });
        }

        console.log('💭 Regular chat interaction (not initial generation)');
        // Regular chat interaction (not initial generation)
        const aiResult = await generateAgenticResponse(lastUserMessage.content, body.preferences);
        return NextResponse.json(aiResult);

    } catch (error) {
        console.error("❌ Chat Route Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    } finally {
        console.log('🔵 ===== CHAT API COMPLETED ===== 🔵\n');
    }
}
