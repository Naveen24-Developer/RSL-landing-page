"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import rslLogo from "@/assets/rsl-logo.png";
import { cn } from "@/lib/utils";
import { bgGradient, bgLogin } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger early for a responsive feel
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize (optional)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 lg:px-8 pointer-events-none">
      <nav
        className={cn(
          "pointer-events-auto flex flex-col overflow-hidden transition-all duration-1300 ease-[cubic-bezier(0.23,1,0.32,1)] mx-auto",
          scrolled
            ? "mt-2 sm:mt-3 md:mt-4 lg:mt-5 w-[95%] sm:w-[90%] md:w-[85%] lg:w-[800px] bg-white/70 backdrop-blur-md shadow border border-gray/40 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] translate-y-2"
            : "w-full bg-transparent border-transparent rounded-none translate-y-0"
        )}
      >
        <div className={cn(
          "flex items-center justify-between transition-all duration-700 ease-in-out",
          scrolled ? "py-2 px-4 sm:py-2.5 sm:px-5 md:py-2.5 md:px-6" : "py-4 px-4 sm:py-5 sm:px-6 md:py-5 md:px-8"
        )}>
          
          {/* Logo & Brand Section */}
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="shrink-0 transition-all duration-900 ease-in-out">
              <img
                src={typeof rslLogo === "string" ? rslLogo : rslLogo.src}
                alt="RSL Logo"
                width={scrolled ? "32" : "40"}
                height={scrolled ? "32" : "40"}
                className="object-contain w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
              />
            </div>
            
            {/* Smooth width/opacity transition instead of AnimatePresence */}
            <div className={cn(
              "transition-all duration-900 ease-in-out flex items-center overflow-hidden whitespace-nowrap",
              scrolled ? "max-w-0 opacity-0" : "max-w-[100px] opacity-100"
            )}>
              
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-gray-100/50 transition-colors duration-300"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 mt-1.5 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 mt-1.5 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>

          {/* Actions Container */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Button
              variant="ghost"
              className={cn(
                "text-gray-900 hover:bg-black/5 rounded-full transition-all duration-800",
                scrolled ? "h-8 px-3 text-xs lg:text-sm" : "h-10 px-4 lg:px-5 text-sm lg:text-base"
              )}
            >
              Login
            </Button>

            <Button
              className={cn(
                "rounded-full group text-sm lg:text-base",
                scrolled
                  ? cn(bgGradient(), "text-white shadow-lg px-4 lg:px-6")
                  : cn(bgGradient(), "ring-1 ring-gray-100 hover:text-white transition-colors duration-900 px-5 lg:px-7")
              )}
            >
              <span className={cn(scrolled ? "" : "group-hover:text-white")}>Get Started</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden flex flex-col gap-4 px-4 pb-4 pt-2 bg-white/90 backdrop-blur-sm border-t border-gray-200/50">
            <div className="W-full rounded-lg border pl-5 pr-5">
            <Button
              variant="ghost"
              className={cn("w-full mt-5 mb-5 rounded-full group justify-center",cn(bgLogin(), "text-black border shadow hover:bg-black/5  py-3 text-base"))}
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Button>
            <Button
              className={cn(
                "w-full mb-5 rounded-full group text-base",
                cn(bgGradient(), "text-white shadow-lg py-3")
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Button>
          </div>
          </div>
        )}
      </nav>
    </header>
  );
}