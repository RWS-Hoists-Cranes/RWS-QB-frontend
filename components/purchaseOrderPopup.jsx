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

const shippingMethods = [
  {
    value: "truck",
    label: "Your Truck",
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

export default function PurchaseOrderPopup({ purchaseOrder, onUpdate }) {
  const router = useRouter();

  const [poNumber, setPoNumber] = useState(purchaseOrder.DocNumber || "");
  const [vendorName, setVendorName] = useState(
    purchaseOrder.VendorRef?.name || ""
  );
  const [shippingMethod, setShippingMethod] = useState(
    purchaseOrder.dbData?.shipping_method || "truck"
  );
  const [customShippingText, setCustomShippingText] = useState(
    purchaseOrder.dbData?.shipping_method &&
      !["truck", "pickup"].includes(purchaseOrder.dbData?.shipping_method)
      ? purchaseOrder.dbData?.shipping_method
      : ""
  );
  const [billingType, setBillingType] = useState(
    purchaseOrder.dbData?.billing_type || "DAYS"
  );

  const [comments, setComments] = useState(
    purchaseOrder.dbData?.comments || ""
  );
  const [orderNumber, setOrderNumber] = useState(
    purchaseOrder.dbData?.order_number || ""
  );
  const [dateOrdered, setDateOrdered] = useState(purchaseOrder.TxnDate || "");
  const [openShipMethod, setOpenShipMethod] = useState(false);
  const [isFreight, setIsFreight] = useState(
    purchaseOrder.dbData?.isFreight || false
  );
  const [shipFrom, setShipFrom] = useState(
    purchaseOrder.dbData?.ship_from || ""
  );
  const [shipTo, setShipTo] = useState(purchaseOrder.dbData?.ship_to || "");
  const [dimensions, setDimensions] = useState(
    purchaseOrder.dbData?.dimensions || ""
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pickupDate, setPickupDate] = useState(
    purchaseOrder.dbData?.pickupDate
      ? new Date(purchaseOrder.dbData.pickupDate).toISOString().slice(0, 16)
      : ""
  );

  async function updateDatabase() {
    try {
      const finalShippingMethod =
        shippingMethod === "other" ? customShippingText : shippingMethod;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/purchaseorder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            po_number: poNumber,
            order_number: orderNumber,
            vendor_name: vendorName,
            shipping_method: finalShippingMethod,
            comments: comments,
            billing_type: billingType,
            isFreight: isFreight,
            ship_from: shipFrom,
            ship_to: shipTo,
            dimensions: dimensions,
            pickupDate: pickupDate,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error updating purchase order:", errorData);
        return;
      }

      const updatedData = await res.json();
      console.log("Database update successful:", updatedData.comments);

      // Call onUpdate callback to refresh parent component data
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error updating purchase order:", error);
    }
  }

  async function displayPurchaseOrderHTML() {
    updateDatabase();

    const finalShippingMethod =
      shippingMethod === "other" ? customShippingText : shippingMethod;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/purchaseOrderHTML`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            poNumber,
            orderNumber,
            vendorName,
            shippingMethod: finalShippingMethod,
            comments,
            dateOrdered,
            purchaseOrder,
            billingType,
            isFreight,
            ship_from: shipFrom,
            ship_to: shipTo,
            dimensions: dimensions,
            pickupDate: pickupDate,
          }),
        }
      );

      const html = await res.text();
      openHtmlInNewTab(html);
    } catch (error) {
      console.error("Error fetching purchase order:", error);
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

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} key={poNumber}>
      <DialogTrigger asChild>
        <TableRow onClick={() => setIsDialogOpen(true)}>
          <TableCell className="font-medium">{poNumber}</TableCell>
          <TableCell className="">{vendorName}</TableCell>
          <TableCell className="">{orderNumber}</TableCell>
          <TableCell className="text-right">
            {purchaseOrder.TxnDate?.split("T")[0] || "N/A"}
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
                    displayPurchaseOrderHTML();
                  }}
                >
                  Print Purchase Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </DialogTrigger>
      <DialogContent className="min-w-fit max-w-4xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Purchase Order Information</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="grid grid-cols-3 items-center gap-2">
              <Label htmlFor="poNumber" className="text-right font-medium">
                PO Number
              </Label>
              <Input
                id="poNumber"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="col-span-2"
                disabled
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-2">
              <Label htmlFor="vendorName" className="text-right font-medium">
                Vendor Info
              </Label>
              <Input
                id="vendorName"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="col-span-2"
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="grid grid-cols-3 items-center gap-2">
              <Label htmlFor="orderNumber" className="text-right font-medium">
                R.W.S. JOB NO.
              </Label>
              <Input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="col-span-2"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-2">
              <Label
                htmlFor="shippingMethod"
                className="text-right font-medium"
              >
                Shipping Method
              </Label>
              <div className="col-span-2">
                <Popover open={openShipMethod} onOpenChange={setOpenShipMethod}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openShipMethod}
                      className="w-full justify-between"
                    >
                      {shippingMethod
                        ? shippingMethods.find(
                            (method) => method.value === shippingMethod
                          )?.label
                        : "Select shipping method..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search shipping method..." />
                      <CommandList>
                        <CommandEmpty>No shipping method found.</CommandEmpty>
                        <CommandGroup>
                          {shippingMethods.map((method) => (
                            <CommandItem
                              key={method.value}
                              value={method.value}
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
                                  shippingMethod === method.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {method.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {shippingMethod === "other" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="customShipping"
                className="text-right font-medium"
              >
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
            <Label htmlFor="terms" className="text-right font-medium">
              Terms
            </Label>
            <RadioGroup
              defaultValue={billingType || "DAYS"}
              className="col-span-3 flex justify-start gap-8"
              onValueChange={(value) => {
                setBillingType(value);
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DAYS" id="r1" />
                <Label htmlFor="r1" className="font-normal">
                  30 DAYS
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="COD" id="r2" />
                <Label htmlFor="r2" className="font-normal">
                  COD
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="OTHER" id="r3" />
                <Label htmlFor="r3" className="font-normal">
                  OTHER
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 w-full max-w-2xl">
              <Label
                htmlFor="comments"
                className="font-medium whitespace-nowrap min-w-[100px] text-right"
              >
                Comments
              </Label>
              <Textarea
                id="comments"
                placeholder="Type your message here."
                className="flex-1 resize-y overflow-auto"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="freight"
                checked={isFreight}
                onChange={(e) => setIsFreight(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="freight" className="text-sm font-medium">
                Freight Order
              </Label>
            </div>
          </div>

          {isFreight && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4 w-full max-w-2xl">
                <Label
                  htmlFor="shipFrom"
                  className="font-medium whitespace-nowrap min-w-[100px] text-right"
                >
                  Ship From
                </Label>
                <Textarea
                  id="shipFrom"
                  value={shipFrom}
                  onChange={(e) => setShipFrom(e.target.value)}
                  className="flex-1"
                  rows="3"
                  placeholder="Enter address name, phone #, and hours"
                />
              </div>

              <div className="flex items-center gap-4 w-full max-w-2xl">
                <Label
                  htmlFor="shipTo"
                  className="font-medium whitespace-nowrap min-w-[100px] text-right"
                >
                  Ship To
                </Label>
                <Textarea
                  id="shipTo"
                  value={shipTo}
                  onChange={(e) => setShipTo(e.target.value)}
                  className="flex-1"
                  rows="3"
                  placeholder="Address name, phone #, and hours"
                />
              </div>

              <div className="flex items-center gap-4 w-full max-w-2xl">
                <Label
                  htmlFor="dimensions"
                  className="font-medium whitespace-nowrap min-w-[100px] text-right"
                >
                  Dimensions
                  <br />
                  Weights
                </Label>
                <Textarea
                  id="dimensions"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="flex-1"
                  rows="3"
                  placeholder="Enter dimensions"
                />
              </div>

              <div className="flex items-center gap-4 w-full max-w-2xl">
                <Label
                  htmlFor="dimensions"
                  className="font-medium whitespace-nowrap min-w-[100px] text-right"
                >
                  Pickup
                </Label>
                <Input
                  id="pickupDate"
                  type="datetime-local"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="flex-1"
                  placeholder="Enter pickup date and time"
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={async () => {
              await updateDatabase();
              setIsDialogOpen(false);
            }}
          >
            Save and Close
          </Button>
          <Button
            type="submit"
            onClick={async () => {
              await displayPurchaseOrderHTML();
              setIsDialogOpen(false);
            }}
          >
            Save and Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
