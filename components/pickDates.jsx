"use client"
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { format, startOfMonth, endOfMonth } from 'date-fns';

export default function PickDates() {
    const [dateRange, setDateRange] = useState(() => {
        const now = new Date();
        return {
            from: startOfMonth(now),
            to: endOfMonth(now)
        };
    });

    return (
        <div>
            <div className="flex space-x-2 mb-4">

            </div>
            <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                className="rounded-md border max-w-fit mx-auto"

                captionLayout="dropdown-buttons" fromYear={1997} toYear={2024} />
            <div className="mt-4">
                Selected Range: {dateRange?.from && format(dateRange.from, 'PP')} - {dateRange?.to && format(dateRange.to, 'PP')}
            </div>
        </div>
    )
}