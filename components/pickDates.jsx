"use client"
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';

export default function PickDates({ dateRange, setDateRange }) {

    const currentYear = new Date().getFullYear();

    return (
        <div>
            <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                className="rounded-md border max-w-fit mx-auto"
                captionLayout="dropdown-buttons" 
                fromYear={1997} 
                toYear={currentYear + 1} 
            />
            <div className="mt-4">
                Selected Range: {dateRange?.from && format(dateRange.from, 'PP')} - {dateRange?.to && format(dateRange.to, 'PP')}
            </div>
        </div>
    )
}