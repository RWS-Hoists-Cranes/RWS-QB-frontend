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


export default function Estimate() {
    const [estimates, setEstimates] = useState([])

    useEffect(() => {
        async function getData() {
            const response = await fetch('http://localhost:8080/api/estimates');

            const data = await response.json();
            setEstimates(data.QueryResponse.Estimate);
        };

        getData();
    }, [])

    return (
        <>
            <div>
                Here are all the estimates you have.
            </div>
            <Tabs defaultValue="quotes">
                <TabsList className="grid w-1/3 mx-auto grid-cols-3 my-4">
                    <TabsTrigger value="quotes">Quotes</TabsTrigger>
                    <TabsTrigger value="order_form">Order Form</TabsTrigger>
                    <TabsTrigger value="invoice">Invoice</TabsTrigger>
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
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date Created</TableHead>
                                    <TableHead className="text-right">Convert to Order Form</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {estimates.map((estimate) => (
                                    <EstimatePopup estimate={estimate} />
                                ))}
                            </TableBody>

                        </Table>
                    </Card>
                </TabsContent>


            </Tabs>
        </>
    );
}