// Utility functions for processing activity data

import { ActivityChoice, ActivityAPIResponseItem, TimeSlot } from '@/types/trip';

/**
 * Get the lowest price across all activity choices
 */
export function getLowestPrice(choices: ActivityChoice[]): number {
    if (!choices || choices.length === 0) return 0;

    const allPrices: number[] = [];

    choices.forEach(choice => {
        allPrices.push(choice.adultPrice, choice.childPrice, choice.seniorPrice);
    });

    return Math.min(...allPrices.filter(p => p > 0));
}

/**
 * Get the highest price across all activity choices
 */
export function getHighestPrice(choices: ActivityChoice[]): number {
    if (!choices || choices.length === 0) return 0;

    const allPrices: number[] = [];

    choices.forEach(choice => {
        allPrices.push(choice.adultPrice, choice.childPrice, choice.seniorPrice);
    });

    return Math.max(...allPrices);
}

/**
 * Format price range display string
 */
export function formatPriceRange(choices: ActivityChoice[], currency: string = 'AED'): string {
    if (!choices || choices.length === 0) return 'Price not available';

    const lowest = getLowestPrice(choices);
    const highest = getHighestPrice(choices);

    if (lowest === highest) {
        return `${currency} ${lowest}`;
    }

    return `${currency} ${lowest} - ${highest}`;
}

/**
 * Check if activity is available on a specific date
 */
export function isAvailableOnDate(timeSlots: TimeSlot[], date: Date): boolean {
    if (!timeSlots || timeSlots.length === 0) return false;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[date.getDay()];

    const daySlot = timeSlots.find(slot => slot.day === dayName);
    return daySlot ? daySlot.slots.length > 0 : false;
}

/**
 * Get available time slots for a specific day of week
 */
export function getAvailableTimeSlots(timeSlots: TimeSlot[], dayOfWeek: string): string[] {
    if (!timeSlots || timeSlots.length === 0) return [];

    const daySlot = timeSlots.find(slot => slot.day === dayOfWeek);
    return daySlot ? daySlot.slots : [];
}

/**
 * Get available time slots for a specific date
 */
export function getTimeSlotsForDate(timeSlots: TimeSlot[], date: Date): string[] {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[date.getDay()];
    return getAvailableTimeSlots(timeSlots, dayName);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(originalPrice: number, discountedPrice: number): number {
    if (originalPrice <= 0 || discountedPrice <= 0) return 0;
    if (discountedPrice >= originalPrice) return 0;

    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

/**
 * Parse and format duration string
 */
export function formatDuration(showOffTime: string): string {
    if (!showOffTime) return '';

    // Parse strings like "2 hour", "5 hour", "30 minutes"
    const match = showOffTime.match(/(\d+)\s*(hour|minute|min|hr)/i);

    if (!match) return showOffTime;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    if (unit.startsWith('hour') || unit === 'hr') {
        return value === 1 ? '1 hour' : `${value} hours`;
    } else {
        return value === 1 ? '1 minute' : `${value} minutes`;
    }
}

/**
 * Convert duration string to minutes
 */
export function durationToMinutes(showOffTime: string): number {
    if (!showOffTime) return 0;

    const match = showOffTime.match(/(\d+)\s*(hour|minute|min|hr)/i);

    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    if (unit.startsWith('hour') || unit === 'hr') {
        return value * 60;
    } else {
        return value;
    }
}

/**
 * Extract specific detail section by title
 */
export function extractDetailSection(detailInfo: any[], title: string): string {
    if (!detailInfo || detailInfo.length === 0) return '';

    const section = detailInfo.find(info =>
        info.title.toLowerCase().includes(title.toLowerCase())
    );

    return section ? section.description : '';
}

/**
 * Get all available days of week for an activity
 */
export function getAvailableDays(timeSlots: TimeSlot[]): string[] {
    if (!timeSlots || timeSlots.length === 0) return [];

    return timeSlots
        .filter(slot => slot.slots && slot.slots.length > 0)
        .map(slot => slot.day);
}

/**
 * Check if activity is available within a date range
 */
export function isAvailableInDateRange(
    activity: ActivityAPIResponseItem,
    startDate: Date,
    endDate: Date
): boolean {
    // Check if activity's availability period overlaps with requested dates
    const activityStart = new Date(activity.startDate);
    const activityEnd = new Date(activity.endDate);

    return activityStart <= endDate && activityEnd >= startDate;
}

/**
 * Get the best pricing option (lowest adult price)
 */
export function getBestPricingOption(choices: ActivityChoice[]): ActivityChoice | null {
    if (!choices || choices.length === 0) return null;

    return choices.reduce((best, current) =>
        current.adultPrice < best.adultPrice ? current : best
    );
}

/**
 * Format HTML description to plain text
 */
export function stripHtmlTags(html: string): string {
    if (!html) return '';

    // Remove HTML tags
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
}

/**
 * Get activity type category for filtering
 */
export function getActivityCategory(type: string): string {
    const categoryMap: Record<string, string> = {
        'Water Adventure': 'adventure',
        'Safari': 'nature',
        'Sky Adventure': 'adventure',
        'Day Trips': 'sightseeing',
        'Kids Attraction': 'family',
        'Cultural Tour': 'culture',
        'Food Tour': 'food',
        'Museum': 'culture',
        'Historical Site': 'history',
    };

    return categoryMap[type] || 'activity';
}

/**
 * Check if activity matches user interests
 */
export function matchesInterests(activity: ActivityAPIResponseItem, interests: string[]): boolean {
    if (!interests || interests.length === 0) return true;

    const activityCategory = getActivityCategory(activity.type);
    const activityTags = activity.tags?.map(tag => tag.name.toLowerCase()) || [];

    return interests.some(interest => {
        const interestLower = interest.toLowerCase();
        return (
            activityCategory.includes(interestLower) ||
            activity.type.toLowerCase().includes(interestLower) ||
            activityTags.some(tag => tag.includes(interestLower))
        );
    });
}
