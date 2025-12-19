"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { bgGradient, cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const avatars = [
  "https://i.pravatar.cc/150?u=1",
  "https://i.pravatar.cc/150?u=2",
  "https://i.pravatar.cc/150?u=3",
  "https://i.pravatar.cc/150?u=4",
  "https://i.pravatar.cc/150?u=5",
  "https://i.pravatar.cc/150?u=6",
];

export default function CTASection() {
  return (
    <section className="w-full bg-white py-12 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-10 lg:gap-12 text-center lg:text-left">
          
          {/* LEFT CONTENT */}
          <div className="flex-1 space-y-6 md:space-y-8">
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-[1.15] md:leading-[1.1]">
                Plan unforgettable trips <br className="hidden sm:block" />
                with zero stress today.
              </h2>
              <p className="text-gray-500 text-base md:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Experience effortless travel planning with AI-powered
                precision. From smart itineraries to seamless bookings, we
                help travelers explore the world with confidence.
              </p>
            </div>

            {/* Social Proof Section */}
            <div className="space-y-4 flex flex-col items-center lg:items-start">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Overlapping Avatars */}
                <div className="flex -space-x-3 overflow-hidden">
                  {avatars.map((url, i) => (
                    <Avatar key={i} className="inline-block border-2 border-white w-8 h-8 md:w-10 md:h-10">
                      <AvatarImage src={url} alt={`User ${i + 1}`} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  ))}
                </div>

                {/* Stars */}
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-gray-400 text-xs md:text-sm font-medium">
                Trusted by 1000+ travelers and counting
              </p>
            </div>
          </div>

          {/* RIGHT CONTENT: Button */}
          <div className="w-full lg:w-auto flex justify-center lg:justify-end lg:pb-2">
            <Button
              className={cn(
                bgGradient(),
                // Adjusted padding for mobile (px-12) vs desktop (md:px-24)
                "text-white w-full sm:w-auto px-12 md:px-24 py-6 md:py-8 rounded-full text-base md:text-xl font-semibold shadow-xl transition-all hover:scale-105 active:scale-95"
              )}
            >
              Get Started
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}