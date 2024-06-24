"use client"
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { addDays, format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from "@/components/ui/scroll-area"

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const startYear = 1997;
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);


export default function PickDates() {
    const [dateRange, setDateRange] = useState({
        from: new Date(),
        to: addDays(new Date(), 7)
    });

    console.log(dateRange)
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