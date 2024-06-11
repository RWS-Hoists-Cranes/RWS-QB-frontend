"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"


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

            <div className="flex flex-col space-y-4">
                {estimates.map((estimate) => (
                    <Link key={estimate.DocNumber} href={`/displayestimates/${estimate.DocNumber}`}>
                        <Button key={estimate.DocNumber} variant="outline">
                            {estimate.DocNumber}
                        </Button>
                    </Link>
                ))}
            </div>
        </>
    );
}