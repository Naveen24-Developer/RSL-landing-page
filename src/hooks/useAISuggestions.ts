import { useState, useEffect, useCallback, useRef } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { SuggestionResponse } from '@/types/trip';

interface UseAISuggestionsReturn {
    suggestions: SuggestionResponse | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useAISuggestions(): UseAISuggestionsReturn {
    const { preferences } = useTripStore();
    const [suggestions, setSuggestions] = useState<SuggestionResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const abortController = useRef<AbortController | null>(null);

    const fetchSuggestions = useCallback(async () => {
        // Don't fetch if no destination is set
        if (!preferences.destination) {
            setSuggestions(null);
            return;
        }

        // Cancel previous request if still pending
        if (abortController.current) {
            abortController.current.abort();
        }

        abortController.current = new AbortController();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/ai-suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    destination: preferences.destination,
                    budget: preferences.budget,
                    tripType: preferences.tripType,
                    interests: preferences.interests,
                    travelers: preferences.travelers,
                }),
                signal: abortController.current.signal,
            });

            if (!response.ok) {
                throw new Error('Failed to fetch suggestions');
            }

            const data: SuggestionResponse = await response.json();
            setSuggestions(data);
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                setError(err.message || 'An error occurred');
                console.error('Error fetching suggestions:', err);
            }
        } finally {
            setLoading(false);
        }
    }, [preferences]);

    // Debounced effect to fetch suggestions when preferences change
    useEffect(() => {
        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer
        debounceTimer.current = setTimeout(() => {
            fetchSuggestions();
        }, 800); // 800ms debounce

        // Cleanup
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [fetchSuggestions]);

    const refetch = useCallback(() => {
        fetchSuggestions();
    }, [fetchSuggestions]);

    return {
        suggestions,
        loading,
        error,
        refetch,
    };
}
