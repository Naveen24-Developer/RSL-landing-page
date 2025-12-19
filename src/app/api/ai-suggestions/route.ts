import { NextResponse } from 'next/server';
import { activityService } from '@/lib/activityService';
import { aiMatchingService } from '@/lib/aiMatchingService';

interface SuggestionRequest {
    destination?: string;
    budget?: 'low' | 'medium' | 'high' | 'luxury';
    tripType?: string;
    interests?: string[];
    travelers?: number;
}

interface SuggestionItem {
    id: string;
    title: string;
    type: 'activity';
    location: {
        lat: number;
        lng: number;
        address: string;
    };
    duration?: number;
    cost: number;
    rating: number;
    description: string;
    matchScore?: number;
    matchReasons?: string[];
}

interface SuggestionResponse {
    activities: SuggestionItem[];
    totalSuggestions: number;
}

export async function POST(request: Request) {
    try {
        const preferences: SuggestionRequest = await request.json();

        // Fetch activities from real API
        let activities: any[] = [];

        try {
            activities = await activityService.getActivities({
                destination: preferences.destination,
                // budget: preferences.budget,
                // interests: preferences.interests,
            });
        } catch (error) {
            console.error('Error fetching from activity API:', error);
            // Return empty array if API fails
            activities = [];
        }

        // Use AI matching to score and rank activities
        const rankedActivities = aiMatchingService.rankActivities(
            activities,
            preferences
        );

        // Take top suggestions
        const topActivities = rankedActivities.slice(0, 8);

        const response: SuggestionResponse = {
            activities: topActivities,
            totalSuggestions: topActivities.length,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error generating suggestions:', error);
        return NextResponse.json(
            {
                activities: [],
                totalSuggestions: 0,
                error: 'Failed to generate suggestions'
            },
            { status: 500 }
        );
    }
}
