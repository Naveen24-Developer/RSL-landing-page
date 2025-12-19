import { create } from 'zustand';
import { TripState, TripPreferences, ItineraryItem } from '@/types/trip';
import { ThinkingStep } from '@/types/chat';

const defaultPreferences: TripPreferences = {
    destination: '',
    dates: {
        from: undefined,
        to: undefined,
    },
    travelers: 1,
    budget: 'all',
    tripType: 'solo',
    interests: [],
};

export const useTripStore = create<TripState>((set) => ({
    preferences: defaultPreferences,
    itinerary: [],
    currentDay: 1,
    isGenerating: false,
    isChatMode: false,
    selectedActivity: null,
    thinkingSteps: [],

    setPreferences: (prefs) =>
        set((state) => ({
            preferences: { ...state.preferences, ...prefs },
        })),

    addToItinerary: (item) =>
        set((state) => ({
            itinerary: [...state.itinerary, item],
        })),

    removeFromItinerary: (id) =>
        set((state) => ({
            itinerary: state.itinerary.filter((item) => item.id !== id),
        })),

    updateItineraryItem: (id, updates) =>
        set((state) => ({
            itinerary: state.itinerary.map((item) =>
                item.id === id ? { ...item, ...updates } : item
            ),
        })),

    reorderItinerary: (items) =>
        set(() => ({
            itinerary: items,
        })),

    clearItinerary: () =>
        set(() => ({
            itinerary: [],
            thinkingSteps: [],
        })),

    setItinerary: (items) =>
        set(() => ({
            itinerary: items,
        })),

    setCurrentDay: (day) =>
        set(() => ({
            currentDay: day,
        })),

    setGenerating: (isGenerating) =>
        set(() => ({
            isGenerating,
        })),

    setChatMode: (isChatMode) =>
        set(() => ({
            isChatMode,
        })),

    setSelectedActivity: (activity: ItineraryItem | null) =>
        set(() => ({
            selectedActivity: activity,
        })),

    setThinkingSteps: (steps: ThinkingStep[]) =>
        set(() => ({
            thinkingSteps: steps,
        })),

    addThinkingStep: (step: ThinkingStep) =>
        set((state) => ({
            thinkingSteps: [...state.thinkingSteps, step],
        })),

    updateThinkingStep: (id: string, updates: Partial<ThinkingStep>) =>
        set((state) => ({
            thinkingSteps: state.thinkingSteps.map((step) =>
                step.id === id ? { ...step, ...updates } : step
            ),
        })),

    clearThinkingSteps: () =>
        set(() => ({
            thinkingSteps: [],
        })),
}));
