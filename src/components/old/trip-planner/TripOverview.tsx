"use client";

import React from 'react';
import { useTripStore } from '@/store/useTripStore';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export function TripOverview() {
    const { itinerary, preferences } = useTripStore();

    // Group activities by day
    const groupedByDay = itinerary.reduce((acc, item) => {
        if (!acc[item.day]) {
            acc[item.day] = {
                dayNumber: item.day,
                dayTitle: item.dayTitle || `Day ${item.day}`,
                activities: []
            };
        }
        acc[item.day].activities.push(item);
        return acc;
    }, {} as Record<number, { dayNumber: number; dayTitle: string; activities: any[] }>);

    // Sort activities within each day by sequence
    Object.values(groupedByDay).forEach(day => {
        day.activities.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
    });

    const days = Object.values(groupedByDay).sort((a, b) => a.dayNumber - b.dayNumber);

    if (itinerary.length === 0) {
        return null;
    }

    return (
        <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Overview</h2>

            <Card>
                <CardContent className="p-0">
                    {days.map((day, dayIndex) => (
                        <div
                            key={day.dayNumber}
                            className={`p-4 ${dayIndex !== days.length - 1 ? 'border-b' : ''}`}
                        >
                            <div className="flex gap-4">
                                {/* Day Number */}
                                <div className="flex flex-col items-center shrink-0">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Day</span>
                                    <span className="text-4xl font-bold leading-none mt-1">
                                        {day.dayNumber.toString().padStart(2, '0')}
                                    </span>
                                </div>

                                {/* Activities List */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-base mb-2">{preferences.destination}</h3>
                                    <div className="space-y-1">
                                        {day.activities.map((activity, actIndex) => (
                                            <div key={activity.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span className="truncate">{activity.title}</span>
                                                {actIndex !== day.activities.length - 1 && (
                                                    <ArrowRight className="h-3 w-3 shrink-0" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
