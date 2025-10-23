"use client";
import { Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { useState, useEffect } from "react";
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
  const [comments, setComments] = useState(
    order.comments || "ORDERED BY " + (order.dbEstimate?.customer_ref || "")
  );
  const [quotationNumber, setQuotationNumber] = useState(
    order.quotation_number
  );
  const [dateOrdered, setDateOrdered] = useState(order.date_ordered);

  // States for modify original form dialog
  const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false);
  const [itemQuantities, setItemQuantities] = useState({});
  const [originalQuantities, setOriginalQuantities] = useState({});

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Initialize item quantities from order estimate
  const initializeItemQuantity = (estimate) => {
    const initialItemQuantities = {};
    if (estimate && estimate.Line) {
      estimate.Line.forEach((line) => {
        if (line.SalesItemLineDetail?.ItemRef?.name) {
          initialItemQuantities[line.SalesItemLineDetail.ItemRef.name] =
            line.SalesItemLineDetail.Qty;
        }
      });
    }
    return initialItemQuantities;
  };

  // Load item quantities on component mount
  useEffect(() => {
    const loadQuantities = async () => {
      if (order.estimate && quotationNumber) {
        try {
          // First try to load from quotePartMap
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/getQuotePartQuantities?quotationNumber=${quotationNumber}`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.quantities && Object.keys(data.quantities).length > 0) {
              setItemQuantities(data.quantities);
              setOriginalQuantities(data.originalQuantities || {});
              return;
            }
          }
        } catch (error) {
          console.log("Failed to load from quotePartMap, using estimate data");
        }

        // Fallback to estimate data
        setItemQuantities(initializeItemQuantity(order.estimate));
      }
    };

    loadQuantities();
  }, [order.estimate, quotationNumber]);

  const handleQuantityChange = (itemName, newQuantity) => {
    const qty = Math.max(0, parseInt(newQuantity) || 0);
    setItemQuantities((prevValues) => ({
      ...prevValues,
      [itemName]: qty,
    }));
  };

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
    if (isSaving) return; // Prevent multiple simultaneous saves

    setIsSaving(true);
    try {
      const finalShippingMethod =
        shippingMethod === "other" ? customShippingText : shippingMethod;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/order`,
        {
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
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      // Close dialog immediately after successful save
      setIsDialogOpen(false);

      // Force immediate refresh of parent component
      if (onUpdate) {
        onUpdate();
      }

    } catch (error) {
      console.error("Error updating order:", error);
      // Show user-friendly error message
      alert("Failed to update order. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function displayOrderHTML() {
    // Wait for database update to complete first
    await updateDatabase();

    const finalShippingMethod =
      shippingMethod === "other" ? customShippingText : shippingMethod;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orderHTML`,
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
            // Don't pass modifiedQuantities - backend will use original_quantity from database
          }),
        }
      );
      const html = await response.text();
      openHtmlInNewTab(html);
    } catch (error) {
      console.error("Error fetching HTML:", error);
    }
  }

  const printOriginalOrder = async () => {
    // Wait for database update to complete first
    await updateDatabase();

    const finalShippingMethod =
      shippingMethod === "other" ? customShippingText : shippingMethod;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orderHTML`,
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
            useOriginalQuantities: true, // Signal backend to use original_quantity
          }),
        }
      );
      const html = await response.text();
      openHtmlInNewTab(html);
    } catch (error) {
      console.error("Error fetching original order HTML:", error);
    }
  };

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/orderPackingSlipHTML`,
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

  const saveModifiedQuantities = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/updateQuotePartQuantities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quotationNumber,
            modifiedQuantities: itemQuantities,
          }),
        }
      );

      if (response.ok) {
        setIsModifyDialogOpen(false);

        // Force immediate refresh of parent component
        if (onUpdate) {
          onUpdate();
        }
      } else {
        console.error("Failed to save modified quantities");
        alert("Failed to save quantities. Please try again.");
      }
    } catch (error) {
      console.error("Error saving modified quantities:", error);
      alert("Failed to save quantities. Please try again.");
    }
  };

  const printModifiedOrder = async () => {
    const finalShippingMethod =
      shippingMethod === "other" ? customShippingText : shippingMethod;

    try {
      // First, save the modified quantities to the database
      const saveResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/updateQuotePartQuantities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quotationNumber,
            modifiedQuantities: itemQuantities,
          }),
        }
      );

      if (!saveResponse.ok) {
        console.error("Failed to save modified quantities");
      }

      // Then generate and print the order
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orderHTML`,
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
            modifiedQuantities: itemQuantities, // Include modified quantities
          }),
        }
      );

      if (response.ok) {
        const html = await response.text();
        openHtmlInNewTab(html);

        // Refresh parent component if onUpdate callback exists
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error("Error printing modified order:", error);
    }
  };

  const downloadOrderPdf = async () => {
    const finalShippingMethod =
      shippingMethod === "other" ? customShippingText : shippingMethod;

    try {
      await updateDatabase();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orderPdf`,
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
            // Don't pass modifiedQuantities - backend will use original_quantity from database
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PDF generation failed: ${response.status}`);
      }

      // Try using arrayBuffer instead of blob
      const arrayBuffer = await response.arrayBuffer();
      console.log('Order PDF ArrayBuffer size:', arrayBuffer.byteLength);
      
      // Create blob from arrayBuffer
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      console.log('Order PDF Blob size:', blob.size);
      console.log('Order PDF Blob type:', blob.type);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-${orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating order PDF:", error);
      alert("Failed to generate order PDF. Please try again.");
    }
  };

  const downloadOriginalOrderPdf = async () => {
    const finalShippingMethod =
      shippingMethod === "other" ? customShippingText : shippingMethod;

    try {
      await updateDatabase();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orderPdf`,
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
            useOriginalQuantities: true, // Signal backend to use original_quantity
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PDF generation failed: ${response.status}`);
      }

      // Try using arrayBuffer instead of blob
      const arrayBuffer = await response.arrayBuffer();
      console.log('Original Order PDF ArrayBuffer size:', arrayBuffer.byteLength);
      
      // Create blob from arrayBuffer
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      console.log('Original Order PDF Blob size:', blob.size);
      console.log('Original Order PDF Blob type:', blob.type);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-original-${orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating original order PDF:", error);
      alert("Failed to generate original order PDF. Please try again.");
    }
  };

  const downloadModifiedOrderPdf = async () => {
    const finalShippingMethod =
      shippingMethod === "other" ? customShippingText : shippingMethod;

    try {
      // First, save the modified quantities to the database
      const saveResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/updateQuotePartQuantities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quotationNumber,
            modifiedQuantities: itemQuantities,
          }),
        }
      );

      if (!saveResponse.ok) {
        console.error("Failed to save modified quantities");
      }

      // Then generate and download the PDF
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orderPdf`,
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
            modifiedQuantities: itemQuantities, // Include modified quantities
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PDF generation failed: ${response.status}`);
      }

      // Try using arrayBuffer instead of blob
      const arrayBuffer = await response.arrayBuffer();
      console.log('Modified Order PDF ArrayBuffer size:', arrayBuffer.byteLength);
      
      // Create blob from arrayBuffer
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      console.log('Modified Order PDF Blob size:', blob.size);
      console.log('Modified Order PDF Blob type:', blob.type);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-modified-${orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Refresh parent component if onUpdate callback exists
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error generating modified order PDF:", error);
      alert("Failed to generate modified order PDF. Please try again.");
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <TableRow
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => setIsDialogOpen(true)}
          >
            <TableCell className="font-medium">{orderNumber}</TableCell>
            <TableCell className="">
              {order.estimate?.CustomerRef?.name || ""}
            </TableCell>
            <TableCell className="">{customerPO}</TableCell>
            <TableCell className="">{quotationNumber}</TableCell>
            <TableCell className="text-right">
              {order.estimate?.TxnDate || dateOrdered.split("T")[0]}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
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
                <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      printPackingSlip();
                    }}
                  >
                    Print Packing Slip
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/invoice?estimate_no=${quotationNumber}&estimate_id=${order.estimate.Id}`;
                    }}
                  >
                    Create an invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsModifyDialogOpen(true);
                    }}
                  >
                    Modify Original Form
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
                value={billingType || "COLLECT"}
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
                placeholder="Enter comments..."
                className="col-span-3 resize-y overflow-auto"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            {/* Save Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={updateDatabase}
                disabled={isSaving}
                className="flex-1 sm:flex-none"
              >
                {isSaving ? "Saving..." : "Save and Close"}
              </Button>
            </div>
            
            {/* Print & Modify Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={printOriginalOrder}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? "Saving..." : "Print Order"}
              </Button>
              <Button 
                onClick={downloadOriginalOrderPdf}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Download PDF
              </Button>
              <Button 
                onClick={printPackingSlip} 
                disabled={isSaving}
                variant="outline"
              >
                Print Packing Slip
              </Button>
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsModifyDialogOpen(true);
                }}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Modify Form
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modify Original Form Dialog */}
      <Dialog open={isModifyDialogOpen} onOpenChange={setIsModifyDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 shrink-0">
            <DialogTitle className="text-xl font-semibold">
              Modify Order Quantities
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Adjust the quantities for this order. Changes will only apply to
              the printed document.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1 min-h-0">
            <div className="max-h-[50vh] overflow-y-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="text-left font-semibold py-3 px-4 w-[35%]">
                      Item Name
                    </TableHead>
                    <TableHead className="text-center font-semibold py-3 px-4 w-[20%]">
                      Estimate Qty
                    </TableHead>
                    <TableHead className="text-center font-semibold py-3 px-4 w-[20%]">
                      Current Qty
                    </TableHead>
                    <TableHead className="text-center font-semibold py-3 px-4 w-[25%]">
                      New Qty
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.estimate && order.estimate.Line
                    ? order.estimate.Line.filter(
                        (line) =>
                          // Only show lines that have SalesItemLineDetail (actual items)
                          line.SalesItemLineDetail?.ItemRef?.name
                      ).map((line) => {
                        const itemName = line.SalesItemLineDetail.ItemRef.name;
                        const estimateQuantity = line.SalesItemLineDetail.Qty;
                        const currentOrderQty =
                          originalQuantities[itemName] || estimateQuantity;

                        return (
                          <TableRow key={line.Id} className="hover:bg-gray-50">
                            <TableCell className="py-4 px-4 font-medium text-sm">
                              {itemName}
                            </TableCell>
                            <TableCell className="py-4 px-4 text-center">
                              <span className="inline-flex items-center justify-center w-12 h-8 bg-blue-100 rounded text-sm font-medium text-blue-700">
                                {estimateQuantity}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-center">
                              <span className="inline-flex items-center justify-center w-12 h-8 bg-gray-100 rounded text-sm font-medium text-gray-700">
                                {currentOrderQty}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex justify-center">
                                <Input
                                  type="number"
                                  min="0"
                                  value={itemQuantities[itemName] || 0}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      itemName,
                                      e.target.value
                                    )
                                  }
                                  className="w-20 text-center border-gray-300 "
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    : null}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t bg-gray-50 mx-[-24px] px-6 pb-6 shrink-0">
            <div className="flex flex-col gap-4 w-full">
              <p className="text-xs text-gray-500">
                Quantities will be saved permanently and used for invoicing
              </p>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                {/* Cancel & Save Actions */}
                <div className="flex gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" className="flex-1 sm:flex-none">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    variant="secondary"
                    onClick={saveModifiedQuantities}
                    className="flex-1 sm:flex-none"
                  >
                    Save Quantities
                  </Button>
                </div>
                
                {/* Print Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={printModifiedOrder}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save & Print Modified
                  </Button>
                  <Button
                    onClick={downloadModifiedOrderPdf}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
