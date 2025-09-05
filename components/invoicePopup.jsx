"use client";

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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

export default function InvoicePopup({ invoice, index, onUpdate }) {
  // Debug: Log the entire invoice object to see its structure
  console.log("=== InvoicePopup Debug: Full invoice object ===", invoice);

  const [gst, setGst] = useState(invoice.gst_number || "");
  const [customerPO, setCustomerPO] = useState(invoice.customer_po || "");
  const [comments, setComments] = useState(invoice.comments || "");
  const [shippingDate, setShippingDate] = useState(
    invoice.shipping_date
      ? new Date(invoice.shipping_date).toISOString().split("T")[0]
      : ""
  );

  console.log("=== InvoicePopup Debug: Initial state values ===");
  console.log("invoice.invoice:", invoice.invoice); // Check if invoice.invoice exists

  // populate db
  useEffect(() => {
    // Remove the automatic syncing that was causing duplicate invoices
    // The invoice data should already be properly populated when this component loads
    console.log("=== InvoicePopup Debug: Component mounted ===");
    console.log("Invoice DocNumber:", invoice.DocNumber);
    console.log("Current state values:", {
      gst,
      customerPO,
      comments,
      shippingDate,
    });
  }, []);

  const saveData = async () => {
    try {
      // Debug: Log what we're about to save
      console.log("=== InvoicePopup Debug: saveData called ===");
      console.log("Current state values being saved:");
      console.log("  gst:", gst);
      console.log("  customerPO:", customerPO);
      console.log("  comments:", comments);
      console.log("  shippingDate:", shippingDate);
      console.log("  invoice.Id:", invoice.Id);
      console.log(
        "  invoice.estimate?.quotation_number:",
        invoice.estimate?.quotation_number
      );

      const linePromises = invoice.Line.slice(0, invoice.Line.length - 1).map(
        async (line) => {
          const part_number = line.SalesItemLineDetail.ItemRef.name;

          const response = await fetch(
            `http://localhost:8080/api/quotePartQuantity?quotation_number=${invoice.estimate.quotation_number}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                quantity_shipped: line.SalesItemLineDetail.Qty,
                invoice_number: invoice.DocNumber,
                part_number,
                salesItemQtyInfo: invoice.salesItemQtyInfo[part_number],
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          } else {
            if (data.updatedSalesItemQtyInfo) {
              invoice.salesItemQtyInfo[part_number] =
                data.updatedSalesItemQtyInfo;
            }
          }
        }
      );

      await Promise.all(linePromises);

      const response = await fetch("http://localhost:8080/api/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice_number: invoice.DocNumber, // Use DocNumber instead of Id
          gst: gst, // Keep as 'gst' to match backend expectation
          quotation_number: invoice.estimate?.quotation_number,
          customer_po: customerPO,
          comments: comments,
          shipping_date: shippingDate || null,
        }),
      });

      const data = await response.json();

      // Debug: Log the save response
      console.log("=== InvoicePopup Debug: Save response ===", data);

      if (data.success && onUpdate) {
        onUpdate(); // Call onUpdate after successful save
      }
    } catch (error) {
      console.log("=== InvoicePopup Debug: Save error ===", error);
    }
  };

  const fetchHtmlContent = async () => {
    try {
      await saveData();
      const response = await fetch("http://localhost:8080/api/invoiceHtml", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice: invoice,
          gst: gst,
          customer_po: customerPO,
          comments: comments,
          dateOrdered: invoice.order?.date_ordered,
          shippingDate: shippingDate || invoice.order?.date_ordered,
        }),
      });
      const html = await response.text();
      openHtmlInNewTab(html);
    } catch (error) {
      console.error("Error fetching HTML:", error);
    }
  };

  const fetchBackOrderHtml = async () => {
    try {
      console.log("=== Frontend fetchBackOrderHtml called ===");
      console.log("invoice.DocNumber:", invoice.DocNumber);
      console.log(
        "invoice.order?.quotation_number:",
        invoice.order?.quotation_number
      );
      console.log(
        "invoice.estimate?.quotation_number:",
        invoice.estimate?.quotation_number
      );
      console.log("gst:", gst);

      await saveData();
      const response = await fetch("http://localhost:8080/api/backOrderHtml", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice: invoice,
          gst: gst,
          customer_po: customerPO,
          comments: comments,
          dateOrdered: invoice.order?.date_ordered,
          shippingDate: shippingDate || invoice.order?.date_ordered,
        }),
      });
      const html = await response.text();
      openHtmlInNewTab(html);
    } catch (error) {
      console.error("Error fetching back order HTML:", error);
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

  return (
    <Dialog key={index}>
      <DialogTrigger asChild>
        <TableRow className="cursor-pointer hover:bg-gray-100">
          <TableCell className="font-medium">{invoice.DocNumber}</TableCell>
          <TableCell className="">{invoice.order.customer_PO}</TableCell>
          <TableCell className="">{invoice.order.order_number}</TableCell>
          <TableCell className="text-right">
            {invoice.order.date_ordered.split("T")[0]}
          </TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
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
                    fetchHtmlContent();
                  }}
                >
                  Print Invoice
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchBackOrderHtml();
                  }}
                >
                  Print Back Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </DialogTrigger>
      <DialogContent className="min-w-fit">
        <DialogHeader>
          <DialogTitle>Edit Invoice Information</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customer_po" className="text-right">
              Customer P.O.
            </Label>
            <Input
              id="customer_po"
              value={customerPO}
              onChange={(e) => setCustomerPO(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shipping_date" className="text-right">
              Shipping Date
            </Label>
            <Input
              id="shipping_date"
              type="date"
              value={shippingDate}
              onChange={(e) => setShippingDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comments" className="text-right">
              Comments
            </Label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="col-span-3 min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter comments..."
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={saveData}>
              Save and Close
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" onClick={fetchHtmlContent}>
              Save and Print Invoice
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="outline" onClick={fetchBackOrderHtml}>
              Print Back Order
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
