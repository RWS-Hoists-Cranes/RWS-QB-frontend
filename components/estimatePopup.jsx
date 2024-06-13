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
    DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@radix-ui/react-label"
import { Input } from "./ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Button } from "./ui/button"

import { useEffect, useState } from "react"

export default function EstimatePopup({ estimate }) {
    const [enquiryRef, setEnquiryRef] = useState('');
    const [product, setProduct] = useState('');
    const [serial, setSerial] = useState('');
    const [model, setModel] = useState('');
    const [term, setTerm] = useState('net30');
    const [fob, setFob] = useState('scarborough');
    const [itemDelivery, setItemDelivery] = useState({});
    const [showRow, setShowRow] = useState(true);

    // useEffect(() => {
    //     async function getEstimateInfo() {
    //         try {
    //             const response = await fetch(`http://localhost:8080/api/estimate?quotation_number=${estimate.DocNumber}`, {
    //                 method: 'GET',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 cache: 'no-store',
    //             });

    //             if (response.ok) {
    //                 const data = await response.json();
    //                 console.log("Success, here is data:", data)
    //                 setEnquiryRef(data.customer_ref);
    //                 setProduct(data.product);
    //                 setSerial(data.serial);
    //                 setModel(data.model);
    //                 setTerm(data.term);
    //                 setFob(data.fob);
    //                 setItemDelivery(data.quotePartDeliveries);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching estimate:', error);
    //         }
    //     }

    //     getEstimateInfo();
    // }, [estimate]);


    const handleDeliveryChange = (itemName, value) => {
        setItemDelivery((prevValues) => ({
            ...prevValues,
            [itemName]: value,
        }));
    };

    const fetchHtmlContent = async () => {
        try {
            console.log("FOB IS", fob);
            const response = await fetch('http://localhost:8080/api/generateHTML', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estimateID: estimate.DocNumber, enquiryRef, product, serial, model, term, itemDelivery, fob }),
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

    const acceptestimate = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/acceptestimate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ SyncToken: estimate.SyncToken, Id: estimate.Id, estimateID: estimate.DocNumber }),
            });
            const data = await response.json();
            setShowRow(false);
        } catch (error) {
            console.error('Error accepting estimate:', error);
        }
    }

    async function populateEstimateInfo() {
        try {
            const response = await fetch(`http://localhost:8080/api/estimate?quotation_number=${estimate.DocNumber}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            });

            if (response.ok) {
                const data = await response.json();
                setEnquiryRef(data.customer_ref);
                setProduct(data.product);
                setSerial(data.serial);
                setModel(data.model);
                setTerm(data.term);
                setFob(data.fob);
                console.log(data.term, data.fob)
            }
        } catch (error) {
            console.error('Error fetching estimate:', error);
        }
    }


    // Filter estimate

    return (
        <>
            {estimate.TxnStatus === 'Pending' && showRow &&
                <Dialog key={estimate.DocNumber}>
                    <DialogTrigger asChild>
                        <TableRow onClick={populateEstimateInfo}>
                            <TableCell className="font-medium">{estimate.DocNumber}</TableCell>
                            <TableCell className="">{estimate.CustomerRef.name}</TableCell>
                            <TableCell className="">
                                {estimate.MetaData.CreateTime.split('T')[0]}
                            </TableCell>
                            <TableCell className="text-right">
                                <Switch
                                    onCheckedChange={acceptestimate}
                                    onClick={(e) => e.stopPropagation()} />
                            </TableCell>
                        </TableRow>
                    </DialogTrigger>
                    <DialogContent className="min-w-fit">
                        <DialogHeader>
                            <DialogTitle>Edit Quote information</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Customer Enquiry Ref.
                                </Label>
                                <Input
                                    value={enquiryRef}
                                    onChange={(e) => setEnquiryRef(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="product" className="text-right">
                                    Product
                                </Label>
                                <Input
                                    id="product"
                                    value={product}
                                    onChange={(e) => setProduct(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>


                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="model" className="text-right">
                                    Model
                                </Label>
                                <Input
                                    id="model"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="serial" className="text-right">
                                    Serial Number
                                </Label>
                                <Input
                                    id="serial"
                                    value={serial}
                                    onChange={(e) => setSerial(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between w-full">
                            <div className="flex space-x-4 flex-grow">
                                <span>TERM:</span>
                                <RadioGroup defaultValue={term} onValueChange={(value) => { setTerm(value) }} className="flex-grow-0">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="net30" id="r1" />
                                        <Label htmlFor="r1">NET 30</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="cod" id="r2" />
                                        <Label htmlFor="r2">COD</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="flex space-x-4">
                                <span>FOB Point:</span>
                                <RadioGroup defaultValue={fob} onValueChange={(value) => { setFob(value) }}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="scarborough" id="r1" />
                                        <Label htmlFor="r1">Scarborough</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="free_delivery" id="r2" />
                                        <Label htmlFor="r2">Free Delivery</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="job_site" id="r2" />
                                        <Label htmlFor="r2">Job Site</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        <Table>
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
                            <TableFooter>
                                {/* <TableRow>
                                <TableCell colSpan={3}>Total</TableCell>
                                <TableCell className="text-right">$2,500.00</TableCell>
                            </TableRow> */}
                            </TableFooter>
                        </Table>
                        <DialogFooter>
                            <Button type="submit" onClick={fetchHtmlContent}>
                                Print Page
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>}
        </>
    )

}