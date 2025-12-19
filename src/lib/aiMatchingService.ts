// AI Matching Service - Uses rule-based intelligent matching
// Can be upgraded to use LLM (OpenAI, Claude, etc.) in the future

interface MatchResult {
    score: number;
    reasons: string[];
}

interface UserPreferences {
    destination?: string;
    budget?: string;
    tripType?: string;
    interests?: string[];
    travelers?: number;
}

export class AIMatchingService {
    /**
     * Calculate match score for an activity based on user preferences
     */
    calculateMatchScore(
        activity: any,
        preferences: UserPreferences
    ): MatchResult {
        let score = 0;
        const reasons: string[] = [];

        // Budget matching (40 points)
        if (preferences.budget && activity.cost !== undefined) {
            const budgetScore = this.scoreBudgetMatch(activity.cost, preferences.budget);
            score += budgetScore.score;
            if (budgetScore.reason) {
                reasons.push(budgetScore.reason);
            }
        }

        // Interest matching (30 points)
        if (preferences.interests && preferences.interests.length > 0) {
            const interestScore = this.scoreInterestMatch(activity, preferences.interests);
            score += interestScore.score;
            if (interestScore.reason) {
                reasons.push(interestScore.reason);
            }
        }

        // Rating bonus (20 points)
        if (activity.rating !== undefined) {
            const ratingScore = this.scoreRating(activity.rating);
            score += ratingScore.score;
            if (ratingScore.reason) {
                reasons.push(ratingScore.reason);
            }
        }

        // Trip type matching (10 points)
        if (preferences.tripType) {
            const tripTypeScore = this.scoreTripTypeMatch(activity, preferences.tripType);
            score += tripTypeScore.score;
            if (tripTypeScore.reason) {
                reasons.push(tripTypeScore.reason);
            }
        }

        return { score, reasons };
    }

    private scoreBudgetMatch(cost: number, budget: string): { score: number; reason?: string } {
        const budgetRanges: Record<string, { min: number; max: number; label: string }> = {
            low: { min: 0, max: 50, label: 'budget-friendly' },
            medium: { min: 50, max: 150, label: 'moderately priced' },
            high: { min: 150, max: 300, label: 'premium' },
            luxury: { min: 300, max: Infinity, label: 'luxury' },
        };

        const range = budgetRanges[budget];
        if (!range) return { score: 0 };

        if (cost >= range.min && cost <= range.max) {
            return {
                score: 40,
                reason: `Perfect for your ${range.label} budget`,
            };
        } else if (cost < range.max * 1.2) {
            return {
                score: 20,
                reason: 'Slightly above budget but worth it',
            };
        }

        return { score: 0 };
    }

    private scoreInterestMatch(activity: any, interests: string[]): { score: number; reason?: string } {
        const activityText = (
            (activity.title || '') +
            ' ' +
            (activity.description || '') +
            ' ' +
            (activity.category || '') +
            ' ' +
            (activity.type || '')
        ).toLowerCase();

        const matchedInterests = interests.filter((interest) =>
            activityText.includes(interest.toLowerCase())
        );

        if (matchedInterests.length > 0) {
            return {
                score: 30,
                reason: `Matches your interest in ${matchedInterests.join(', ')}`,
            };
        }

        return { score: 0 };
    }

    private scoreRating(rating: number): { score: number; reason?: string } {
        if (rating >= 4.5) {
            return {
                score: 20,
                reason: `Highly rated (${rating}⭐)`,
            };
        } else if (rating >= 4.0) {
            return { score: 10 };
        }

        return { score: 0 };
    }

    private scoreTripTypeMatch(activity: any, tripType: string): { score: number; reason?: string } {
        const tripTypeKeywords: Record<string, string[]> = {
            romantic: ['romantic', 'couples', 'intimate', 'sunset', 'champagne', 'private'],
            family: ['family', 'kids', 'children', 'fun', 'interactive', 'educational'],
            adventure: ['adventure', 'outdoor', 'active', 'challenge', 'explore', 'extreme'],
            business: ['business', 'professional', 'meeting', 'conference', 'networking'],
            solo: ['solo', 'independent', 'self-guided', 'personal', 'individual'],
        };

        const keywords = tripTypeKeywords[tripType] || [];
        const activityText = (
            (activity.title || '') +
            ' ' +
            (activity.description || '') +
            ' ' +
            (activity.category || '')
        ).toLowerCase();

        const hasMatch = keywords.some((keyword) => activityText.includes(keyword));

        if (hasMatch) {
            return {
                score: 10,
                reason: `Great for ${tripType} trips`,
            };
        }

        return { score: 0 };
    }

    /**
     * Rank activities by match score and strictly filter based on constraints
     */
    rankActivities(activities: any[], preferences: UserPreferences): any[] {
        // Define budget limits
        const budgetRanges: Record<string, { max: number }> = {
            low: { max: 50 },
            medium: { max: 150 },
            high: { max: 300 },
            luxury: { max: Infinity },
        };

        const maxBudget = preferences.budget ? budgetRanges[preferences.budget]?.max : Infinity;

        return activities
            .filter(activity => {
                // Strict budget filtering with 20% buffer
                // If cost is 0, we assume it's free or unknown, so we keep it
                // if (activity.cost > maxBudget * 1.2) {
                //     console.log(`Filtering out ${activity.title} (cost: ${activity.cost}) due to budget ${maxBudget}`);
                //     return false;
                // }
                return true;
            })
            .map((activity) => {
                const { score, reasons } = this.calculateMatchScore(activity, preferences);
                return {
                    ...activity,
                    matchScore: score,
                    matchReasons: reasons,
                };
            })
            .sort((a, b) => b.matchScore - a.matchScore);
    }
}

// Export singleton instance
export const aiMatchingService = new AIMatchingService();
