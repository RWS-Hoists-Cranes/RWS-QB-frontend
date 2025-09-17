"use client";
import { Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

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
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";
import { useState } from "react";

const frameworks = [
  {
    value: "truck",
    label: "Our Truck",
  },
  {
    value: "pickup",
    label: "Pickup",
  },
  {
    value: "other",
    label: "Other",
  },
];

export default function OrderPopup({ order, onUpdate }) {
  const router = useRouter();

  const [orderNumber, setOrderNumber] = useState(order.order_number);
  const [customerPO, setCustomerPO] = useState(order.customer_PO);
  const [shippingMethod, setShippingMethod] = useState(() => {
    const dbShippingMethod = order.shipping_method;
    if (!dbShippingMethod) return "truck";

    // Check if the stored value is a framework value
    const isFrameworkValue = frameworks.some(
      (f) => f.value === dbShippingMethod
    );
    if (isFrameworkValue) return dbShippingMethod;

    // Check if the stored value is a framework label (convert to value)
    const frameworkByLabel = frameworks.find(
      (f) => f.label === dbShippingMethod
    );
    if (frameworkByLabel) return frameworkByLabel.value;

    // Otherwise it's a custom value, so use "other"
    return "other";
  });
  const [customShippingText, setCustomShippingText] = useState(() => {
    const dbShippingMethod = order.shipping_method;
    if (!dbShippingMethod) return "";

    // If it's not a standard framework value or label, it's custom text
    const isStandardValue = frameworks.some(
      (f) => f.value === dbShippingMethod || f.label === dbShippingMethod
    );

    return isStandardValue ? "" : dbShippingMethod;
  });
  const [billingType, setBillingType] = useState(
    order.billing_type || "COLLECT"
  );
  const [comments, setComments] = useState(order.comments);
  const [quotationNumber, setQuotationNumber] = useState(
    order.quotation_number
  );
  const [dateOrdered, setDateOrdered] = useState(order.date_ordered);

  const [openShipMethod, setOpenShipMethod] = useState(false);
  const [value, setValue] = useState("");
  const [shipTo, setShipTo] = useState(() => {
    if (order.ship_to) return order.ship_to;

    // Default to estimate ship address
    const shipAddr = order.estimate?.ShipAddr;
    if (shipAddr) {
      const lines = [
        shipAddr.Line1,
        shipAddr.Line2,
        shipAddr.Line3,
        shipAddr.City
          ? `${shipAddr.City}${
              shipAddr.CountrySubDivisionCode
                ? ", " + shipAddr.CountrySubDivisionCode
                : ""
            } ${shipAddr.PostalCode || ""}`
          : "",
      ].filter(Boolean);
      return lines.join("\n");
    }
    return "";
  });

  const shippingMethods = [
    {
      value: "pickup",
      label: "Pickup",
    },
    {
      value: "other",
      label: "Other",
    },
  ];

  async function updateDatabase() {
    try {
      const finalShippingMethod =
        shippingMethod === "other" ? customShippingText : shippingMethod;

      const response = await fetch("http://localhost:8080/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_number: orderNumber,
          quotation_number: quotationNumber,
          shipping_method: finalShippingMethod,
          customer_PO: customerPO,
          comments: comments,
          billing_type: billingType,
          ship_to: shipTo,
        }),
      });

      if (onUpdate) onUpdate();

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
    } catch (error) {
      console.error("Error updating order:", error);
    }
  }

  async function displayOrderHTML() {
    updateDatabase();

    const finalShippingMethod =
      shippingMethod === "other" ? customShippingText : shippingMethod;

    try {
      const response = await fetch("http://localhost:8080/api/orderHTML", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber,
          customerPO,
          shippingMethod: finalShippingMethod,
          billingType,
          comments,
          quotationNumber,
          dateOrdered,
          order,
          ship_to: shipTo,
        }),
      });
      const html = await response.text();
      openHtmlInNewTab(html);
    } catch (error) {
      console.error("Error fetching HTML:", error);
    }
  }

  const openHtmlInNewTab = (htmlContent) => {
    const newWindow = window.open("");
    newWindow.document.write(htmlContent);
    newWindow.document.close();

    const checkReady = () => {
      if (newWindow.document.readyState === "complete") {
        setTimeout(() => {
          newWindow.print();
          newWindow.close();
        }, 300);
      } else {
        setTimeout(checkReady, 100);
      }
    };

    checkReady();
  };

  const printPackingSlip = async () => {
    const finalShippingMethod =
      shippingMethod === "other" ? customShippingText : shippingMethod;

    try {
      const response = await fetch(
        "http://localhost:8080/api/orderPackingSlipHTML",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderNumber,
            customerPO,
            shippingMethod: finalShippingMethod,
            billingType,
            comments,
            quotationNumber,
            dateOrdered,
            order,
            ship_to: shipTo,
          }),
        }
      );
      const html = await response.text();
      openHtmlInNewTab(html);
    } catch (error) {
      console.error("Error fetching packing slip HTML:", error);
    }
  };

  return (
    <Dialog key={1}>
      <DialogTrigger asChild>
        <TableRow>
          <TableCell className="font-medium">{orderNumber}</TableCell>
          <TableCell className="">{customerPO}</TableCell>
          <TableCell className="">{quotationNumber}</TableCell>
          <TableCell className="text-right">
            {dateOrdered.split("T")[0]}
          </TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    printPackingSlip();
                  }}
                >
                  Print Packing Slip
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(
                      `/invoice?estimate_no=${quotationNumber}&estimate_id=${order.estimate.Id}`
                    );
                  }}
                >
                  Create an invoice
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </DialogTrigger>
      <DialogContent className="min-w-fit">
        <DialogHeader>
          <DialogTitle>Edit Order Form Information</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shipTo" className="text-right">
              Ship To Address
            </Label>
            <Textarea
              id="shipTo"
              placeholder="Enter ship to address..."
              className="col-span-3 resize-y overflow-auto"
              value={shipTo}
              onChange={(e) => setShipTo(e.target.value)}
            />
          </div>

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
            <Popover open={openShipMethod} onOpenChange={setOpenShipMethod}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openShipMethod}
                  className="w-[300px] justify-between"
                >
                  {(() => {
                    if (!shippingMethod) return "Select shipping method...";

                    // First try to find by value
                    const found = frameworks.find(
                      (framework) => framework.value === shippingMethod
                    );

                    if (found) return found.label;

                    // If not found, it's likely a custom shipping method
                    return shippingMethod;
                  })()}
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
                            setShippingMethod(
                              currentValue === shippingMethod
                                ? ""
                                : currentValue
                            );
                            setOpenShipMethod(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              shippingMethod === framework.value
                                ? "opacity-100"
                                : "opacity-0"
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

          {shippingMethod === "other" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customShipping" className="text-right">
                Custom Shipping
              </Label>
              <Input
                id="customShipping"
                value={customShippingText}
                onChange={(e) => setCustomShippingText(e.target.value)}
                className="col-span-3"
                placeholder="Enter custom shipping method"
              />
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Billing Type
            </Label>
            <RadioGroup
              defaultValue={billingType || "COLLECT"}
              className="col-span-3 flex justify-between"
              onValueChange={(value) => {
                setBillingType(value);
              }}
            >
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
          <DialogClose asChild>
            <Button variant="outline" onClick={updateDatabase}>
              Save and Close
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" onClick={displayOrderHTML}>
              Save and Print Order
            </Button>
          </DialogClose>
          <Button onClick={printPackingSlip}>Print Packing Slip</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
