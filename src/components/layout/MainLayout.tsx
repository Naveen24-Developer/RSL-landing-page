"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, List, Settings } from 'lucide-react';

interface MainLayoutProps {
    children: React.ReactNode;
    leftPanel: React.ReactNode;
    rightPanel: React.ReactNode;
    className?: string;
}

export function MainLayout({
    children,
    leftPanel,
    rightPanel,
    className,
}: MainLayoutProps) {
    const [activeTab, setActiveTab] = useState("itinerary");

    return (
        <>
            {/* Desktop Layout - 3 Panels Side by Side */}
            <div className={cn("hidden lg:flex h-screen w-full overflow-hidden bg-background", className)}>
                {/* Left Panel - Trip Wizard / Input */}
                <div className="w-[400px] shrink-0 border-r bg-card z-10 flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        {leftPanel}
                    </div>
                </div>

                {/* Middle Panel - AI Suggestions / Itinerary */}
                <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-muted/30 relative">
                    <div className="flex-1 overflow-y-auto p-4">
                        {children}
                    </div>
                </div>

                {/* Right Panel - Map */}
                <div className="w-[30%] xl:w-[35%] shrink-0 border-l bg-muted relative h-full">
                    {rightPanel}
                </div>
            </div>

            {/* Mobile/Tablet Layout - Tabbed Interface */}
            <div className={cn("lg:hidden h-screen w-full overflow-hidden bg-background flex flex-col", className)}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full overflow-hidden">
                    <TabsList className="w-full rounded-none border-b h-14 bg-card shrink-0">
                        <TabsTrigger value="plan" className="flex-1 gap-2">
                            <Settings className="h-4 w-4" />
                            <span className="hidden sm:inline">Plan</span>
                        </TabsTrigger>
                        <TabsTrigger value="itinerary" className="flex-1 gap-2">
                            <List className="h-4 w-4" />
                            <span className="hidden sm:inline">Itinerary</span>
                        </TabsTrigger>
                        <TabsTrigger value="map" className="flex-1 gap-2">
                            <MapPin className="h-4 w-4" />
                            <span className="hidden sm:inline">Map</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="plan" className="flex-1 overflow-y-auto m-0 data-[state=active]:flex data-[state=inactive]:hidden">
                        {leftPanel}
                    </TabsContent>

                    <TabsContent value="itinerary" className="flex-1 overflow-y-auto p-4 m-0 data-[state=active]:flex data-[state=inactive]:hidden">
                        {children}
                    </TabsContent>

                    <TabsContent value="map" className="flex-1 overflow-hidden m-0 data-[state=active]:flex data-[state=inactive]:hidden">
                        {rightPanel}
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
