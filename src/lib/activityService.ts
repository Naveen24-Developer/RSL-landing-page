// Activity API Service - Integrates with Limor API
// https://api.limor.us/passenger_ls/v1/activity/listActivities

import { ActivityAPIResponse, ActivityAPIResponseItem } from '@/types/trip';
import { durationToMinutes } from './activityUtils';

export interface ActivityFilter {
    title: string;
    type: number;
    filters: {
        name: string;
        type: boolean;
    }[];
}

export interface ActivityAPIRequest {
    destination: string;
    priceRange: {
        min: number;
        max: number;
    };
    sort: number;
    filter?: ActivityFilter[];
    activityId?: string;
    limit?: number;
    page?: number;
    startDateFilter?: string; // Format: "YYYY-MM-DD"
    endDateFilter?: string;   // Format: "YYYY-MM-DD"
}

// Map user interests to activity types
const INTEREST_TO_ACTIVITY_TYPE: Record<string, string[]> = {
    'Culture': ['Museum', 'Cultural Tour', 'Historical Site'],
    'Food': ['Food Tour', 'Cooking Class', 'Wine Tasting'],
    'Adventure': ['Safari', 'Hiking', 'Water Sports', 'Extreme Sports', 'Water Adventure', 'Sky Adventure'],
    'Nature': ['Safari', 'Wildlife', 'Hiking', 'National Park'],
    'Shopping': ['Shopping Tour', 'Market Visit'],
    'Nightlife': ['Night Tour', 'Bar Crawl', 'Entertainment'],
    'History': ['Historical Site', 'Museum', 'Heritage Tour'],
    'Art': ['Art Gallery', 'Museum', 'Art Tour'],
    'Beach': ['Beach Activity', 'Water Sports', 'Coastal Tour', 'Water Adventure'],
    'Sports': ['Sports Activity', 'Adventure Sports', 'Water Sports'],
};

export class ActivityService {
    private apiUrl = 'https://api.limor.us/passenger_ls/v1/activity/listActivities';
    private authToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJSU0wiLCJzdWIiOiJndWVzdF91c2VyIiwicm9sZSI6Imd1ZXN0Iiwicm9sZVR5cGUiOiJHIiwidXNlck5hbWUiOiJHdWVzdCIsInJvbGVOYW1lIjoiR3Vlc3QiLCJzZWNyZXRLZXkiOiIwMDAzZWM3YzJhMTFlOGVjMjBkNjIyYjgzZjk1ODMxYSIsImlhdCI6MTc2NDkyMjg0OSwiZXhwIjo0OTIwNjgyODQ5fQ.EtaRegRDvxHyKCjm-veb0eG5nj9HSCWcqFkWSchC7vk';

    /**
     * Transform user preferences into API request format
     */
    buildAPIRequest(preferences: {
        destination?: string;
        budget?: string;
        interests?: string[];
        priceRange?: { min: number; max: number };
        sort?: number;
        limit?: number;
        page?: number;
        dates?: {
            from?: string | Date;
            to?: string | Date;
        };
    }): ActivityAPIRequest {
        // Build filters from interests
        const filters: ActivityFilter[] = [];

        if (preferences.interests && preferences.interests.length > 0) {
            const activityTypes = new Set<string>();

            // Map interests to activity types
            preferences.interests.forEach(interest => {
                const types = INTEREST_TO_ACTIVITY_TYPE[interest] || [];
                types.forEach(type => activityTypes.add(type));
            });

            // Create filter structure
            if (activityTypes.size > 0) {
                filters.push({
                    title: 'Activity Type',
                    type: 0,
                    filters: Array.from(activityTypes).map(name => ({
                        name,
                        type: true,
                    })),
                });
            }
        }

        const budgetRanges: Record<string, { min: number; max: number }> = {
            all: { min: 0, max: 0 },
            low: { min: 0, max: 100 },
            medium: { min: 0, max: 200 },
            high: { min: 0, max: 300 },
            luxury: { min: 0, max: 5000 },
        };

        // Use custom price range if provided, otherwise fallback to budget category
        const range = preferences.priceRange || budgetRanges[preferences.budget?.toLowerCase() || 'all'] || budgetRanges['all'];

        // Format dates if provided
        let startDateFilter: string | undefined;
        let endDateFilter: string | undefined;

        if (preferences.dates?.from) {
            const fromDate = typeof preferences.dates.from === 'string'
                ? new Date(preferences.dates.from)
                : preferences.dates.from;
            startDateFilter = fromDate.toISOString().split('T')[0];
        }

        if (preferences.dates?.to) {
            const toDate = typeof preferences.dates.to === 'string'
                ? new Date(preferences.dates.to)
                : preferences.dates.to;
            endDateFilter = toDate.toISOString().split('T')[0];
        }

        const request: ActivityAPIRequest = {
            destination: preferences.destination || 'All',
            priceRange: range,
            sort: preferences.sort || 0,
        };

        // Only add optional fields if they have values
        if (filters.length > 0) {
            request.filter = filters;
        }
        if (preferences.limit) {
            request.limit = preferences.limit;
        }
        if (preferences.page) {
            request.page = preferences.page;
        }
        if (startDateFilter) {
            request.startDateFilter = startDateFilter;
        }
        if (endDateFilter) {
            request.endDateFilter = endDateFilter;
        }

        return request;
    }

