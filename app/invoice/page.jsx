"use client"
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function CreateInvoices() {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter()
    const { toast } = useToast()
    const estimateNum = searchParams.get('estimate_no')
    const estimateId = searchParams.get('estimate_id')

    useEffect(() => {
        const fetchOrder = async () => {
            if (!estimateNum) {
                toast({
                    title: "Error",
                    description: "No estimate ID provided",
                    variant: "destructive",
                })
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:8080/api/order?estimate_id=${estimateNum}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch order');
                }
                const data = await response.json();
                setOrder(data);
                console.log(data);

                const lines = data.estimate.Line;

                setLineItems(lines.slice(0, lines.length - 1).map((lineItem) => {
                    return (
                        {
                            id: lineItem.SalesItemLineDetail.ItemRef.value,
                            name: lineItem.SalesItemLineDetail.ItemRef.name,
                            description: lineItem.Description,
                            unitPrice: lineItem.SalesItemLineDetail.UnitPrice,
                            quantity: 0,
                            totalOrdered: lineItem.SalesItemLineDetail.Qty,
                        }
                    )
                }))
            } catch (err) {
                toast({
                    title: "Error",
                    description: "Unexpexted error when fetching order",
                    variant: "destructive",
                })
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [estimateNum]);

    const [invoiceNo, setInvoiceNo] = useState('')
    const [lineItems, setLineItems] = useState([])

    const handleQuantityChange = (id, newQuantity) => {
        console.log(lineItems);
        setLineItems(items =>
            items.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.min(newQuantity, item.totalOrdered) }
                    : item
            )
        )
    }

    const calculateTotal = () => {
        return lineItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0)
    }

    const handleCreateInvoice = async () => {
        if (!invoiceNo.trim()) {
            toast({
                title: "Error",
                description: "Invoice No. is required",
                variant: "destructive",
            })
            return
        }

        try {
            const invoiceData = await constructInvoice(order.estimate.CustomerRef.value, invoiceNo, lineItems, estimateId)
            const htmlContent = await fetchHtmlContent(invoiceData)


            toast({
                title: "Success",
                description: "Invoice created successfully",
            })

            // Optionally, redirect to another page after successful creation
            // router.push('/some-success-page')
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create invoice: Ensure that invoice number is unique.",
                variant: "destructive",
            })
        }
    }

    const fetchHtmlContent = async (invoiceData) => {
        try {
            await saveData();
            const response = await fetch('http://localhost:8080/api/invoiceHtml', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ invoice: invoiceData, gst: "Doesn't matter" }),
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
        <Card className="w-full max-w-7xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>Create Invoice</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 space-y-2">
                    <Label htmlFor="invoiceNo">Invoice No.</Label>
                    <Input
                        id="invoiceNo"
                        value={invoiceNo}
                        onChange={(e) => setInvoiceNo(e.target.value)}
                        placeholder="Enter Invoice No."
                        className="max-w-xs"
                    />
                </div>
                <div className="mb-4">
                    <p className="text-sm text-gray-500">Estimate ID: {estimateNum}</p>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Part No.</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Total Ordered</TableHead>
                            <TableHead>Line Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lineItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                        min={0}
                                        max={item.totalOrdered}
                                        className="w-20"
                                    />
                                </TableCell>
                                <TableCell>{item.totalOrdered}</TableCell>
                                <TableCell>${(item.unitPrice * item.quantity).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="mt-4 text-right">
                    <p className="text-lg font-semibold">Total: ${calculateTotal().toFixed(2)}</p>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="outline" onClick={() => router.push('/displayestimates')}>Cancel</Button>
                    <Button onClick={handleCreateInvoice}>Create Invoice</Button>
                </div>
            </CardContent>
        </Card>
    )
}

async function constructInvoice(customerId, invoiceNo, lineItems, estimateId) {
    try {
        const response = await fetch('http://localhost:8080/api/create-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerId,
                invoiceNo,
                lineItems,
                estimateId,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create invoice');
        }

        console.log(response);

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error constructing invoice:', error);
        throw error;
    }
}
