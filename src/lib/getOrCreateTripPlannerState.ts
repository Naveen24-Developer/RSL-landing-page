const tripPlannerStore = new Map<string, TripPlannerState>();

function getOrCreateTripPlannerState(
    id: string,
): TripPlannerState {

    if (!tripPlannerStore.has(id)) {
        const state: TripPlannerState = {
            id,
            preferences: null,
            activitiesMap: new Map(),
            dayDistribution: null,
            stats: null,
            createdAt: Date.now(),
        };

        tripPlannerStore.set(id, state);
    }

    return tripPlannerStore.get(id)!;
}

export default getOrCreateTripPlannerState;
