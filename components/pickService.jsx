"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useState } from "react";

const service = [
  { value: "111", label: "111 | SGTR CRANE" },
  { value: "112", label: "112 | SGUR CRANE" },
  { value: "113", label: "113 | DGTR CRANE" },
  { value: "114", label: "114 | DGUR CRANE" },
  { value: "115", label: "115 | GANTRY CRANE" },
  { value: "116", label: "116 | JIB CRANE" },
  { value: "119", label: "119 | MISCELLANEOUS CRANES" },
  { value: "120", label: "120 | END TRUCKS AND COMPONENTS" },
  { value: "124", label: "124 | CRANE PARTS" },
  { value: "125", label: "125 | INSTALLATION AND COMMISSION" },
  { value: "131", label: "131 | I-BEAM MONORAIL" },
  { value: "133", label: "133 | TONGUE SWITCHES" },
  { value: "134", label: "134 | STUB SWITCHES" },
  { value: "135", label: "135 | TURN TABLES" },
  { value: "139", label: "139 | MISCELLANEOUS MONORAIL" },
  { value: "142", label: "142 | HAND CHAIN HOIST - KITO" },
  { value: "143", label: "143 | ELECTRIC CH - KITO" },
  { value: "144", label: "144 | VERLINDE - EWRH" },
  { value: "146", label: "146 | PUSH TROLLEY - KITO" },
  { value: "147", label: "147 | GEARED TROLLEY - KITO" },
  { value: "148", label: "148 | MOTORIZED TROLLEY - KITO - EWRH" },
  { value: "149", label: "149 | VERLINDE PARTS" },
  { value: "150", label: "150 | KITO PARTS" },
  { value: "151", label: "151 | COFF - HOIST PRODUCTS" },
  { value: "152", label: "152 | COFF - HOIST PARTS" },
  { value: "155", label: "155 | CLAMPS AND HANGERS" },
  { value: "156", label: "156 | RUNWAYS" },
  { value: "157", label: "157 | MIS. & YALE - HOIST PRODUCTS" },
  { value: "158", label: "158 | MIS. & YALE - HOIST PARTS" },
  { value: "160", label: "160 | CUSTOM JOBS, SLR DAVITS" },
  { value: "170", label: "170 | PARTS - VITAL" },
  { value: "171", label: "171 | LEVER HOIST - VITAL" },
  { value: "172", label: "172 | HCH VITAL" },
  { value: "176", label: "176 | PUSH TROLLEY - VITAL" },
  { value: "177", label: "177 | GEARED TROLLEY - VITAL" },
  { value: "180", label: "180 | RENTAL" },
  { value: "181", label: "181 | STAHL EWRH" },
  { value: "182", label: "182 | HOIST SERVICE" },
  { value: "183", label: "183 | HOIST INSPECTION" },
  { value: "184", label: "184 | R-W HARDWARE" },
  { value: "185", label: "185 | CROSBY - JDN - ARO AIR HOIST" },
  { value: "188", label: "188 | SUPERWHINCH, THERN" },
  { value: "190", label: "190 | OTHER INCOME, ENGINEERING" },
  { value: "199", label: "199 | EXPORT SALES" },
];

export default function PickService({ value, setValue }) {
  const [open, setOpen] = useState(false);

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
        <Command
          filter={(value, search) => {
            if (value.includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <CommandInput placeholder="Search service..." />
          <CommandEmpty>No service found.</CommandEmpty>
          <CommandList className="max-h-[200px] overflow-y-auto">
            <CommandGroup>
              {service.map((location) => (
                <CommandItem
                  key={location.value}
                  value={location.label.toLowerCase()}
                  onSelect={() => {
                    setValue(location.value === value ? "" : location.value);
                    setOpen(false);
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
  );
}
