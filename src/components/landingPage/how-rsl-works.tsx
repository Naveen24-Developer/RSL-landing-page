import { textGradient } from "lib/utils";
import Image from "next/image";
import TripPlanner from "@/assets/Trip.Planner-1.png";
import RslMobileView from "@/assets/rsl-mobile-view.png";

export default function HowItWorks() {
  return (
    <section className="py-8 md:py-12 lg:py-16 xl:py-20 bg-white overflow-visible">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl">
        <div className="text-center mb-8 md:mb-10 lg:mb-12 xl:mb-16">
          <h2
            className={`text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 lg:mb-6 ${textGradient()}`}
          >
            How RSL works
          </h2>
          <p className="text-gray-600 text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl max-w-xs xs:max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-2 xs:px-4 sm:px-6">
            Planning a trip has never been this easy. Here's how RSL turns ideas
            into itineraries.
          </p>
        </div>

        <div className="relative min-h-[300px] xs:min-h-[350px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px] xl:min-h-[600px] 2xl:min-h-[650px]">
          {/* Vertical shadow line in the center */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent transform -translate-x-1/2 hidden lg:block"></div>

          {/* Content container */}
          <div className="flex flex-col lg:flex-row h-full items-center justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16">
            {/* Left half - Mobile Image */}
            <div className="w-full lg:w-1/2 lg:pr-4 xl:pr-8 2xl:pr-12 flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-[280px] xs:max-w-[300px] sm:max-w-[340px] md:max-w-[380px] lg:max-w-[420px] xl:max-w-[460px] 2xl:max-w-[500px]">
                <img
                  src={
                    typeof TripPlanner === "string"
                      ? TripPlanner
                      : TripPlanner.src
                  }
                  alt="RSL mobile app"
                  width={500}
                  height={866}
                  className="w-full h-auto drop-shadow-lg hover:drop-shadow-2xl transition-all duration-500 ease-in-out hover:scale-[1.02]"
                  sizes="(max-width: 375px) 280px, (max-width: 480px) 300px, (max-width: 640px) 340px, (max-width: 768px) 380px, (max-width: 1024px) 420px, (max-width: 1280px) 460px, 500px"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right half - Mobile Image */}
            <div className="w-full lg:w-1/2 lg:pl-4 xl:pl-8 2xl:pl-12 flex items-center justify-center lg:justify-start mt-6 sm:mt-8 lg:mt-0">
              <div className="relative w-full max-w-[280px] xs:max-w-[300px] sm:max-w-[340px] md:max-w-[380px] lg:max-w-[420px] xl:max-w-[460px] 2xl:max-w-[500px]">
                <img
                  src={
                    typeof RslMobileView === "string"
                      ? RslMobileView
                      : RslMobileView.src
                  }
                  alt="RSL mobile app"
                  width={500}
                  height={866}
                  className="
                    w-full h-auto drop-shadow-lg hover:drop-shadow-2xl transition-all duration-500 ease-in-out hover:scale-[1.02]
                    border border-white/20
                    [-webkit-mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]
                    [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]
                  "
                  sizes="(max-width: 375px) 280px, (max-width: 480px) 300px, (max-width: 640px) 340px, (max-width: 768px) 380px, (max-width: 1024px) 420px, (max-width: 1280px) 460px, 500px"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Optional: Add decorative elements for larger screens */}
          <div className="hidden lg:flex absolute -top-8 left-0 right-0 justify-between items-center pointer-events-none">
            <div className="w-32 h-1 bg-gradient-to-r from-transparent to-blue-200/30 rounded-full opacity-50"></div>
            <div className="w-32 h-1 bg-gradient-to-l from-transparent to-blue-200/30 rounded-full opacity-50"></div>
          </div>
        </div>

        {/* Optional: Add responsive bottom spacing */}
       
      </div>
    </section>
  );
}