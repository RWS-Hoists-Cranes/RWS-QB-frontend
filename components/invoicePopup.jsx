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
  const [gst, setGst] = useState(invoice.invoice?.gst_number || "");

  // populate db
  useEffect(() => {
    const syncInvoice = async () => {
      try {
        // First sync invoice to database
        const QBResponse = await fetch("http://localhost:8080/api/invoices", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!QBResponse.ok) {
          throw new Error("Failed to fetch invoices");
        }

        const invoices = await QBResponse.json();
        console.log("Fetched Invoices", invoices);

        const currentInvoice = invoices.find(
          (inv) =>
            (inv.DocNumber && inv.DocNumber === invoice.DocNumber) ||
            (inv.invoice_number && inv.invoice_number === invoice.DocNumber)
        );
        console.log("Current Invoice", currentInvoice);
        if (!currentInvoice) {
          console.log("Invoice not found in QB");
          return;
        }

        const response = await fetch("http://localhost:8080/api/invoice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invoice_number: invoice.DocNumber,
            gst: currentInvoice.gst || invoice.gst, // Prefer QB value if available
            quotation_number: invoice.quotation_number,
            QBData: currentInvoice,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update invoice in DB: ${errorText}`);
        }

        console.log("Synced invoice from QuickBooks to database");
        // Update local state if needed
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error("Error syncing invoice:", error);
      }
    };

    syncInvoice();
  }, []);

  const saveData = async () => {
    try {
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
        body: JSON.stringify({ invoiceId: invoice.Id, gst }),
      });

      const data = await response.json();
      if (data.success && onUpdate) {
        onUpdate(); // Call onUpdate after successful save
      }
    } catch (error) {
      console.log(error);
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
        body: JSON.stringify({ invoice: invoice, gst: gst }),
      });
      const html = await response.text();
      openHtmlInNewTab(html);
    } catch (error) {
      console.error("Error fetching HTML:", error);
    }
  };

  const openHtmlInNewTab = (htmlContent) => {
    const newWindow = window.open("");
    newWindow.document.write(htmlContent);
    newWindow.print();
    newWindow.close();
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
            <Label htmlFor="name" className="text-right">
              GST No.
            </Label>
            <Input
              value={gst}
              onChange={(e) => setGst(e.target.value)}
              className="col-span-3"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
