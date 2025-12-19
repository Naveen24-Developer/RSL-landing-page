"use client";

import React, { useState } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, Sparkles, Users, Wallet, Heart, Plane, Briefcase, Mountain, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TripType } from '@/types/trip';
import { AISuggestionPanel } from './AISuggestionPanel';
import { ChatbotInterface } from './ChatbotInterface';
import { ChevronDown, ChevronUp } from 'lucide-react';

const INTERESTS = [
    'Culture', 'Food', 'Adventure', 'Nature', 'Shopping',
    'Nightlife', 'History', 'Art', 'Beach', 'Sports'
];

const TRIP_TYPES: { value: TripType; label: string; icon: React.ReactNode }[] = [
    { value: 'family', label: 'Family', icon: <Users className="h-4 w-4" /> },
    { value: 'solo', label: 'Solo', icon: <User className="h-4 w-4" /> },
    { value: 'romantic', label: 'Romantic', icon: <Heart className="h-4 w-4" /> },
    { value: 'adventure', label: 'Adventure', icon: <Mountain className="h-4 w-4" /> },
    { value: 'business', label: 'Business', icon: <Briefcase className="h-4 w-4" /> },
];

export function TripWizard() {
    const { preferences, setPreferences, setGenerating, setItinerary, isChatMode, setChatMode, isGenerating } = useTripStore();
    const [selectedInterests, setSelectedInterests] = useState<string[]>(preferences.interests);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [openFrom, setOpenFrom] = useState(false);
    const [openTo, setOpenTo] = useState(false);


    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev => {
            const newInterests = prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest];
            setPreferences({ interests: newInterests });
            return newInterests;
        });
    };

    const handleGenerateTrip = async () => {
        console.log('🚀 Generate Trip button clicked');
        console.log('📋 Current preferences:', preferences);

        if (!preferences.destination || !preferences.dates.from || !preferences.dates.to) {
            console.error('❌ Missing required fields:', {
                destination: preferences.destination,
                from: preferences.dates.from,
                to: preferences.dates.to
            });
            alert('Please fill in destination and dates');
            return;
        }

        console.log('✅ Validation passed, starting trip generation...');
        // setGenerating(true);
        // Switch to chat mode to show AI response
        setChatMode(true);

        try {
            // Create initial message for AI to process
            const initialMessage = `I want to plan a trip to ${preferences.destination} from ${preferences.dates.from.toLocaleDateString()} to ${preferences.dates.to.toLocaleDateString()} for ${preferences.travelers} traveler(s). My budget is ${preferences.budget}, trip type is ${preferences.tripType}, and I'm interested in: ${preferences.interests.join(', ') || 'various activities'}. Please generate my itinerary.`;

            console.log('📝 Initial message:', initialMessage);

            const requestBody = {
                messages: [{
                    role: 'user',
                    content: initialMessage
                }],
                preferences: {
                    destination: preferences.destination,
                    dates: {
                        from: preferences.dates.from?.toISOString(),
                        to: preferences.dates.to?.toISOString(),
                    },
                    travelers: preferences.travelers,
                    budget: preferences.budget,
                    tripType: preferences.tripType,
                    interests: preferences.interests,
                },
                generateItinerary: true, // Flag to indicate this is initial trip generation
            };

            console.log('📤 Sending request to /api/gen-ai:', requestBody);

            // Call chat API to let AI process and generate itinerary
            const response = await fetch('/api/gen-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('📥 Response received:', response.status, response.statusText);

            const data = await response.json();

            console.log('📊 Chat API Response data:', data);

            // If AI generated an itinerary, set it
            if (data.itinerary && data.itinerary.length > 0) {
                console.log('✅ Itinerary received, setting itinerary with', data.itinerary.length, 'items');
                setItinerary(data.itinerary);
            } else {
                console.warn('⚠️ No itinerary in response or empty itinerary');
            }

        } catch (error) {
            console.error('❌ Error generating trip:', error);
            alert('An error occurred while generating your trip. Please try again.');
        } finally {
            console.log('🏁 Trip generation completed, setting generating to false');
            // setGenerating(false);
        }
    };

    // Show chatbot interface if in chat mode
    if (isChatMode) {
        return <ChatbotInterface />;
    }

    // Otherwise show the form
    return (
        <div className="h-full flex flex-col py-4">
            <div className="px-4">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Plane className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    Plan Your Trip
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                    Tell us your preferences and we'll create the perfect itinerary
                </p>
            </div>

            <ScrollArea className="flex-1">
                <div className="space-y-4 sm:space-y-6 p-4">
                    {/* Destination */}
                    <div className="space-y-2">
                        <Label htmlFor="destination" className="text-sm font-medium">
                            Destination
                        </Label>
                        <Input
                            id="destination"
                            placeholder="e.g., Paris, France"
                            value={preferences.destination}
                            onChange={(e) => setPreferences({ destination: e.target.value })}
                            className="w-full h-10"
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* FROM DATE */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">From</Label>
                            <Popover open={openFrom} onOpenChange={setOpenFrom}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        onClick={() => setOpenFrom(true)}
                                        className={cn(
                                            "w-full justify-start text-left font-normal h-10",
                                            !preferences.dates.from && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {preferences.dates.from
                                            ? format(preferences.dates.from, "PPP")
                                            : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={preferences.dates.from}
                                        initialFocus
                                        disabled={(date) =>
                                            date < new Date(new Date().setHours(0, 0, 0, 0))
                                        }
                                        onSelect={(date) => {
                                            setPreferences({
                                                dates: { ...preferences.dates, from: date },
                                            });
                                            setOpenFrom(false); // 👈 CLOSE POPOVER
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* TO DATE */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">To</Label>
                            <Popover open={openTo} onOpenChange={setOpenTo}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        onClick={() => setOpenTo(true)}
                                        className={cn(
                                            "w-full justify-start text-left font-normal h-10",
                                            !preferences.dates.to && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {preferences.dates.to
                                            ? format(preferences.dates.to, "PPP")
                                            : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={preferences.dates.to}
                                        initialFocus
                                        disabled={(date) =>
                                            preferences.dates.from
                                                ? date < preferences.dates.from
                                                : false
                                        }
                                        onSelect={(date) => {
                                            setPreferences({
                                                dates: { ...preferences.dates, to: date },
                                            });
                                            setOpenTo(false); // 👈 CLOSE POPOVER
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>


                    {/* Travelers */}
                    <div className="space-y-2">
                        <Label htmlFor="travelers" className="text-sm font-medium">
                            Number of Travelers
                        </Label>
                        <Input
                            id="travelers"
                            type="text"
                            value={preferences.travelers}
                            onKeyDown={(e) => {
                                if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete") {
                                    e.preventDefault()
                                }
                            }}
                            onChange={(e) =>
                                setPreferences({ travelers: Number(e.target.value) })
                            }
                            className="w-full h-10"
                        />
                    </div>

                    {/* Budget */}
                    <div className="space-y-2">
                        <Label htmlFor="budget" className="text-sm font-medium flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Budget
                        </Label>
                        <Select
                            value={preferences.budget}
                            onValueChange={(value: 'all' | 'low' | 'medium' | 'high' | 'luxury') =>
                                setPreferences({ budget: value })
                            }
                        >
                            <SelectTrigger id="budget">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="low">Budget-Friendly</SelectItem>
                                <SelectItem value="medium">Moderate</SelectItem>
                                <SelectItem value="high">Premium</SelectItem>
                                <SelectItem value="luxury">Luxury</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Trip Type */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Trip Type</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {TRIP_TYPES.map((type) => (
                                <Button
                                    key={type.value}
                                    variant={preferences.tripType === type.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setPreferences({ tripType: type.value })}
                                    className="justify-start"
                                >
                                    {type.icon}
                                    <span className="ml-2 text-xs">{type.label}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Interests */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Interests</Label>
                        <div className="flex flex-wrap gap-2">
                            {INTERESTS.map((interest) => (
                                <Badge
                                    key={interest}
                                    variant={selectedInterests.includes(interest) ? "default" : "outline"}
                                    className="cursor-pointer text-xs"
                                    onClick={() => toggleInterest(interest)}
                                >
                                    {interest}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <Button
                        onClick={handleGenerateTrip}
                        className="w-full cursor-pointer"
                        size="lg"
                    >
                        {
                            isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />
                        }

                        Generate My Trip
                    </Button>
                </div>
            </ScrollArea>
        </div>
    );
}
