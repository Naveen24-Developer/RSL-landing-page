import { NextResponse } from 'next/server';
import { ItineraryItem } from '@/types/trip';
import { activityService } from '@/lib/activityService';
import { aiMatchingService } from '@/lib/aiMatchingService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { destination, dates, travelers, budget, tripType, interests, priceRange, sort } = body;

        // Fetch activities from real API
        let activities: any[] = [];

        try {
            activities = await activityService.getActivities({
                destination,
                budget,
                interests,
                priceRange,
                sort,
            });
        } catch (error) {
            console.error('Error fetching activities:', error);
            // Continue with empty array if API fails
        }

        // Use AI matching to rank activities
        const rankedActivities = aiMatchingService.rankActivities(
            activities,
            { destination, budget, tripType, interests, travelers }
        );

        // Calculate trip duration in days
        const fromDate = dates?.from ? new Date(dates.from) : new Date();
        const toDate = dates?.to ? new Date(dates.to) : new Date();
        const tripDays = Math.max(1, Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)));

        // Generate itinerary by distributing activities across days
        const itinerary: ItineraryItem[] = [];
        // Ensure we have enough activities, loop if necessary or just show what we have
        const activitiesPerDay = 3;

        // If we have no activities, we should still return a success with empty itinerary or handle gracefully
        console.log(`Generate Itinerary: Fetched ${activities.length} activities for ${destination}`);

        if (rankedActivities.length === 0) {
            console.log("No activities found from API or all filtered out");
        } else {
            console.log(`Generate Itinerary: Ranked ${rankedActivities.length} activities`);
        }

        rankedActivities.forEach((activity, index) => {
            // Simple distribution logic
            const day = (index % tripDays) + 1;
            const timeSlot = Math.floor(index / tripDays) % 3;

            // Assign time slots: morning (9:00), afternoon (13:00), evening (17:00)
            const startTimes = ['09:00', '13:00', '17:00'];

            itinerary.push({
                id: activity.id,
                title: activity.title,
                type: 'activity',
                location: activity.location,
                startTime: startTimes[timeSlot] || '09:00',
                duration: activity.duration,
                cost: activity.cost,
                rating: activity.rating,
                description: activity.description,
                image: activity.images?.[0], // Add image support
                day,
            });
        });


        return NextResponse.json({
            success: true,
            itinerary,
            message: 'Itinerary generated successfully',
        });
    } catch (error) {
        console.error('Error generating itinerary:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate itinerary' },
            { status: 500 }
        );
    }
}
