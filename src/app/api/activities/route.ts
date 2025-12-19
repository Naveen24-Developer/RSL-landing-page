import { NextResponse } from 'next/server';
import { activityService } from '@/lib/activityService';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const budget = searchParams.get('budget') as 'low' | 'medium' | 'high' | 'luxury' | null;
    const interests = searchParams.get('interests');

    try {
        // Parse interests if provided
        const interestList = interests ? interests.split(',').map(i => i.trim()) : [];

        // Fetch activities from real API
        const activities = await activityService.getActivities({
            destination: location || undefined,
            budget: budget || undefined,
            interests: interestList.length > 0 ? interestList : undefined,
        });

        return NextResponse.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);

        // Return empty array on error
        return NextResponse.json([]);
    }
}
