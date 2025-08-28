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
    purchaseOrder.dbData?.billing_type || "COLLECT"
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

  async function updateDatabase() {
    try {
      const finalShippingMethod =
        shippingMethod === "other" ? customShippingText : shippingMethod;

      const res = await fetch("http://localhost:8080/api/purchaseorder", {
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
        }),
      });

      if (onUpdate) onUpdate();

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error updating purchase order:", errorData);
        return;
      }

      const data = await res.json();
    } catch (error) {
      console.error("Error updating purchase order:", error);
    }
  }

  async function displayPurchaseOrderHTML() {
    updateDatabase();

    const finalShippingMethod =
      shippingMethod === "other" ? customShippingText : shippingMethod;

    try {
      const res = await fetch("http://localhost:8080/api/purchaseOrderHTML", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          poNumber,
          vendorName,
          shippingMethod: finalShippingMethod,
          comments,
          dateOrdered,
          purchaseOrder,
          billingType,
          isFreight,
          ship_from: shipFrom,
          ship_to: shipTo,
        }),
      });

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
    <Dialog key={poNumber}>
      <DialogTrigger asChild>
        <TableRow>
          <TableCell className="font-medium">{poNumber}</TableCell>
          <TableCell className="">{vendorName}</TableCell>
          <TableCell className="">{orderNumber}</TableCell>
          <TableCell className="text-right">
            {dateOrdered?.split("T")[0] || "N/A"}
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
      <DialogContent className="min-w-fit">
        <DialogHeader>
          <DialogTitle>Edit Purchase Order Information</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              PO Number
            </Label>
            <Input
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              className="col-span-3"
              disabled
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Vendor Info
            </Label>
            <Input
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="col-span-3"
              disabled
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Related Order No.
            </Label>
            <Input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
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
                  {shippingMethod
                    ? shippingMethods.find(
                        (method) => method.value === shippingMethod
                      )?.label
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
              Terms
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="freight" className="text-right">
              Freight Order
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <input
                type="checkbox"
                id="freight"
                checked={isFreight}
                onChange={(e) => setIsFreight(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="freight" className="text-sm">
                This is a freight order
              </Label>
            </div>
          </div>

          {isFreight && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="shipFrom" className="text-right">
                  Ship From
                </Label>
                <Input
                  id="shipFrom"
                  value={shipFrom}
                  onChange={(e) => setShipFrom(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter ship from details"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="shipTo" className="text-right">
                  Ship To
                </Label>
                <Input
                  id="shipTo"
                  value={shipTo}
                  onChange={(e) => setShipTo(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter ship to details"
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={updateDatabase}>
              Save and Close
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" onClick={displayPurchaseOrderHTML}>
              Save and Print
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
