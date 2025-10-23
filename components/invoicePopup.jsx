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
  const [gst, setGst] = useState(invoice.gst_number || "");
  const [customerPO, setCustomerPO] = useState(
    invoice.customer_po || invoice.order?.customer_PO || ""
  );
  // Auto-populate comments from order if invoice comments are empty
  const [comments, setComments] = useState(
    invoice.comments || invoice.order?.comments || ""
  );
  const [shippingDate, setShippingDate] = useState(
    invoice.shipping_date
      ? new Date(invoice.shipping_date).toISOString().split("T")[0]
      : ""
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const saveData = async () => {
    try {
      const linePromises = invoice.Line.slice(0, invoice.Line.length - 1).map(
        async (line) => {
          const part_number = line.SalesItemLineDetail.ItemRef.name;

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/quotePartQuantity?quotation_number=${invoice.estimate.quotation_number}`,
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invoice`,
        {
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
        }
      );

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invoiceHtml`,
        {
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
        }
      );
      const html = await response.text();
      openHtmlInNewTab(html);
    } catch (error) {
      console.error("Error fetching HTML:", error);
    }
  };

  const fetchPdf = async () => {
    try {
      await saveData();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invoicePdf`,
        {
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
        }
      );
      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoice.DocNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error fetching PDF:", error);
    }
  };


  const fetchBackOrderHtml = async () => {
    try {
      await saveData();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/backOrderHtml`,
        {
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
            // Additional fields for back order HTML
            order: invoice.order,
            orderNumber: invoice.order?.order_number,
            billingType: invoice.order?.billing_type,
            orderComments: invoice.order?.comments,
            dateRequired: invoice.DueDate,
          }),
        }
      );
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
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} key={index}>
      <DialogTrigger asChild>
        <TableRow
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => setIsDialogOpen(true)}
        >
          <TableCell className="font-medium">{invoice.DocNumber}</TableCell>
          <TableCell className="">
            {invoice.CustomerRef?.name ||
              invoice.estimate?.CustomerRef?.name ||
              ""}
          </TableCell>
          <TableCell className="">{invoice.order?.customer_PO || ""}</TableCell>
          <TableCell className="">
            {invoice.order?.order_number || ""}
          </TableCell>
          <TableCell className="text-right">
            {invoice.TxnDate || invoice.order?.date_ordered.split("T")[0]}
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
        <DialogFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          {/* Save Actions */}
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" onClick={saveData} className="flex-1 sm:flex-none">
                Save and Close
              </Button>
            </DialogClose>
          </div>
          
          {/* Print Actions */}
          <div className="flex flex-wrap gap-2">
            <DialogClose asChild>
              <Button 
                onClick={fetchHtmlContent}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Print Invoice
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button 
                onClick={fetchPdf}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Download PDF
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="outline" onClick={fetchBackOrderHtml}>
                Print Back Order
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
