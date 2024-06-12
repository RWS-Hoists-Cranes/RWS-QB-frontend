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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  

export default function Estimate() {
    const [estimates, setEstimates] = useState([])

    useEffect(() => {
        async function getData() {
            const response = await fetch('http://localhost:8080/api/estimates');

            const data = await response.json();
            console.log(data.QueryResponse);
            setEstimates(data.QueryResponse.Estimate);
        };

        getData();
    }, [])

    return (
        <>
            <div>
                Here are all the estimates you have.
            </div>

            {/* <div className="flex flex-col space-y-4">
                {estimates.map((estimate) => (
                    <Link key={estimate.DocNumber} href={`/displayestimates/${estimate.DocNumber}`}>
                        <Button key={estimate.DocNumber} variant="outline">
                            {estimate.DocNumber}
                        </Button>
                    </Link>
                ))}
            </div> */}

            <Card className="w-3/4 mx-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Quote No.</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date Created</TableHead>
                            <TableHead className="text-right">Convert to Order Form</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {estimates.map((estimate) => (
                            <EstimatePopup estimate={estimate}/>
                        ))}
                    </TableBody>

                </Table>
            </Card>
        </>
    );
}