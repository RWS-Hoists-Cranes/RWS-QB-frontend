"use client"

import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { useState } from "react";

const locations = [
    { value: "6903", label: "6903 | Alberta" },
    { value: "7003", label: "7003 | B.C." },
    { value: "6703", label: "6703 | Manitoba" },
    { value: "6203", label: "6203 | New Brunswick" },
    { value: "6303", label: "6303 | Newfoundland" },
    { value: "6003", label: "6003 | Nova Scotia" },
    { value: "6503", label: "6503 | Ontario" },
    { value: "61103", label: "61103 | P.E.I." },
    { value: "6403", label: "6403 | Quebec" },
    { value: "6803", label: "6803 | Saskatchewan" },
    { value: "7103", label: "7103 | USA" },
    { value: "7203", label: "7203 | Overseas & Exports" },
    { value: "7403", label: "7403 | Northwest Territories" },
];

export default function PickTerritory({value, setValue}) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[300px] justify-between"
                >
                    {value
                        ? locations.find((location) => location.value === value)?.label
                        : "Select location..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command filter={(value, search) => {
                    if (value.includes(search.toLowerCase())) return 1
                    return 0
                }}>
                    <CommandInput placeholder="Search location..." />
                    <CommandEmpty>No location found.</CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            {locations.map((location) => (
                                <CommandItem
                                    key={location.value}
                                    value={location.label.toLowerCase()}
                                    onSelect={() => {
                                        setValue(location.value === value ? "" : location.value)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === location.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {location.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}