"use client"

import { RxDoubleArrowRight, RxDoubleArrowLeft } from "react-icons/rx";
import { Button } from "./ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import PickDates from "./pickDates";
import PickTerritory from "./pickTerritory";
import PickForm from "./pickForm";
import PickCustomer from "./pickCustomer";
import { useState } from "react";
import { startOfMonth, endOfMonth, startOfDay } from 'date-fns';
import { ErrorAlert, SuccessAlert } from "./CustomAlert";

export default function FilterDrawer() {
    const [dateRange, setDateRange] = useState(() => {
        const now = new Date();
        return {
            from: startOfDay(startOfMonth(now)),
            to: startOfDay(endOfMonth(now))
        };
    });

    const [territory, setTerritory] = useState('');

    const [selectedForm, setSelectedForm] = useState("invoice-report");

    const [customer, setCustomer] = useState('');

    const [errorMessage, setErrorMessage] = useState('');

    async function printForm() {

        console.log(dateRange);
        try {
            const response = await fetch('http://localhost:8080/api/filteredForm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ dateRange, territory, reportType: selectedForm, customer }),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            };

            const html = await response.text();
            openHtmlInNewTab(html)
        } catch (error) {
            console.error('Error printing filtered form', error);
            setErrorMessage("Cannot print the filtered form");
        }
    }

    const openHtmlInNewTab = (htmlContent) => {
        const newWindow = window.open('');
        newWindow.document.write(htmlContent);
        newWindow.print();
        newWindow.close();
    };


    return (
        <>
            {errorMessage && <ErrorAlert message={errorMessage} />}

            <Drawer direction="left">
                <DrawerTrigger asChild>
                    <RxDoubleArrowRight className="w-6 h-6 m-6" />
                </DrawerTrigger>
                <DrawerContent className="w-1/3 h-full px-4">
                    <DrawerHeader className="flex w-full justify-between">
                        <DrawerTitle>Filtering System</DrawerTitle>
                        <DrawerClose>
                            <RxDoubleArrowLeft className="w-6 h-6" />
                        </DrawerClose>
                    </DrawerHeader>
                    <Accordion type="multiple" collapsible defaultValue={["pick-form"]}>
                        <AccordionItem value="pick-date">
                            <AccordionTrigger>Pick Dates</AccordionTrigger>
                            <AccordionContent>
                                <PickDates dateRange={dateRange} setDateRange={setDateRange} />
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="pick-territory">
                            <AccordionTrigger>Pick Territory</AccordionTrigger>
                            <AccordionContent>
                                <PickTerritory value={territory} setValue={setTerritory} />
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="pick-customer">
                            <AccordionTrigger>Pick Customer</AccordionTrigger>
                            <AccordionContent>
                                <PickCustomer value={customer} setValue={setCustomer} />
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="pick-form">
                            <AccordionTrigger>Pick Form</AccordionTrigger>
                            <AccordionContent>
                                <PickForm selectedForm={selectedForm} setSelectedForm={setSelectedForm} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <DrawerFooter>
                        <DrawerClose>
                            <Button onClick={printForm}>
                                Print Form
                            </Button>
                        </DrawerClose>

                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>

    )
}