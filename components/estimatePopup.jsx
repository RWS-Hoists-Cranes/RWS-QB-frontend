"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "./ui/button";

import { useEffect, useState } from "react";

export default function EstimatePopup({ estimate, onUpdate }) {
  const [enquiryRef, setEnquiryRef] = useState("");
  const [product, setProduct] = useState("");
  const [serial, setSerial] = useState("");
  const [model, setModel] = useState("");
  const [term, setTerm] = useState("");
  const [fob, setFob] = useState("");
  const [itemDelivery, setItemDelivery] = useState({});
  const [switchState, setSwitchState] = useState(
    estimate.TxnStatus === "Accepted" || estimate.TxnStatus === "Converted"
  );
  const itemQuantityOrdered = {};
  const [itemQuantities, setItemQuantities] = useState({});

  const initializeItemQuantity = (estimate) => {
    const initialItemQuantities = {};
    estimate.Line.slice(0, estimate.Line.length - 1).forEach((line) => {
      initialItemQuantities[line.SalesItemLineDetail.ItemRef.name] =
        line.SalesItemLineDetail.Qty;
    });
    return initialItemQuantities;
  };

  const initializeItemDelivery = (estimate) => {
    const initialItemDelivery = {};
    estimate.Line.slice(0, estimate.Line.length - 1).forEach((line) => {
      initialItemDelivery[line.SalesItemLineDetail.ItemRef.name] = "";
    });
    return initialItemDelivery;
  };

  useEffect(() => {
    const quotationNumber = estimate.DocNumber;

    const postEstimate = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/estimate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quotation_number: quotationNumber,
            quotation_id: estimate.Id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Synced estimate from QuickBooks to database");
        } else {
          console.error("Error syncing estimate to database");
        }
      } catch (error) {
        console.error("Error syncing estimate:", error);
      }
    };

    const populateEstimateInfo = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/estimate?quotation_number=${estimate.DocNumber}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setEnquiryRef(data.customer_ref);
          setProduct(data.product);
          setSerial(data.serial);
          setModel(data.model);
          setTerm(data.term);
          setFob(data.fob);
          setItemDelivery(data.itemDelivery);

          console.log("Fetched estimate data:", data);
          if (data.itemQuantities) {
            setItemQuantities(data.itemQuantities);
          } else {
            setItemQuantities(initializeItemQuantity(estimate));
          }
        }
      } catch (error) {
        console.error("Error fetching estimate:", error);
      }
    };

    // First sync the estimate to database, then populate form data
    postEstimate();
    populateEstimateInfo();
    if (estimate && estimate.Line) {
      setItemDelivery(initializeItemDelivery(estimate));
    }
  }, [estimate]);

  const handleDeliveryChange = (itemName, value) => {
    setItemDelivery((prevValues) => ({
      ...prevValues,
      [itemName]: value || "",
    }));
  };

  const handleQuantityChange = (itemName, newQuantity) => {
    const qty = Math.max(0, parseInt(newQuantity) || 0);
    setItemQuantities((prevValues) => ({
      ...prevValues,
      [itemName]: qty,
    }));
  };

  const saveData = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/estimate", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estimateID: estimate.DocNumber,
          enquiryRef,
          product,
          serial,
          model,
          term,
          itemDelivery,
          fob,
          Id: estimate.Id,
          itemQuantityOrdered,
          itemQuantities,
        }),
      });
      console.log("Successfully saved the data");
    } catch (error) {
      console.error("Failed to save the data");
    }
  };

  const fetchHtmlContent = async () => {
    try {
      await saveData();
      const response = await fetch("http://localhost:8080/api/estimateHtml", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estimateID: estimate.DocNumber,
          enquiryRef,
          product,
          serial,
          model,
          term,
          itemDelivery,
          fob,
          itemQuantities,
        }),
      });
      const html = await response.text();
      openHtmlInNewTab(html);
    } catch (error) {
      console.error("Error fetching HTML:", error);
    }
  };

  const openHtmlInNewTab = (htmlContent) => {
    const newWindow = window.open("");
    newWindow.document.write(htmlContent);
    newWindow.document.close();

    const checkReady = () => {
      if (newWindow.document.readyState === "complete") {
        setTimeout(() => {
          newWindow.print();
          newWindow.close();
        }, 300);
      } else {
        setTimeout(checkReady, 100);
      }
    };

    checkReady();
  };

  const acceptestimate = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/acceptestimate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          SyncToken: estimate.SyncToken,
          Id: estimate.Id,
          estimateID: estimate.DocNumber,
          status: !switchState,
        }),
      });
      if (onUpdate) onUpdate();
      const data = await response.json();
      setSwitchState(!switchState);
    } catch (error) {
      console.error("Error accepting estimate:", error);
    }
  };

  // Filter estimate

  return (
    <>
      {(estimate.TxnStatus === "Pending" ||
        estimate.TxnStatus === "Accepted" ||
        estimate.TxnStatus === "Converted") && (
        <Dialog key={estimate.DocNumber}>
          <DialogTrigger asChild>
            <TableRow>
              <TableCell className="font-medium">
                {estimate.DocNumber}
              </TableCell>
              <TableCell className="">{estimate.CustomerRef.name}</TableCell>
              <TableCell className="">
                {estimate.MetaData.CreateTime.split("T")[0]}
              </TableCell>
              <TableCell className="text-right">
                <Switch
                  checked={switchState}
                  onCheckedChange={acceptestimate}
                  onClick={(e) => e.stopPropagation()}
                />
              </TableCell>
            </TableRow>
          </DialogTrigger>
          <DialogContent className="min-w-fit max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Quote information</DialogTitle>
              <DialogDescription>
                Edit the quote details and delivery information for estimate{" "}
                {estimate.DocNumber}
              </DialogDescription>
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
                <RadioGroup
                  defaultValue={term}
                  onValueChange={(value) => {
                    setTerm(value);
                  }}
                  className="flex-grow-0"
                >
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
                <RadioGroup
                  defaultValue={fob}
                  onValueChange={(value) => {
                    setFob(value);
                  }}
                >
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
                  <TableHead className="text-center w-[100px]">
                    QB Qty
                  </TableHead>
                  <TableHead className="text-center w-[120px]">
                    Order Qty
                  </TableHead>
                  <TableHead className="text-right">Delivery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimate.Line.slice(0, estimate.Line.length - 1).map(
                  (line) => {
                    const itemName = line.SalesItemLineDetail.ItemRef.name;
                    const qbQuantity = line.SalesItemLineDetail.Qty;
                    itemQuantityOrdered[itemName] =
                      itemQuantities[itemName] || 0;

                    return (
                      <TableRow key={line.Id}>
                        <TableCell className="font-medium">
                          {itemName}
                        </TableCell>
                        <TableCell className="w-full">
                          {line.Description}
                        </TableCell>
                        <TableCell className="text-center font-medium text-gray-600">
                          {qbQuantity}
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="0"
                            value={itemQuantities[itemName] || 0}
                            onChange={(e) =>
                              handleQuantityChange(itemName, e.target.value)
                            }
                            className="w-16 text-center"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <textarea
                            type="text"
                            value={itemDelivery[itemName] || ""}
                            onChange={(e) =>
                              handleDeliveryChange(itemName, e.target.value)
                            }
                            className="min-h-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
              <TableFooter>
                {/* <TableRow>
                                <TableCell colSpan={3}>Total</TableCell>
                                <TableCell className="text-right">$2,500.00</TableCell>
                            </TableRow> */}
              </TableFooter>
            </Table>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={saveData}>
                  Save and Close
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit" onClick={fetchHtmlContent}>
                  Save and Print
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