    /**
     * Fetch activities from the API
     */
    async fetchActivities(request: ActivityAPIRequest): Promise<ActivityAPIResponseItem[]> {
        try {
            const reqBody: any = {
                destination: request.destination ?? null,
                priceRange: request.priceRange ?? null,
                sort: request.sort ?? 0
            };

            // Add optional parameters
            if (request.limit) reqBody.limit = request.limit;
            if (request.page) reqBody.page = request.page;
            if (request.startDateFilter) reqBody.startDateFilter = request.startDateFilter;
            if (request.endDateFilter) reqBody.endDateFilter = request.endDateFilter;
            if (request.filter) reqBody.filter = request.filter;
            if (request.activityId) reqBody.activityId = request.activityId;

            console.log("Fetching activities with request:", JSON.stringify(reqBody, null, 2));

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.authToken
                },
                body: JSON.stringify(reqBody)
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data: ActivityAPIResponse = await response.json();

            if (data.status === 1 && Array.isArray(data.responseData)) {
                console.log(`Successfully fetched ${data.responseData.length} activities`);
                return data.responseData;
            }

            return [];
        } catch (error) {
            console.error('Error fetching activities:', error);
            // Return empty array instead of throwing to prevent app crash
            return [];
        }
    }

    /**
     * Transform API response to application format (preserving all data)
     */
    transformActivities(activities: ActivityAPIResponseItem[]): any[] {
        return activities.map(activity => ({
            // Original API fields preserved
            _id: activity._id,
            name: activity.name,
            description: activity.description || '',
            image: activity.image,
            backgroundImage: activity.backgroundImage,
            mobileBackgroundImage: activity.mobileBackgroundImage,

            // Location data
            location: {
                lat: activity.latitude || 0,
                lng: activity.longitude || 0,
                address: `${activity.cityName || ''}, ${activity.countryName || ''}`.trim(),
            },
            latitude: activity.latitude,
            longitude: activity.longitude,
            cityName: activity.cityName,
            countryName: activity.countryName,

            // Pricing and availability
            cost: activity.price || activity.startingPrice || 0,
            price: activity.price,
            startingPrice: activity.startingPrice,
            currency: activity.currency || 'AED',
            isDiscount: activity.isDiscount,

            // Rating and reviews
            rating: activity.rating || 0,
            reviews: activity.reviews || 0,
            label: activity.label,

            // Activity details
            type: activity.type || 'Activity',
            activityType: activity.type,
            status: activity.status,

            // Time and availability
            duration: activity.choice?.[0]?.showOffTime
                ? durationToMinutes(activity.choice[0].showOffTime)
                : 120,
            startDate: activity.startDate,
            endDate: activity.endDate,
            availability: activity.availability,
            isAvailable: activity.isAvailable,

            // Enhanced data
            choices: activity.choice || [],
            detailInfo: activity.detailInfo || [],
            tags: activity.tags || [],

            // Metadata
            countryCode: activity.countryCode,
            vat: activity.vat,
            isShow: activity.isShow,
            favourites: activity.favourites,
            createdDate: activity.createdDate,
        }));
    }

    /**
     * Get activities with user preferences
     */
    async getActivities(preferences: {
        destination?: string;
        budget?: string;
        interests?: string[];
        priceRange?: { min: number; max: number };
        sort?: number;
        limit?: number;
        page?: number;
        dates?: {
            from?: string | Date;
            to?: string | Date;
        };
    }): Promise<any[]> {
        const request = this.buildAPIRequest(preferences);
        const activities = await this.fetchActivities(request);
        return this.transformActivities(activities);
    }

    /**
     * Get single activity details by ID
     */
    async getActivityDetails(activityId: string): Promise<any | null> {
        try {
            const request: ActivityAPIRequest = {
                destination: 'All',
                priceRange: { min: 0, max: 0 },
                sort: 0,
                activityId: activityId
            };

            const activities = await this.fetchActivities(request);

            if (activities.length > 0) {
                return this.transformActivities(activities)[0];
            }

            return null;
        } catch (error) {
            console.error('Error fetching activity details:', error);
            return null;
        }
    }
}

// Export singleton instance
export const activityService = new ActivityService();

