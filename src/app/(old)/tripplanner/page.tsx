"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { TripWizard } from "@/components/old/trip-planner/TripWizard";
import { ItineraryFeed } from "@/components/trip-planner/itinerary-feed";
import { MapView } from "@/components/trip-planner/map-view";
import { useTripStore } from "@/store/useTripStore";

export default function Home() {
  const { itinerary } = useTripStore();
  // const hasItinerary = itinerary.length > 0;
  const { isChatMode } = useTripStore();

  return (
    <main className="h-screen w-screen overflow-hidden">
      {isChatMode ? (
        <MainLayout
          leftPanel={<TripWizard />}
          rightPanel={<MapView />}
        >
          <ItineraryFeed />
        </MainLayout>
      ) : (
        <div className="hidden lg:flex h-screen w-full overflow-hidden bg-background">
          {/* Left Panel - Trip Wizard / Input */}
          <div className="w-[50%] shrink-0 border-r bg-card z-10 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <TripWizard />
            </div>
          </div>

          {/* Right Panel - Map */}
          <div className="w-[50%] shrink-0 bg-muted relative h-full">
            <MapView />
          </div>
        </div>
      )}

      {/* Mobile/Tablet - Always use MainLayout */}
      <div className="lg:hidden h-screen w-screen">
        <MainLayout
          leftPanel={<TripWizard />}
          rightPanel={<MapView />}
        >
          <ItineraryFeed />
        </MainLayout>
      </div>
    </main>
  );
}
