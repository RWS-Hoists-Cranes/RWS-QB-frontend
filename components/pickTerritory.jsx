"use client"

import ClickableBox from "./ui/clickableBox";

import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { useState } from "react";
import { CommandList } from "cmdk";

const locations = [
    { value: "8105", label: "8105 | Ontario, CA" },
    { value: "8106", label: "8106 | Toronto, ON" },
    { value: "8107", label: "8107 | Vancouver, BC" },
    { value: "8108", label: "8108 | Montreal, QC" },
    { value: "8109", label: "8109 | Calgary, AB" },
    { value: "8110", label: "8110 | Edmonton, AB" },
    { value: "8111", label: "8111 | Ottawa, ON" },
    { value: "8112", label: "8112 | Quebec City, QC" },
    { value: "8113", label: "8113 | Winnipeg, MB" },
    { value: "8114", label: "8114 | Halifax, NS" },
    { value: "8115", label: "8115 | Saskatoon, SK" },
    { value: "8116", label: "8116 | Regina, SK" },
    { value: "8117", label: "8117 | St. John's, NL" },
]

export default function PickTerritory() {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")

    console.log("value is", value)

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
                <Command>
                    <CommandInput placeholder="Search location..." />
                    <CommandEmpty>No location found.</CommandEmpty>
                    <CommandGroup>
                        {locations.map((location => (
                            <CommandList key={location.value}>
                                <CommandItem
                                    value={location.value}
                                    onSelect={(currentValue) => {
                                        console.log("currentValue", currentValue);
                                        setValue(currentValue === value ? "" : currentValue)
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

                            </CommandList>
                        )))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}