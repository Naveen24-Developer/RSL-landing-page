"use client";

import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import Dest from "@/assets/dest-1.png";
import Image1 from "@/assets/1.webp";
import Image2 from "@/assets/2.webp";
import Image3 from "@/assets/3.webp";
import Image4 from "@/assets/4.webp";
import Image5 from "@/assets/5.webp";
import Image6 from "@/assets/6.webp";

const DestinationGallery = () => {
  // Use the imported images directly
  const images = [Image1, Image2, Image3, Image4, Image5, Image6];

  const photoStyles = [
    { rotate: "-rotate-6", offset: "translate-y-2" },
    { rotate: "rotate-2", offset: "-translate-y-2" },
    { rotate: "rotate-8", offset: "translate-y-4" },
    { rotate: "-rotate-8", offset: "translate-y-1" },
    { rotate: "rotate-4", offset: "-translate-y-4" },
    { rotate: "-rotate-2", offset: "translate-y-2" },
  ];

  return (
    <section className="w-full bg-white py-12 md:py-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-0">
          
          {/* LEFT SECTION */}
          <div className="flex-1 w-full lg:pr-12 lg:border-r border-gray-100 relative">
            <div className="mb-12 relative z-20">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Finalize the places to visit
              </h2>
              <p className="text-gray-500 max-w-sm leading-relaxed">
                Get detailed information about each destination, including reviews, photos, and travel tips.
              </p>
            </div>
            
            <div className="relative inline-block w-full max-w-md">
              <div className="absolute inset-y-0 -left-3 w-24 md:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 -right-6 w-24 md:w-40 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

              <div className="grid grid-cols-3 sm:grid-cols-3 gap-x-2 gap-y-12 relative z-0 py-4">
                {images.map((src, index) => (
                  <Card
                    key={index}
                    className={` w-32 h-32 md:w-40 md:h-40 relative aspect-square overflow-hidden bg-white p-1  transition-all duration-300 ease-in-out hover:rotate-0 hover:scale-110 hover:z-50 cursor-pointer border-none ${photoStyles[index].rotate} ${photoStyles[index].offset}`}
                  >
                    <Image
                      src={src}
                      alt={`Place ${index + 1}`}
                      fill
                      className="object-cover rounded-xl border-7 border-gray-100 hover:border-white transition-all duration-300"
                    />
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex-[1.5] w-full lg:pl-12 relative">
            <div className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                And you are all set!
              </h2>
              <p className="text-gray-500 max-w-md leading-relaxed">
                And you are all set to go! RSL helps you plan your perfect trip.
              </p>
            </div>

            {/* <div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-50"> */}
              <img
                src={typeof Dest === "string" ? Dest : Dest.src}
                alt="Map Interface"
                className="w-full h-auto object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
            {/* </div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DestinationGallery;