export type TripType = 'family' | 'solo' | 'romantic' | 'adventure' | 'business';

export interface TripPreferences {
    destination: string;
    dates: {
        from: Date | undefined;
        to: Date | undefined;
    };
    travelers: number;
    budget: 'all' | 'low' | 'medium' | 'high' | 'luxury';
    priceRange?: {
        min: number;
        max: number;
    };
    tripType: TripType;
    interests: string[];
}

// Enhanced Activity Types based on API Response

export interface TimeSlot {
    day: string; // "Monday", "Tuesday", etc.
    slots: string[]; // ["10:30", "12:30", "15:30"]
}

export interface GroupOptions {
    groupMemberCount: number;
    groupB2BPrice: number;
    originalPrice: number;
    price: number;
}

export interface PersonOptions {
    minPersonCount: number;
    maxPersonCount: number;
    adultCount: number;
    childCount: number;
    seniorCount: number;
}

export interface BookingLog {
    date: string;
    bookingsCount: number;
}

export interface ActivityChoice {
    _id: string;
    name: string;
    shortDescription: string;
    highlights: string[];
    seniorB2BPrice: number;
    seniorOriginalPrice: number;
    seniorPrice: number;
    adultB2BPrice: number;
    adultOriginalPrice: number;
    adultPrice: number;
    childB2BPrice: number;
    childOriginalPrice: number;
    childPrice: number;
    childAge: string;
    image: string[];
    isSameForAll: boolean;
    timeSlotType: number;
    timeSlots: TimeSlot[];
    slotTime: string[];
    showOffTime: string; // e.g., "2 hour", "5 hour"
    optionType: number;
    groupOptions: GroupOptions;
    personOptions: PersonOptions;
    packageBookingLimitPerDay: number;
    bookingLog: BookingLog;
}

export interface ActivityTag {
    name: string;
    image: string;
    tags: any[];
}

export interface DetailInfo {
    _id: string;
    title: string; // "Inclusion", "Exclusion", "Know Before You Go", etc.
    description: string; // HTML formatted string
}

export interface ActivityAPIResponseItem {
    _id: string;
    name: string;
    image: string;
    backgroundImage: string[];
    mobileBackgroundImage: string[];
    description: string;
    label: string; // "Good", "Excellent", etc.
    type: string; // "Water Adventure", "Safari", "Sky Adventure", etc.
    status: number;
    rating: number;
    reviews: number;
    countryCode: string;
    tags: ActivityTag[];
    latitude: number;
    longitude: number;
    startDate: string;
    endDate: string;
    choice: ActivityChoice[];
    detailInfo: DetailInfo[];
    createdDate: string;
    isDiscount: boolean;
    isShow: boolean;
    isAvailable: boolean;
    cityName: string;
    countryName: string;
    price: number;
    currency: string;
    vat: number;
    startingPrice: number;
    availability: string;
    favourites: boolean;
}

export interface ActivityAPIResponse {
    status: number;
    message: string;
    responseData: ActivityAPIResponseItem[];
    currentPage?: number;
    totalPages?: number;
}

// Enhanced Itinerary Item with full activity details
export interface ItineraryItem {
    id: string;
    title: string;
    type: 'activity' | 'food' | 'travel';
    location: {
        lat: number;
        lng: number;
        address: string;
    };
    startTime?: string;
    duration?: number; // in minutes
    cost?: number;
    rating?: number;
    image?: string;
    description?: string;
    day: number; // 1-based index of the trip day
    dayTitle?: string; // e.g., "Explore Museum of The Future, Burj Khalifa..."
    timeOfDay?: 'Morning' | 'Afternoon' | 'Evening'; // Time slot for the activity
    sequence?: number; // Order within the day (1, 2, 3)

    // Enhanced fields from API
    activityId?: string; // Original _id from API
    activityType?: string; // "Water Adventure", "Safari", etc.
    label?: string; // "Good", "Excellent"
    reviews?: number;
    backgroundImages?: string[];
    mobileBackgroundImages?: string[];
    choices?: ActivityChoice[];
    detailInfo?: DetailInfo[];
    tags?: ActivityTag[];
    currency?: string;
    startingPrice?: number;
    availability?: string;
    countryName?: string;
    cityName?: string;
    isDiscount?: boolean;
}

export interface TripState {
    preferences: TripPreferences;
    itinerary: ItineraryItem[];
    currentDay: number;
    isGenerating: boolean;
    isChatMode: boolean;
    selectedActivity: ItineraryItem | null;
    thinkingSteps: any[]; // ThinkingStep[] from chat.ts

    // Actions
    setPreferences: (prefs: Partial<TripPreferences>) => void;
    addToItinerary: (item: ItineraryItem) => void;
    removeFromItinerary: (id: string) => void;
    updateItineraryItem: (id: string, updates: Partial<ItineraryItem>) => void;
    reorderItinerary: (items: ItineraryItem[]) => void;
    clearItinerary: () => void;
    setItinerary: (items: ItineraryItem[]) => void;
    setCurrentDay: (day: number) => void;
    setGenerating: (isGenerating: boolean) => void;
    setChatMode: (isChatMode: boolean) => void;
    setSelectedActivity: (activity: ItineraryItem | null) => void;
    
    // Thinking steps actions
    setThinkingSteps: (steps: any[]) => void;
    addThinkingStep: (step: any) => void;
    updateThinkingStep: (id: string, updates: any) => void;
    clearThinkingSteps: () => void;
}

// Chat Message Types
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// AI Suggestion Types (kept for backward compatibility)
export interface SuggestionItem {
    _id: string;
    name: string;
    type: 'activity';
    location: {
        lat: number;
        lng: number;
        address: string;
    };
    duration?: number;
    price: number;
    rating: number;
    description: string;
    cityName: string;
    matchScore?: number;
    tags?: any[];
    category?: string;
    image?: string;
}

export type SuggestionCategory = 'activities';

export interface SuggestionResponse {
    activities: SuggestionItem[];
    totalSuggestions: number;
}
