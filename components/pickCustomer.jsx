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

import { useEffect, useState } from "react"

export default function PickCustomer({value, setValue}) {
    const [open, setOpen] = useState(false);
    const [customers, setCustomers] = useState({})

    useEffect(() => {
        const getCustomers = async () => {
            const response = await fetch('http://localhost:8080/api/customers', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCustomers(data);
            } else {
                console.error('Error getting customers');
            }


        };

        getCustomers();
    }, [])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[300px] justify-between"
                >
                    {value || "Select customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command filter={(value, search) => {
                    if (value.toLowerCase().includes(search.toLowerCase())) return 1
                    return 0
                }}>
                    <CommandInput placeholder="Search customer..." />
                    <CommandEmpty>No customer found.</CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            {Object.keys(customers).map((customerName) => (
                                <CommandItem
                                    key={customerName}
                                    value={customerName}
                                    onSelect={() => {
                                        setValue(customerName === value ? "" : customerName)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === customerName ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {customerName}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
   )
}