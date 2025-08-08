"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EstimatePopup from "@/components/estimatePopup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderPopup from "@/components/orderPopup";
import InvoicePopup from "@/components/invoicePopup";
import FilterDrawer from "@/components/filterDrawer";

export default function Estimate() {
  const [estimates, setEstimates] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [reload, setReload] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Separate useEffect for each of the forms
  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("http://localhost:8080/api/orders");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        console.log("Orders data:", data);
        const ordersData = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      }
    }

    fetchOrders();
  }, [reload, lastUpdate]);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const response = await fetch("http://localhost:8080/api/invoices");
        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }
        
        const data = await response.json();
        console.log("Invoices data:", data);
        const invoicesData = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setInvoices(invoicesData);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        setInvoices([]);
      }
    }

    fetchInvoices();
  }, [reload, lastUpdate]);

  useEffect(() => {
    async function fetchData() {
      try {
        const estimatesResponse = await fetch(
          "http://localhost:8080/api/estimates"
        );
        console.log("Estimates response:", estimatesResponse.status);

        if (estimatesResponse.ok) {
          const estimatesText = await estimatesResponse.text();
          console.log("Raw estimates:", estimatesText);

          if (estimatesText) {
            const estimatesData = JSON.parse(estimatesText);
            console.log("Parsed estimates:", estimatesData);
            setEstimates(estimatesData.data || []);
          } else {
            setEstimates([]);
          }
        } else {
          setEstimates([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setEstimates([]);
        setOrders([]);
        setInvoices([]);
      }
    }

    fetchData();
  }, [reload, lastUpdate]);

  const handleTabClick = () => {
    setReload((prev) => !prev);
  };

  const handleUpdate = () => {
    setLastUpdate(Date.now());
    setReload((prev) => !prev);
  };

  return (
    <>
      <FilterDrawer />
      <Tabs defaultValue="quotes">
        <TabsList className="grid w-1/3 mx-auto grid-cols-3 my-4">
          <TabsTrigger value="quotes" onClick={handleTabClick}>
            Quotes
          </TabsTrigger>
          <TabsTrigger value="order_form" onClick={handleTabClick}>
            Order Form
          </TabsTrigger>
          <TabsTrigger value="invoice" onClick={handleTabClick}>
            Invoice
          </TabsTrigger>
        </TabsList>
        <TabsContent value="quotes">
          <Card className="w-3/4 mx-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Quote No.</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date Quoted</TableHead>
                  <TableHead className="text-right">
                    Convert to Order Form
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimates.map((estimate) => (
                  <EstimatePopup
                    estimate={estimate}
                    key={estimate.Id}
                    onUpdate={handleUpdate}
                  />
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
                  <OrderPopup
                    order={order}
                    key={index}
                    onUpdate={handleUpdate}
                  />
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
                  <InvoicePopup
                    invoice={invoice}
                    key={index}
                    index={index}
                    onUpdate={handleUpdate}
                  />
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
