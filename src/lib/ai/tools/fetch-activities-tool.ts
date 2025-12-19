import { tool } from "ai";
import { z } from "zod";
import { activityService } from "@/lib/activityService";

/**
 * Tool to fetch activities from the Limor API based on preferences
 * This is the second step - retrieving available activities
 */
export const fetchActivitiesTool = tool({
  description: `Fetch activities from the Limor API based on user preferences.
  
  Use this tool after analyzing user preferences to retrieve actual activities.
  The API will filter by destination, budget, interests, and availability.
  
  Important:
  - Request 2x the needed activities to give AI selection flexibility
  - For a 3-day trip, request ~18 activities (3 days * 3 activities * 2)
  - Filter by date range for availability
  - Apply interest-based filters
  `,

  inputSchema: z.object({
    destination: z.string().describe("Destination to search activities for"),

    numberOfDays: z.number().describe("Number of days for the trip (used to calculate how many activities to fetch)"),

    startDate: z.string().optional().describe("Start date for availability filtering (YYYY-MM-DD)"),

    endDate: z.string().optional().describe("End date for availability filtering (YYYY-MM-DD)"),

    budget: z.enum(['all', 'low', 'medium', 'high', 'luxury']).optional()
      .describe("Budget level for filtering"),

    priceRange: z.object({
      min: z.number(),
      max: z.number(),
    }).optional().describe("Specific price range for filtering"),

    interests: z.array(z.string()).optional()
      .describe("User interests for activity type filtering"),

    sort: z.enum(['price_low_to_high', 'price_high_to_low', 'rating', 'popularity']).optional()
      .describe("Sort order for activities"),
  }),

  execute: async ({
    destination,
    numberOfDays,
    startDate,
    endDate,
    budget,
    priceRange,
    interests,
    sort
  }) => {
    try {
      // Calculate how many activities to fetch: numberOfDays * 3 activities * 2 (for flexibility)
      const activitiesNeeded = numberOfDays * 3 * 2;

      // Map sort to API format
      const sortValue = sort === 'price_low_to_high' ? 3 : sort === 'price_high_to_low' ? 7 : undefined;

      // Build dates object
      const dates = startDate && endDate ? {
        from: startDate,
        to: endDate,
      } : undefined;

      console.log('🔍 Fetching activities with params:', {
        destination,
        numberOfDays,
        activitiesNeeded,
        budget,
        priceRange,
        interests,
        dates,
      });

      // Fetch activities using the activity service
      const activities = await activityService.getActivities({
        destination,
        budget,
        priceRange,
        interests,
        sort: sortValue,
        limit: activitiesNeeded,
        dates,
      });

      console.log(`✅ Fetched ${activities.length} activities for ${destination}`);

      // If no activities found within budget, try without budget filter
      if (activities.length === 0 && (budget || priceRange)) {
        console.log('⚠️ No activities in budget, trying without budget filter...');

        const alternativeActivities = await activityService.getActivities({
          destination,
          interests,
          sort: sortValue,
          limit: activitiesNeeded,
          dates,
        });

        return {
          success: true,
          activities: alternativeActivities,
          count: alternativeActivities.length,
          warning: 'No activities found within specified budget. Showing alternatives at different price points.',
          budgetAlternatives: true,
        };
      }

      return {
        success: true,
        activities,
        count: activities.length,
        summary: `Found ${activities.length} activities in ${destination}${budget ? ` within ${budget} budget` : ''}`,
      };
    } catch (error: any) {
      console.error('❌ Error fetching activities:', error);
      return {
        success: false,
        activities: [],
        count: 0,
        error: error.message || 'Failed to fetch activities',
      };
    }
  },
});
