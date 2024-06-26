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

import { useState } from "react"

const service = [
    { value: "111", label: "111 | SGTR Crane" },
    { value: "112", label: "112 | SGUR Crane" },
    { value: "113", label: "113 | DGTR Crane" },
    { value: "114", label: "114 | DGUR Crane" },
    { value: "115", label: "115 | Gantry Crane" },
    { value: "116", label: "116 | Jib Crane" },
];

export default function PickService({value, setValue}) {
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
                        ? service.find((location) => location.value === value)?.label
                        : "Select service..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command filter={(value, search) => {
                    if (value.includes(search.toLowerCase())) return 1
                    return 0
                }}>
                    <CommandInput placeholder="Search service..." />
                    <CommandEmpty>No location found.</CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            {service.map((location) => (
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