"use client";

import React, { useState, useEffect } from 'react';
import { Check, Loader2, ChevronUp } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ThinkingStep {
    id: string;
    label: string;
    detail?: string;
    completed: boolean;
}

export function DeepDiveThinking() {
    const [isExpanded, setIsExpanded] = useState(true);
    const { isGenerating } = useTripStore();
    const [steps, setSteps] = useState<ThinkingStep[]>([
        { id: '1', label: 'Analyze User Preference', completed: false },
        { id: '2', label: 'Retrieve Resources', completed: false },
        { id: '3', label: 'Searched Top Attractions', detail: 'Selected 20 recommended attractions', completed: false },
        { id: '4', label: 'Searched Accommodations and Hotels', detail: 'Selected 20 recommended stays', completed: false },
        { id: '5', label: 'Transportation Overview', detail: 'Selected 20 transportation routes', completed: false },
        { id: '6', label: 'Local Guide', detail: 'Selected local guides', completed: false },
        { id: '7', label: 'Generate Itinerary', detail: 'A personalized itinerary has been created for you', completed: false },
    ]);

    // Simulate progressive completion of steps
    useEffect(() => {
        const intervals: NodeJS.Timeout[] = [];

        steps.forEach((step, index) => {
            const timeout = setTimeout(() => {
                setSteps(prev => prev.map((s, i) =>
                    i === index ? { ...s, completed: true } : s
                ));
            }, (index + 1) * 800); // Stagger each step by 800ms

            intervals.push(timeout);
        });

        return () => intervals.forEach(clearTimeout);
    }, []);

    useEffect(() => {
        if (isGenerating) {
            setIsExpanded(true);
        } else {
            setIsExpanded(false);
        }
    }, [isGenerating])

    return (
        <Card className="my-4 overflow-hidden border-primary/20">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    {isGenerating && <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    </div>}
                    <h3 className="font-semibold text-sm">DeepDive Thinking Finished</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                >
                    <ChevronUp className={`h-4 w-4 transition-transform ${isExpanded ? '' : 'rotate-180'}`} />
                </Button>
            </div>

            {/* Steps */}
            {isExpanded && (
                <div className="p-4 space-y-3">
                    {steps.map((step) => (
                        <div key={step.id} className="space-y-1">
                            <div className="flex items-start gap-2">
                                <div className="mt-0.5">
                                    {step.completed ? (
                                        <Check className="h-4 w-4 text-primary" />
                                    ) : (
                                        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                                    )}
                                </div>
                                <span className={`text-sm font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {step.detail && step.completed && (
                                <p className="text-xs text-muted-foreground ml-6 pl-0.5">
                                    {step.detail}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
