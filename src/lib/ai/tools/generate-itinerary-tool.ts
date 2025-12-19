import { tool } from "ai";
import { z } from "zod";
import { ItineraryItem } from "@/types/trip";

/**
 * Tool to generate structured day-by-day itinerary from activities
 * This is the final step - organizing activities into a coherent itinerary
 */
export const generateItineraryTool = tool({
  description: `Generate a structured day-by-day itinerary from available activities.
  
  Use this tool to organize selected activities into days with proper timing and sequencing.
  
  Important considerations:
  - Decide number of activities per day based on activity durations (2-4 activities)
  - If activities are long (4+ hours), schedule 2-3 per day
  - If activities are short (1-2 hours), can fit 3-4 per day
  - Assign time slots: Morning (9 AM - 12 PM), Afternoon (12 PM - 5 PM), Evening (5 PM - 9 PM)
  - Consider geographical proximity when sequencing activities
  - Balance activity types (don't put all museums in one day)
  - Create descriptive day titles
  - Ensure NO duplicate activities across days
  `,

  inputSchema: z.object({
    selectedActivityIds: z.array(z.string())
      .describe("Array of activity IDs selected for the itinerary (from the fetched activities)"),

    dayDistribution: z.array(z.object({
      day: z.number().describe("Day number (1, 2, 3, etc.)"),
      title: z.string().describe("Descriptive title for the day (e.g., 'Explore Iconic Landmarks')"),
      activityIds: z.array(z.string()).describe("Activity IDs for this day"),
      timeSlots: z.array(z.enum(['Morning', 'Afternoon', 'Evening']))
        .describe("Time slot for each activity in the same order as activityIds"),
    })).describe("How activities are distributed across days"),

    reasoning: z.string()
      .describe("Brief explanation of why activities were organized this way (geography, timing, variety)"),
  }),

  execute: async ({ selectedActivityIds, dayDistribution, reasoning }) => {
    console.log('📅 Generating itinerary with distribution:', dayDistribution);

    // Validate that all selected activities are in the distribution
    const distributedIds = dayDistribution.flatMap(day => day.activityIds);
    const missingIds = selectedActivityIds.filter(id => !distributedIds.includes(id));

    if (missingIds.length > 0) {
      console.warn('⚠️ Some selected activities are not in distribution:', missingIds);
    }

    // Check for duplicates across days
    const allIds = dayDistribution.flatMap(day => day.activityIds);
    const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);

    if (duplicates.length > 0) {
      return {
        success: false,
        error: `Duplicate activities found across days: ${duplicates.join(', ')}`,
        itinerary: [],
      };
    }

    // Calculate total activities and days
    const totalDays = dayDistribution.length;
    const totalActivities = allIds.length;
    const avgActivitiesPerDay = (totalActivities / totalDays).toFixed(1);

    return {
      success: true,
      dayDistribution,
      reasoning,
      stats: {
        totalDays,
        totalActivities,
        avgActivitiesPerDay,
      },
      summary: `Created ${totalDays}-day itinerary with ${totalActivities} activities (avg ${avgActivitiesPerDay} per day)`,
    };
  },
});
