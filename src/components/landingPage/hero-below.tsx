"use client";

import { useState, useEffect } from "react";
import heroBelow from "@/assets/hero-below.png";

export default function HowItWorksVisual() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="bg-white py-10 xs:py-12 sm:py-14 md:py-16 lg:py-18 xl:py-20 2xl:py-24">
      <div className="mx-auto max-w-7xl px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div
          className={`relative mx-auto w-full max-w-4xl xs:max-w-5xl sm:max-w-6xl transition-all duration-1000 ease-out ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 xs:translate-y-6"
          }`}
        >
          <div className="relative group">
            <img
              src={typeof heroBelow === "string" ? heroBelow : heroBelow.src}
              alt="How RSL Works - Visual Demonstration"
              className="
                w-full
                h-auto
                object-contain
                rounded-md
                xs:rounded-lg
                sm:rounded-xl
                md:rounded-2xl
                lg:rounded-3xl
                shadow-sm
                xs:shadow-md
                sm:shadow-lg
                md:shadow-xl
                lg:shadow-xl
                transition-all
                duration-500
                ease-in-out
                group-hover:shadow-xl
                group-hover:md:shadow-xl
                group-hover:scale-[1.002]
                border
                border-gray-100/50
              "
              sizes="(max-width: 375px) 95vw, (max-width: 480px) 92vw, (max-width: 640px) 90vw, (max-width: 768px) 88vw, (max-width: 1024px) 85vw, 1200px"
              loading="lazy"
            />
            
            {/* Subtle gradient overlay on hover for larger screens */}
            <div className="
              absolute
              inset-0
              rounded-md
              xs:rounded-lg
              sm:rounded-xl
              md:rounded-2xl
              lg:rounded-3xl
              bg-gradient-to-t
              from-white/5
              via-transparent
              to-transparent
              opacity-0
              group-hover:opacity-100
              transition-opacity
              duration-500
              pointer-events-none
              hidden
              md:block
            "></div>
            
            {/* Decorative corner accents for larger screens */}
            <div className="
              absolute
              -top-2
              -left-2
              w-4
              h-4
              xs:w-6
              xs:h-6
              border-t-2
              border-l-2
              border-blue-400/30
              rounded-tl
              hidden
              xs:block
            "></div>
            <div className="
              absolute
              -top-2
              -right-2
              w-4
              h-4
              xs:w-6
              xs:h-6
              border-t-2
              border-r-2
              border-blue-400/30
              rounded-tr
              hidden
              xs:block
            "></div>
            <div className="
              absolute
              -bottom-2
              -left-2
              w-4
              h-4
              xs:w-6
              xs:h-6
              border-b-2
              border-l-2
              border-blue-400/30
              rounded-bl
              hidden
              xs:block
            "></div>
            <div className="
              absolute
              -bottom-2
              -right-2
              w-4
              h-4
              xs:w-6
              xs:h-6
              border-b-2
              border-r-2
              border-blue-400/30
              rounded-br
              hidden
              xs:block
            "></div>
          </div>
          
          
        </div>
      </div>
    </section>
  );
}