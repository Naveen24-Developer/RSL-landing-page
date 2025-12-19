"use client";

import React from "react";
import Link from "next/link";
import { textGradient } from "@/lib/utils";
import footerImg from "@/assets/mask-footer.png";
import rslLogo from "@/assets/rsl-logo.png";

const footerLinks = {
  Pages: [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
  ],
  Socials: [
    { name: "Facebook", href: "#" },
    { name: "Instagram", href: "#" },
    { name: "Twitter", href: "#" },
    { name: "LinkedIn", href: "#" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
  Register: [
    { name: "Sign Up", href: "/signup" },
    { name: "Login", href: "/login" },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-white pt-12 sm:pt-16 md:pt-20 pb-0 overflow-hidden border-t border-gray-100">
      {/* 1. MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 relative z-20 mb-8 md:mb-10 lg:mb-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 md:gap-10 lg:gap-8">
          
          {/* Brand and Contact - Takes 2 columns on mobile, 2 on lg+ */}
          <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6 mb-6 sm:mb-0">
            <div className="flex items-center gap-3">
              {/* Footer Logo */}
              <img
                src={typeof rslLogo === "string" ? rslLogo : rslLogo.src}
                alt="RSL Logo"
                width={80}
                height={27}
                className="w-16 sm:w-20 md:w-24 h-auto object-contain"
              />
            </div>

            <div className="space-y-2">
              <p className="text-gray-500 text-sm sm:text-base">
                Contact:{" "}
                <a
                  href="mailto:hello@rsl.com"
                  className="hover:text-black transition-colors font-medium"
                >
                  hello@rsl.com
                </a>
              </p>
              <p className="text-gray-400 text-xs sm:text-sm">
                © copyright RSL {currentYear}. All rights reserved.
              </p>
            </div>
          </div>

          {/* Link Columns - Responsive layout */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-3 sm:space-y-4">
              <h4 className={`font-bold text-sm sm:text-base ${textGradient()}`}>
                {title}
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-gray-500 hover:text-black text-xs sm:text-sm md:text-base transition-colors duration-200 hover:underline hover:underline-offset-2"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 2. THE WATERMARK IMAGE - Fixed to be visible on all screens */}
      <div className="relative w-full mt-8 sm:mt-10 md:mt-12 pointer-events-none select-none z-10 overflow-visible">
        <div className="relative mx-auto w-full max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-xl">
          <img
            src={typeof footerImg === "string" ? footerImg : footerImg.src}
            alt="Footer Watermark"
            className="w-full h-auto opacity-80 max-h-24 sm:max-h-32 md:max-h-40 lg:max-h-48 object-contain"
            style={{
              minHeight: "60px", // Ensures it's visible even on very small screens
            }}
          />
        </div>
      </div>

    
    </footer>
  );
}