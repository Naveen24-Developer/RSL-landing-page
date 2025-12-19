"use client";

import { useTripStore } from "@/store/useTripStore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

const PREDEFINED_DESTINATIONS = [
  { value: "dubai", label: "Dubai" },
  { value: "sharjah", label: "Sharjah" },
  { value: "abu-dhabi", label: "Abu Dhabi" },
];

export const DestinationSelector = () => {
  const { preferences, setPreferences } = useTripStore();

  const handleSelectDestination = (value: string) => {
    const destination = PREDEFINED_DESTINATIONS.find(
      (d) => d.value === value
    )?.label;
    setPreferences({ destination: destination || "Dubai" });
  };

  const handleClearDestination = () => {
    setPreferences({ destination: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-lg font-semibold">Heading to</label>
      </div>

      {preferences.destination ? (
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
          <span className="text-sm font-medium text-primary flex-1">
            {preferences.destination}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearDestination}
            className="h-5 w-5 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4 text-primary" />
          </Button>
        </div>
      ) : (
        <Select onValueChange={handleSelectDestination}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select destination" />
          </SelectTrigger>
          <SelectContent>
            {PREDEFINED_DESTINATIONS.map((destination) => (
              <SelectItem key={destination.value} value={destination.value}>
                {destination.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
