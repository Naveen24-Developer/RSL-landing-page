"use client";

import React from "react";
import { 
  Binoculars, 
  UtensilsCrossed, 
  Mountain, 
  Bed, 
  CheckSquare, 
  FileText, 
  Plane, 
  Bus 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { textGradient,bgGradientHover,bgGradient } from "@/lib/utils";
import {cn } from "@/lib/utils"

const features = [
  {
    title: "Attractions",
    description: "Discover must-visit attractions and hidden gems at your destination. From iconic landmarks to unique local spots, find the perfect places to explore on your trip.",
    icon: <Binoculars className="w-6 h-6" />,
    status: "active"
  },
  {
    title: "Restaurants",
    description: "Savor the best local and international cuisines at top-rated restaurants. Find dining spots that match your taste and preferences.",
    icon: <UtensilsCrossed className="w-6 h-6" />,
    status: "active"
  },
  {
    title: "Activities",
    description: "Experience exciting activities, from adventure sports to cultural tours. Discover things to do that make your trip unforgettable.",
    icon: <Mountain className="w-6 h-6" />,
    status: "active"
  },
  {
    title: "Stays",
    description: "Find comfortable and affordable stays, from luxury hotels to budget accommodations. Choose the best place to relax during your trip.",
    icon: <Bed className="w-6 h-6" />,
    status: "active"
  },
  {
    title: "Travel Checklists",
    description: "Based on your trip, RSL AI will create a checklist for you.",
    icon: <CheckSquare className="w-6 h-6" />,
    status: "active"
  },
  {
    title: "Travel Documents",
    description: "You can upload your travel documents and RSL AI will help you manage them.",
    icon: <FileText className="w-6 h-6" />,
    status: "active"
  },
  {
    title: "Flights",
    description: "Easily book flights with the best deals and flexible options. Compare prices and find the perfect flight for your journey.",
    icon: <Plane className="w-6 h-6" />,
    status: "active"
  },
  {
    title: "Bus",
    description: "Book bus tickets for a smooth and budget-friendly journey. Explore various routes and travel conveniently to your destination.",
    icon: <Bus className="w-6 h-6" />,
    status: "active"
  },
];

export default function OrganizeSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-15">
  <h2
    className={`
      text-4xl md:text-5xl
      font-bold tracking-tight
      mb-6
      leading-[1.15]
      pb-1
      ${textGradient()}
    `}
  >
    Organize it all in one place
  </h2>

  <p className="text-gray-500 text-lg">
    RSL is your one-stop-shop for all your travel needs.
  </p>
</div>


        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-gray-100">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 border-r border-b border-gray-100 transition-all duration-400 hover:bg-slate-50/50"
            >
              {/* Left Side Status Indicator Tag */}
              <div
  className={cn(
    "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-colors duration-300",
    feature.status === "coming soon"
      ? ""
      : cn("bg-gray-200", bgGradientHover)
  )}
/>

              <div className="mb-6 text-gray-700">
                {feature.icon}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <h3
  className="
    text-xl font-bold text-gray-900
    transition-all duration-300 origin-left
    group-hover:scale-110
    group-hover:bg-gradient-to-b
    group-hover:from-[#6fc9d3]
    group-hover:via-[#2f9aa8]
    group-hover:to-[#0f6f7f]
    group-hover:bg-clip-text
    group-hover:text-transparent
  "
>
  {feature.title}
</h3>

                {feature.status === "coming soon" && (
                  <Badge className="bg-black text-white text-[10px] px-1.5 py-0 hover:bg-black rounded">
                    coming soon
                  </Badge>
                )}
              </div>

              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}