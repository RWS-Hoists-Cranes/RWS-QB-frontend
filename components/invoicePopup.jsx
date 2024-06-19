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
            const response = await fetch('http://localhost:8080/api/invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ invoice_number: invoice.DocNumber, gst: gst, quotation_number: invoice.estimate.quotation_number})
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
            saveData();
            const response = await fetch('http://localhost:8080/api/invoiceHtml', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ invoice: invoice }),
            });
            const html = await response.text();
            // openHtmlInNewTab(html)
        } catch (error) {
            console.error('Error fetching HTML:', error);
        }
    };



    return (
        <Dialog key={index} >
            <DialogTrigger asChild>
                <TableRow>
                    <TableCell className="font-medium">{invoice.DocNumber}</TableCell>
                    <TableCell className="">{invoice.order.customer_PO}</TableCell>
                    <TableCell className="">
                        {invoice.order.order_number}
                    </TableCell>
                    <TableCell className="text-right">
                        {invoice.order.date_ordered.split('T')[0]}
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


                {/* <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">RWS Part No.</TableHead>
                            <TableHead className="w-full">Description</TableHead>
                            <TableHead className="text-right">Delivery</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {estimate.Line.slice(0, estimate.Line.length - 1).map((line) => (
                            // <div>{line.SalesItemLineDetail.ItemRef.name}</div>
                            <TableRow key={line.Id}>
                                <TableCell className="font-medium">{line.SalesItemLineDetail.ItemRef.name}</TableCell>
                                <TableCell className="w-full">{line.Description}</TableCell>
                                <TableCell className="text-right">
                                    <textarea
                                        type="text"
                                        value={itemDelivery[line.SalesItemLineDetail.ItemRef.name] || ''}
                                        onChange={(e) =>
                                            handleDeliveryChange(line.SalesItemLineDetail.ItemRef.name, e.target.value)
                                        }
                                        className="min-h-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table> */}
                <DialogFooter>
                    <DialogClose variant="outline" onClick={saveData}> 
                        <Button variant="outline" onClick={saveData}>
                            Save and Close
                        </Button>
                    </DialogClose>
                    <DialogClose>
                        <Button type="submit" onClick={fetchHtmlContent}>
                            Save and Print
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}