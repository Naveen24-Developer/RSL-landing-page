"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { textGradient, bgGradient } from "@/lib/utils";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="min-h-[40vh] xs:min-h-[60vh] sm:min-h-[62vh] md:min-h-[65vh] lg:min-h-[68vh] xl:min-h-[72vh] flex items-center justify-center bg-white pt-12 sm:pt-14 md:pt-16 lg:pt-20 xl:pt-24">
      <div className="text-center px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-4xl md:max-w-5xl mx-auto w-full ">
        {/* Main heading with unified fade-in */}
        <div className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <h1 
            className="text-2xl xs:text-2.5xl sm:text-3xl md:text-4xl lg:text-5xl lg:mt-40 xl:text-6xl font-bold text-black mb-3 xs:mb-3.5 sm:mb-4 md:mb-5 lg:mb-6 leading-tight tracking-tighter"
            style={{ letterSpacing: "0.01em" }}
          >
            Explore.<span className={`${textGradient()}`}>Experience</span>.Repeat.
          </h1>
        </div>

        {/* Subtitle lines - appear together */}
        <div className={`transition-all duration-700 ease-out delay-200 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-1.5 xs:mb-2 sm:mb-2.5 md:mb-3">
            Say goodbye to messy travel planning.
          </p>
          <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-medium text-black mb-5 xs:mb-6 sm:mb-8 md:mb-10 lg:mb-12">
            RSL makes every trip smooth and smart.
          </p>
        </div>

        {/* CTA Button */}
        <div className={`transition-all duration-700 ease-out delay-400 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          <Button
            size="lg"
            className={`${bgGradient()}  text-white px-4 xs:px-5 sm:px-6  md:px-8 lg:px-10 py-6.5 px-20  xs:py-3.5 sm:py-4 md:py-5 lg:py-6 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl rounded-full shadow hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group   max-w-[260px] xs:max-w-[280px] sm:max-w-[300px]  lg:w-80 md:max-w-[360px] lg:max-w-[400px] mx-auto`}
          >
<span className="
  text-base
  xs:text-sm
  sm:text-base
  md:text-lg
  flex items-center justify-center
  gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3
">
              Get Started with RSL AI
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
}