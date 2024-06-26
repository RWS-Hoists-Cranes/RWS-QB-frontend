"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import EstimatePopup from "@/components/estimatePopup"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import OrderPopup from "@/components/orderPopup"
import InvoicePopup from "@/components/invoicePopup"
import FilterDrawer from "@/components/filterDrawer"

export default function Estimate() {
    const [estimates, setEstimates] = useState([]);
    const [orders, setOrders] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [reload, setReload] = useState(false);

    // useEffect(() => {
    //     async function getEstimates() {
    //         const response = await fetch('http://localhost:8080/api/estimates');

    //         const data = await response.json();
    //         setEstimates(data.QueryResponse.Estimate || []);
    //     };

    //     getEstimates();
    // }, [reload]);

    // useEffect(() => {
    //     async function getOrders() {
    //         const response = await fetch('http://localhost:8080/api/orders');

    //         const data = await response.json();
    //         setOrders(data || []);
    //     };

    //     getOrders();
    // }, [reload]);

    // useEffect(() => {

    // })



    // useEffect(() => {
    //     async function getInvoices() {
    //         const response = await fetch('http://localhost:8080/api/invoices');

    //         const data = await response.json();
    //         setInvoices(data || []);
    //     };

    //     getInvoices();
    // }, [reload]);
    useEffect(() => {
        async function fetchData() {
            try {
                // First, fetch and set estimates
                const estimatesResponse = await fetch('http://localhost:8080/api/estimates');
                const estimatesData = await estimatesResponse.json();
                setEstimates(estimatesData.QueryResponse.Estimate || []);

                // After estimates are fetched, fetch and set orders
                const ordersResponse = await fetch('http://localhost:8080/api/orders');
                const ordersData = await ordersResponse.json();
                setOrders(ordersData || []);

                // Finally, fetch and set invoices
                const invoicesResponse = await fetch('http://localhost:8080/api/invoices');
                const invoicesData = await invoicesResponse.json();
                setInvoices(invoicesData || []);

            } catch (error) {
                console.error("Error fetching data:", error);
                // Handle error (e.g., set an error state)
            }
        }

        fetchData();
    }, [reload]);   

    const handleTabClick = () => {
        setReload(!reload);
    };

    return (
        <>
            <FilterDrawer />
            <Tabs defaultValue="quotes">
                <TabsList className="grid w-1/3 mx-auto grid-cols-3 my-4">
                    <TabsTrigger value="quotes" onClick={handleTabClick}>Quotes</TabsTrigger>
                    <TabsTrigger value="order_form" onClick={handleTabClick}>Order Form</TabsTrigger>
                    <TabsTrigger value="invoice" onClick={handleTabClick}>Invoice</TabsTrigger>

                </TabsList>
                <TabsContent value="quotes">
                    <Card className="w-3/4 mx-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Quote No.</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date Quoted</TableHead>
                                    <TableHead className="text-right">Convert to Order Form</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {estimates.map((estimate) => (
                                    <EstimatePopup estimate={estimate} key={estimate.Id} />
                                ))}
                            </TableBody>

                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="order_form">
                    <Card className="w-3/4 mx-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Order No.</TableHead>
                                    <TableHead>Customer PO</TableHead>
                                    <TableHead>Quotation Ref.</TableHead>
                                    <TableHead className="text-right">Date Ordered</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order, index) => (
                                    <OrderPopup order={order} key={index} />
                                ))}
                            </TableBody>

                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="invoice">
                    <Card className="w-3/4 mx-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Invoice No.</TableHead>
                                    <TableHead>Customer PO</TableHead>
                                    <TableHead>R.W.S. Job No.</TableHead>
                                    <TableHead className="text-right">Invoice Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice, index) => (
                                    <InvoicePopup invoice={invoice} key={index} index={index} />
                                ))}
                            </TableBody>

                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>

        </>
    );
}