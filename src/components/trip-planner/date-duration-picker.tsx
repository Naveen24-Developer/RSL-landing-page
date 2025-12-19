"use client";

import { useTripStore } from "@/store/useTripStore";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Delete, Trash2 } from "lucide-react";
import { DateRange } from "react-day-picker";

export const DateDurationPicker = () => {
  const { preferences, setPreferences } = useTripStore();

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range) {
      setPreferences({
        dates: {
          from: range.from,
          to: range.to,
        },
      });
    }
  };

  const isDateSelected =
    preferences.dates.from !== undefined && preferences.dates.to !== undefined;


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-lg font-semibold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Date/Duration
        </label>
      </div>

      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start"
              >
                {isDateSelected ? (
                  <>
                    {format(preferences.dates.from!, "MMM dd, yyyy")} -{" "}
                    {format(preferences.dates.to!, "MMM dd, yyyy")}
                  </>
                ) : (
                  <span className="text-muted-foreground">Select date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={preferences.dates.from}
                selected={{
                  from: preferences.dates.from,
                  to: preferences.dates.to,
                }}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {isDateSelected && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setPreferences({
                dates: { from: undefined, to: undefined },
              })
            }
            className="text-xs text-muted-foreground"
          >
            Clear
            <Trash2 className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
