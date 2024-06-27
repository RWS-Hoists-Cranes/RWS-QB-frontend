"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react";


export default function PickForm({ selectedForm, setSelectedForm }) {
    return (
        <>
            <RadioGroup onValueChange={setSelectedForm} value={selectedForm}>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="invoice-report" id="invoice-report" />
                    <Label htmlFor="invoice-report">Invoice Report</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="invoice-summary" id="invoice-summary" />
                    <Label htmlFor="invoice-summary">Invoice Summary</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="order-report" id="order-report" />
                    <Label htmlFor="order-report">Order Report</Label>
                </div>

                {/* <div className="flex items-center space-x-2">
                    <RadioGroupItem value="order-summary" id="order-summary" />
                    <Label htmlFor="order-summary">Order Summary</Label>
                </div> */}

                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="outstanding-order" id="outstanding-order" />
                    <Label htmlFor="outstanding-order">Outstanding Order</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="receivables" id="receivables" />
                    <Label htmlFor="receivables">Accounts Receivable List</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="account-statement" id="account-statement" />
                    <Label htmlFor="account-statement">Customer Account Statement</Label>
                </div>

            </RadioGroup>
        </>
    )
}