"use client";

import { MapView } from "./map-view";
import { ChatInterface } from "./chat-interface";
import { ItineraryFeed } from "./itinerary-feed";


export const ItineraryLayout = ({ deviceId }: { deviceId: string }) => {

    return (
        <div className="h-screen w-full overflow-hidden bg-background flex flex-col">
            <div className="flex-1 overflow-hidden flex">
                {/* Left Panel - Itinerary/Chat */}
                <div className="flex-1 border-r flex flex-row overflow-hidden">
                    <div className="flex-1"><ChatInterface deviceId={deviceId} /></div>
                    <div className="flex-1"><ItineraryFeed /></div>
                </div>

                {/* Right Panel - Map */}
                <div className="w-[40%] bg-muted relative">
                    <MapView />
                </div>
            </div>

        </div>
    );
};
