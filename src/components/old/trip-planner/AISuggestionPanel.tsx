"use client";

import React from 'react';
import { useAISuggestions } from '@/hooks/useAISuggestions';
import { useTripStore } from '@/store/useTripStore';
import { SuggestionItem } from '@/types/trip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Plus, MapPin, Clock, DollarSign, Star, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestionCardProps {
    item: SuggestionItem;
    onAdd: (item: SuggestionItem) => void;
}

function SuggestionCard({ item, onAdd }: SuggestionCardProps) {
    const typeColors = {
        activity: 'bg-blue-500/10 text-blue-700 border-blue-200',
    };

    const typeLabels = {
        activity: 'Activity',
    };

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-semibold line-clamp-2 mb-2">
                            {item?.name}
                        </CardTitle>
                        <Badge
                            variant="outline"
                            // className={cn("text-xs", typeColors[item.type])}
                            className={cn("text-xs", "activity")}
                        >
                            {/* {typeLabels[item.type]} */}
                            Activity
                        </Badge>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onAdd(item)}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-2">
                    {item?.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{item?.cityName}</span>
                    </div>
                    {item.duration && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{Math.floor(item.duration / 60)}h {item.duration % 60}m</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>${item?.price}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{item?.rating}</span>
                    </div>
                </div>

                {item?.tags && item?.tags.length > 0 && (
                    <div className="pt-2 border-t">
                        <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Why we recommend this:
                        </p>
                        <ul className="space-y-0.5">
                            {item?.tags.slice(0, 2).map((reason, idx) => (
                                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span>{reason?.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function AISuggestionPanel() {
    const { suggestions, loading, error } = useAISuggestions();
    const { addToItinerary, preferences } = useTripStore();

    const handleAddToItinerary = (item: SuggestionItem) => {
        // Convert SuggestionItem to ItineraryItem
        addToItinerary({
            id: item._id,
            title: item.name,
            type: item.type as 'activity' | 'food' | 'travel',
            location: item.location,
            duration: item.duration,
            cost: item.price,
            rating: item.rating,
            description: item.description,
            image: item.image,
            day: 1, // Default to day 1
        });
    };

    // Show nothing if no destination
    if (!preferences.destination) {
        return (
            <div className="p-6 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                    Enter a destination to get AI-powered suggestions
                </p>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="p-6 text-center">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground">
                    Finding perfect suggestions for you...
                </p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-6 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-destructive/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                    {error}
                </p>
            </div>
        );
    }

    // No suggestions
    if (!suggestions || suggestions.totalSuggestions === 0) {
        return (
            <div className="p-6 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                    No suggestions found. Try adjusting your preferences.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Suggestions
                    <Badge variant="secondary" className="text-xs">
                        {suggestions.totalSuggestions}
                    </Badge>
                </h3>
            </div>

            <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-6 pr-4">
                    {/* Activities */}
                    {suggestions.activities.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Activities
                            </h4>
                            <div className="grid gap-3">
                                {suggestions.activities.map((item) => (
                                    <SuggestionCard
                                        key={item._id}
                                        item={item}
                                        onAdd={handleAddToItinerary}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
