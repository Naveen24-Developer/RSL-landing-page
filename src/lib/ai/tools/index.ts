/**
 * AI Tools for Trip Planning
 * 
 * These tools work together in sequence:
 * 1. analyzePreferencesTool - Extract user preferences
 * 2. fetchActivitiesTool - Get available activities
 * 3. generateItineraryTool - Organize into day-by-day itinerary
 */

export { analyzePreferencesTool } from './analyze-preferences-tool';
export { fetchActivitiesTool } from './fetch-activities-tool';
export { generateItineraryTool } from './generate-itinerary-tool';

// Export all tools as an object for easy import
import { analyzePreferencesTool } from './analyze-preferences-tool';
import { fetchActivitiesTool } from './fetch-activities-tool';
import { generateItineraryTool } from './generate-itinerary-tool';

export const tripPlanningTools = {
  analyzePreferences: analyzePreferencesTool,
  fetchActivities: fetchActivitiesTool,
  generateItinerary: generateItineraryTool,
};
