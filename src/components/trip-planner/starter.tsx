"use client";

import { useTripStore } from "@/store/useTripStore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapView } from "./map-view";
import { DestinationSelector } from "./destination-selector";
import { DateDurationPicker } from "./date-duration-picker";
import { PreferencesPanel } from "./preferences-panel";
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import getOrCreateDeviceId from "./getDeviceId";


export const Starter = () => {
    const { preferences, clearItinerary } = useTripStore();
    const [preferencesOpen, setPreferencesOpen] = useState(false);
    const router = useRouter();

    // Check if required fields are filled
    const isFormValid =
        preferences.destination &&
        preferences.dates.from &&
        preferences.dates.to;

    const handlePlanTrip = () => {
        if (isFormValid) {
            clearItinerary();
            router.push(`/itinerary/${getOrCreateDeviceId()}`);
        }
    };

    return (
        <div className="hidden lg:flex h-screen w-full overflow-hidden bg-background">
            {/* Left Panel - Controls */}
            <div className="w-[50%] shrink-0 border-r bg-card z-10 flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <span className="text-blue-600 text-3xl">⚡</span> Trip.Planner
                        </h1>
                    </div>

                    <div className="space-y-6">

                        {/* Destination Selector */}
                        <DestinationSelector />

                        {/* Date Duration Picker */}
                        <DateDurationPicker />

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            {/* Preferences Dialog */}
                            <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
                                <Button
                                    variant="outline"
                                    onClick={() => setPreferencesOpen(true)}
                                    className="flex items-center gap-2 text-lg font-semibold"
                                >
                                    <span>❤️</span>
                                    <span>Preferences</span>
                                </Button>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Trip Preferences</DialogTitle>
                                    </DialogHeader>
                                    <div className="max-h-[500px] overflow-y-auto pr-4">
                                        <PreferencesPanel onClose={() => setPreferencesOpen(false)} />
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <Button
                                className="flex-1 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 gap-2"
                                disabled={!isFormValid}
                                onClick={handlePlanTrip}
                            >
                                <Zap className="h-4 w-4" />
                                Plan a Trip with AI
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Map */}
            <div className="w-[50%] shrink-0 bg-muted relative h-full">
                <MapView />
            </div>
        </div>
    );
};