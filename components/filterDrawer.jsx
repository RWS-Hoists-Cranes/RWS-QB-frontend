"use client"

import { RxDoubleArrowRight, RxDoubleArrowLeft } from "react-icons/rx";
import { Button } from "./ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
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

export default function FilterDrawer() {
    return (
        <Drawer direction="left">
            <DrawerTrigger asChild><RxDoubleArrowRight className="w-6 h-6" /></DrawerTrigger>
            <DrawerContent className="w-1/3 h-full px-4">
                <DrawerHeader className="flex w-full justify-between">
                    <DrawerTitle>Filtering System</DrawerTitle>
                    <DrawerClose>
                        <RxDoubleArrowLeft className="w-6 h-6" />
                    </DrawerClose>
                </DrawerHeader>
                <Accordion type="multiple" collapsible defaultValue="pick-form">
                    <AccordionItem value="pick-date">
                        <AccordionTrigger>Pick Dates</AccordionTrigger>
                        <AccordionContent>
                            <PickDates/>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="pick-territory">
                        <AccordionTrigger>Pick Territory</AccordionTrigger>
                        <AccordionContent>
                            <PickTerritory/>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="pick-form">
                        <AccordionTrigger>Pick Form</AccordionTrigger>
                        <AccordionContent>
                            <PickTerritory/>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <DrawerFooter>
                    <Button>Submit</Button>

                </DrawerFooter>
            </DrawerContent>
        </Drawer>

    )
}