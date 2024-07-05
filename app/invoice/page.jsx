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
    const estimateId = searchParams.get('est_id')

    useEffect(() => {
        const fetchOrder = async () => {
            if (!estimateId) {
                toast({
                    title: "Error",
                    description: "No estimate ID provided",
                    variant: "destructive",
                })
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:8080/api/order?estimate_id=${estimateId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch order');
                }
                const data = await response.json();
                setOrder(data);

                const lines = data.estimate.Line;

                setLineItems(lines.slice(0, lines.length - 1).map((lineItem) => {
                    return (
                        {
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
    }, [estimateId]);

    const [invoiceNo, setInvoiceNo] = useState('')
    const [lineItems, setLineItems] = useState([
        { id: '1', description: 'Widget A', unitPrice: 10, quantity: 5, totalOrdered: 10 },
        { id: '2', description: 'Gadget B', unitPrice: 20, quantity: 3, totalOrdered: 5 },
        { id: '3', description: 'Tool C', unitPrice: 15, quantity: 2, totalOrdered: 4 },
    ])

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
            const invoiceData = await constructInvoice(invoiceNo, lineItems, estimateId)
            const htmlContent = await fetchHtmlContent(invoiceData)

            // Here you might want to do something with the htmlContent,
            // such as displaying it or sending it to another component

            toast({
                title: "Success",
                description: "Invoice created successfully",
            })

            // Optionally, redirect to another page after successful creation
            // router.push('/some-success-page')
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create invoice: " + error.message,
                variant: "destructive",
            })
        }
    }

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
                    <p className="text-sm text-gray-500">Estimate ID: {estimateId}</p>
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

// These functions are placeholders and should be replaced with your actual implementations
async function constructInvoice(invoiceNo, lineItems, estimateId) {
    // Implement your logic here
    return { invoiceNo, lineItems, estimateId }
}

async function fetchHtmlContent(invoiceData) {
    // Implement your logic here
    return "<html>...</html>"
}