'use client'

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
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"

export default function InvoicePopup({ invoice, index }) {
    const [gst, setGst] = useState(invoice.invoice?.gst_number || '');

    const saveData = async () => {
        try {

            const linePromises = invoice.Line.slice(0, invoice.Line.length - 1).map(async (line) => {
                const part_number = line.SalesItemLineDetail.ItemRef.name;

                const response = await fetch(`http://localhost:8080/api/quotePartQuantity?quotation_number=${invoice.estimate.quotation_number}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ quantity_shipped: line.SalesItemLineDetail.Qty, invoice_number: invoice.DocNumber, part_number, salesItemQtyInfo: invoice.salesItemQtyInfo[part_number] })
                })

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                } else {
                    if (data.updatedSalesItemQtyInfo) {
                        invoice.salesItemQtyInfo[part_number] = data.updatedSalesItemQtyInfo;
                    }
                }
            })

            await Promise.all(linePromises);

            const response = await fetch('http://localhost:8080/api/invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ invoice_number: invoice.DocNumber, gst: gst, quotation_number: invoice.estimate.quotation_number })
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Save the loaded invoice to the database, in case it does not exist")
            } else {
                console.error('Error creating/updating estimate');
            }
        } catch (error) {
            console.log(error);
        }

    };

    const fetchHtmlContent = async () => {
        try {
            await saveData();
            const response = await fetch('http://localhost:8080/api/invoiceHtml', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ invoice: invoice, gst: gst }),
            });
            const html = await response.text();
            openHtmlInNewTab(html)
        } catch (error) {
            console.error('Error fetching HTML:', error);
        }
    };

    const openHtmlInNewTab = (htmlContent) => {
        const newWindow = window.open('');
        newWindow.document.write(htmlContent);
        newWindow.print();
        newWindow.close();
    };



    return (

        <TableRow
            onClick={() => fetchHtmlContent()}
            className="cursor-pointer hover:bg-gray-100"
        >
            <TableCell className="font-medium">{invoice.DocNumber}</TableCell>
            <TableCell className="">{invoice.order.customer_PO}</TableCell>
            <TableCell className="">
                {invoice.order.order_number}
            </TableCell>
            <TableCell className="text-right">
                {invoice.order.date_ordered.split('T')[0]}
            </TableCell>
        </TableRow>
        // <Dialog key={index} >
        //     <DialogTrigger asChild>
        //         <TableRow>
        //             <TableCell className="font-medium">{invoice.DocNumber}</TableCell>
        //             <TableCell className="">{invoice.order.customer_PO}</TableCell>
        //             <TableCell className="">
        //                 {invoice.order.order_number}
        //             </TableCell>
        //             <TableCell className="text-right">
        //                 {invoice.order.date_ordered.split('T')[0]}
        //             </TableCell>
        //         </TableRow>
        //     </DialogTrigger>
        //     <DialogContent className="min-w-fit">
        //         <DialogHeader>
        //             <DialogTitle>Edit Invoice Information</DialogTitle>
        //         </DialogHeader>


        //         <div className="grid gap-4 py-4">
        //             <div className="grid grid-cols-4 items-center gap-4">
        //                 <Label htmlFor="name" className="text-right">
        //                     GST No.
        //                 </Label>
        //                 <Input
        //                     value={gst}
        //                     onChange={(e) => setGst(e.target.value)}
        //                     className="col-span-3"
        //                 />
        //             </div>
        //         </div>
        //         <DialogFooter>
        //             <DialogClose variant="outline" onClick={saveData} asChild> 
        //                 <Button variant="outline" onClick={saveData}>
        //                     Save and Close
        //                 </Button>
        //             </DialogClose>
        //             <DialogClose asChild>
        //                 <Button type="submit" onClick={fetchHtmlContent}>
        //                     Save and Print
        //                 </Button>
        //             </DialogClose>
        //         </DialogFooter>
        //     </DialogContent>
        // </Dialog>
    )
}