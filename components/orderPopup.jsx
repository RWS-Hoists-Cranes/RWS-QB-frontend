'use client'
import { Check, ChevronsUpDown } from "lucide-react"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@radix-ui/react-label"
import { Input } from "./ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { Button } from "./ui/button"
import { useState } from "react"

const frameworks = [
    {
        value: "truck",
        label: "Our Truck",
    },
    {
        value: "purolator",
        label: "Purolator",
    },
    {
        value: "fedex",
        label: "FedEx",
    }
]

export default function OrderPopup() {
    const [orderNo, setOrderNo] = useState();
    const [po, setPo] = useState();
    const [shipVia, setShipVia] = useState('');
    const [billingType, setBillingType] = useState();
    const [notes, setNotes] = useState();

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("")


    async function fetchHtmlContent() {

    }

    return (
        <Dialog key={1}>
            <DialogTrigger asChild>
                <TableRow>
                    <TableCell className="font-medium">115A8426</TableCell>
                    <TableCell className="">DAVID112818</TableCell>
                    <TableCell className="">
                        39930
                    </TableCell>
                    <TableCell className="text-right">
                        2018-11-28
                    </TableCell>
                </TableRow>
            </DialogTrigger>
            <DialogContent className="min-w-fit">
                <DialogHeader>
                    <DialogTitle>Edit Order Form Information</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            RWS Order No.
                        </Label>
                        <Input
                            value={orderNo}
                            onChange={(e) => setOrderNo(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Customer Order No.
                        </Label>
                        <Input
                            value={po}
                            onChange={(e) => setPo(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Shipping Method
                        </Label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-[300px] justify-between"
                                >
                                    {value
                                        ? frameworks.find((framework) => framework.value === value)?.label
                                        : "Select shipping method..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search shipping method..." />
                                    <CommandList>
                                        <CommandEmpty>No shipping method found.</CommandEmpty>
                                        <CommandGroup>
                                            {frameworks.map((framework) => (
                                                <CommandItem
                                                    key={framework.value}
                                                    value={framework.value}
                                                    onSelect={(currentValue) => {
                                                        setValue(currentValue === value ? "" : currentValue)
                                                        setOpen(false)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            value === framework.value ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {framework.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Comments
                        </Label>
                        <Textarea
                            placeholder="Type your message here."
                            className="col-span-3 resize-y overflow-auto"
                        />
                    </div>

                </div>

                <DialogFooter>
                    <Button type="submit" onClick={fetchHtmlContent}>
                        Print Page
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}