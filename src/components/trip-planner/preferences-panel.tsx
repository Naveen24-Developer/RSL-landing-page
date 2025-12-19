"use client";

import { useTripStore } from "@/store/useTripStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface PreferencesOption {
  id: string;
  label: string;
  icon: string;
}

const WITH_WHOM_OPTIONS: PreferencesOption[] = [
  { id: "solo", label: "Solo", icon: "🧍" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
  { id: "couple", label: "Couple", icon: "👫" },
  { id: "friends", label: "Friends", icon: "👥" },
  { id: "elderly", label: "Elderly", icon: "👴" },
];

const TRAVEL_STYLE_OPTIONS: PreferencesOption[] = [
  { id: "cultural", label: "Cultural", icon: "🏛️" },
  { id: "classic", label: "Classic", icon: "✨" },
  { id: "nature", label: "Nature", icon: "🌿" },
  { id: "cityscape", label: "Cityscape", icon: "🏙️" },
  { id: "historical", label: "Historical", icon: "🏰" },
];

const TRAVEL_PACE_OPTIONS: PreferencesOption[] = [
  { id: "ambitious", label: "Ambitious", icon: "🚀" },
  { id: "relaxed", label: "Relaxed", icon: "🌴" },
];

const ACCOMMODATION_OPTIONS: PreferencesOption[] = [
  { id: "comfort", label: "Comfort", icon: "🏨" },
  { id: "premium", label: "Premium", icon: "⭐" },
  { id: "luxury", label: "Luxury", icon: "👑" },
];

interface PreferencesPanelProps {
  onClose?: () => void;
}

export const PreferencesPanel = ({ onClose }: PreferencesPanelProps) => {
  const { preferences, setPreferences } = useTripStore();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    withWhom: true,
    travelStyle: true,
    travelPace: true,
    accommodation: true,
    otherNeeds: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleOptionToggle = (
    optionId: string,
    category: "tripType" | "interests" | "budget"
  ) => {
    if (category === "tripType") {
      setPreferences({
        tripType: preferences.tripType === optionId ? "solo" : (optionId as any),
      });
    } else if (category === "interests") {
      const newInterests = preferences.interests.includes(optionId)
        ? preferences.interests.filter((id) => id !== optionId)
        : [...preferences.interests, optionId];
      setPreferences({ interests: newInterests });
    } else if (category === "budget") {
      setPreferences({
        budget:
          preferences.budget === optionId ? "all" : (optionId as any),
      });
    }
  };

  const renderOptionGroup = (
    title: string,
    options: PreferencesOption[],
    sectionKey: string,
    category: "tripType" | "interests" | "budget",
    isMultiSelect: boolean = true
  ) => (
    <div className="space-y-3">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-sm font-semibold hover:text-primary transition-colors"
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            expandedSections[sectionKey] ? "rotate-180" : ""
          }`}
        />
      </button>

      {expandedSections[sectionKey] && (
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => {
            const isSelected =
              category === "tripType"
                ? preferences.tripType === option.id
                : category === "interests"
                  ? preferences.interests.includes(option.id)
                  : preferences.budget === option.id;

            return (
              <Button
                key={option.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleOptionToggle(option.id, category)}
                className="flex items-center gap-2 justify-start text-xs h-auto py-2"
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* With Whom Section */}
      {renderOptionGroup(
        "With Whom",
        WITH_WHOM_OPTIONS,
        "withWhom",
        "tripType",
        false
      )}

      {/* Travel Style Section */}
      {renderOptionGroup(
        "Travel Style",
        TRAVEL_STYLE_OPTIONS,
        "travelStyle",
        "interests",
        true
      )}

      {/* Travel Pace Section */}
      {renderOptionGroup(
        "Travel Pace",
        TRAVEL_PACE_OPTIONS,
        "travelPace",
        "interests",
        true
      )}

      {/* Accommodation Section */}
      {renderOptionGroup(
        "Accommodation",
        ACCOMMODATION_OPTIONS,
        "accommodation",
        "budget",
        false
      )}

      {/* Other Needs Section */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection("otherNeeds")}
          className="flex items-center justify-between w-full text-sm font-semibold hover:text-primary transition-colors"
        >
          <span>Other Needs</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              expandedSections["otherNeeds"] ? "rotate-180" : ""
            }`}
          />
        </button>

        {expandedSections["otherNeeds"] && (
          <div className="space-y-2">
            <Textarea
              placeholder="Enter more preferences here"
              className="min-h-24 text-sm resize-none"
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground text-right">
              0/1000
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setPreferences({
              tripType: "solo",
              interests: [],
              budget: "medium",
            })
          }
          className="flex-1"
        >
          Clear
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onClose?.()}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};
