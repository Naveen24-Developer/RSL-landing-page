import { tool } from "ai";
import { z } from "zod";
import { TripPreferences } from "@/types/trip";
import { countDaysInclusive } from "lib/utils";

/**
 * Tool to analyze and extract user preferences from natural language
 * This is the first step in the trip planning workflow
 */
export const analyzePreferencesTool = tool({
  description: `Analyze user's travel message and extract structured trip preferences.
  
  Use this tool to understand what the user wants from their trip request.
  Extract destination, dates, budget, interests, and trip type.
  
  Examples:
  - "I want to visit Dubai for 3 days starting Dec 25" → destination: Dubai, dates: calculated
  - "Looking for adventure activities in Bali under $200 per activity" → interests: [Adventure], budget: medium
  - "Family trip to Paris with kids, prefer cultural sites" → tripType: family, interests: [Culture, History]
  `,

  inputSchema: z.object({
    destination: z.string().describe("The destination city or country the user wants to visit"),

    startDate: z.string().optional().describe("Start date in YYYY-MM-DD format if mentioned"),

    endDate: z.string().optional().describe("End date in YYYY-MM-DD format if mentioned"),

    numberOfDays: z.number().optional().describe("Number of days for the trip if mentioned explicitly"),

    budget: z.enum(['all', 'low', 'medium', 'high', 'luxury']).optional()
      .describe("Budget level: low (<$100/activity), medium ($100-200), high ($200-300), luxury (>$300)"),

    priceRange: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional().describe("Specific price range if user mentions exact amounts"),

    tripType: z.enum(['family', 'solo', 'romantic', 'adventure', 'business']).optional()
      .describe("Type of trip based on context"),

    interests: z.array(z.string()).optional()
      .describe("User's interests: Culture, Food, Adventure, Nature, Shopping, Nightlife, History, Art, Beach, Sports"),

    travelers: z.number().optional().describe("Number of travelers if mentioned"),

    userIntent: z.enum(['new_trip', 'modify_existing', 'ask_question', 'refine_preferences'])
      .describe("What the user wants to do: create new trip, modify existing one, ask question, or refine preferences"),
  }),

  execute: async ({
    destination,
    startDate,
    endDate,
    numberOfDays,
    budget,
    priceRange,
    tripType,
    interests,
    travelers,
    userIntent
  }) => {
    // Calculate dates if numberOfDays is provided but dates aren't
    let calculatedStartDate = startDate;
    let calculatedEndDate = endDate;
    let calculatedDays = numberOfDays;

    // Helper to format date as YYYY-MM-DD
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // Helper to parse YYYY-MM-DD to UTC Date
    const parseDate = (dateStr: string) => new Date(dateStr + 'T00:00:00Z');

    // Case 1: startDate & endDate → calculate days
    if (calculatedStartDate && calculatedEndDate) {
      calculatedDays = countDaysInclusive(calculatedStartDate, calculatedEndDate);
    }

    // Case 2: startDate & numberOfDays → calculate endDate
    else if (calculatedStartDate && numberOfDays) {
      const start = parseDate(calculatedStartDate);
      // Add (days - 1) to start date
      start.setUTCDate(start.getUTCDate() + numberOfDays - 1);
      calculatedEndDate = formatDate(start);
      calculatedDays = numberOfDays;
    }

    // Case 3: endDate & numberOfDays → calculate startDate
    else if (calculatedEndDate && numberOfDays) {
      const end = parseDate(calculatedEndDate);
      // Subtract (days - 1) from end date
      end.setUTCDate(end.getUTCDate() - numberOfDays + 1);
      calculatedStartDate = formatDate(end);
      calculatedDays = numberOfDays;
    }

    // Optional validation
    if (!calculatedStartDate || !calculatedEndDate || !calculatedDays) {
      throw new Error('Insufficient date information provided');
    }


    const analyzedPreferences = {
      destination,
      dates: {
        from: calculatedStartDate ? new Date(calculatedStartDate) : undefined,
        to: calculatedEndDate ? new Date(calculatedEndDate) : undefined,
      },
      numberOfDays: calculatedDays || 3,
      budget: budget || 'all',
      priceRange: priceRange,
      tripType: tripType || 'solo',
      interests: interests || [],
      travelers: travelers || 1,
      userIntent,
    };

    return {
      success: true,
      preferences: analyzedPreferences,
      summary: `Analyzed preferences: ${destination} trip for ${calculatedDays || 3} days, ${tripType || 'solo'} travel, interested in ${interests?.join(', ') || 'various activities'}`,
    };
  },
});
