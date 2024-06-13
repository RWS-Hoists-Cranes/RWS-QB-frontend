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

export default function OrderPopup({ order }) {
    const [orderNumber, setOrderNumber] = useState(order.order_number);
    const [customerPO, setCustomerPO] = useState(order.customer_PO);
    const [shippingMethod, setShippingMethod] = useState(order.shipping_method);
    const [billingType, setBillingType] = useState(order.billing_type);
    const [comments, setComments] = useState(order.comments);
    const [quotationNumber, setQuotationNumber] = useState(order.quotation_number);
    const [dateOrdered, setDateOrdered] = useState(order.date_ordered);

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("")

    async function updateDatabase() {
        try {
            const response = await fetch('http://localhost:8080/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    order_number: orderNumber,
                    quotation_number: quotationNumber,
                    shipping_method: shippingMethod,
                    customer_PO: customerPO,
                    comments: comments,
                    billing_type: billingType,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Order updated:', data);
        } catch (error) {
            console.error('Error updating order:', error);
        }
    }


    async function displayOrderHTML() {
        updateDatabase();
    }

    return (
        <Dialog key={1}>
            <DialogTrigger asChild>
                <TableRow>
                    <TableCell className="font-medium">{orderNumber}</TableCell>
                    <TableCell className="">{customerPO}</TableCell>
                    <TableCell className="">
                        {quotationNumber}
                    </TableCell>
                    <TableCell className="text-right">
                        {dateOrdered.split('T')[0]}
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
                            value={orderNumber}
                            onChange={(e) => setOrderNumber(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Customer Order No.
                        </Label>
                        <Input
                            value={customerPO}
                            onChange={(e) => setCustomerPO(e.target.value)}
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
                            Billing Type
                        </Label>
                        <RadioGroup defaultValue={billingType} className="col-span-3 flex justify-between" onValueChange={(value) => { setBillingType(value) }}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="PREPAID" id="r1" />
                                <Label htmlFor="r1">PREPAID</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="COLLECT" id="r2" />
                                <Label htmlFor="r2">COLLECT</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="PREPAID_CHARGE" id="r3" />
                                <Label htmlFor="r3">PREPAID & CHARGE</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Comments
                        </Label>
                        <Textarea
                            placeholder="Type your message here."
                            className="col-span-3 resize-y overflow-auto"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button type="submit" onClick={displayOrderHTML}>
                        Print Page
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}