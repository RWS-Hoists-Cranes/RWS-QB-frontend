"use client";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";

export default function PickDates({ dateRange, setDateRange }) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-4">
      <Card className="border-0 bg-slate-50/50 dark:bg-slate-800/50">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={setDateRange}
          className="rounded-lg border-0 max-w-full mx-auto"
          captionLayout="dropdown-buttons"
          fromYear={1997}
          toYear={currentYear + 1}
        />
      </Card>
      {dateRange?.from && dateRange?.to && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 text-center">
            Selected Range
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300 text-center mt-1">
            {format(dateRange.from, "PP")} - {format(dateRange.to, "PP")}
          </p>
        </div>
      )}
    </div>
  );
}
