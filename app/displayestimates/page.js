"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import PurchaseOrderPopup from "@/components/purchaseOrderPopup";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Package,
  ShoppingCart,
  Receipt,
  Building2,
  RefreshCw,
} from "lucide-react";

export default function Estimate() {
  const [estimates, setEstimates] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [reload, setReload] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [purchaseOrders, setPurchaseOrders] = useState([]);

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

  useEffect(() => {
    async function fetchPurchaseOrders() {
      try {
        const response = await fetch(
          "http://localhost:8080/api/purchaseorders"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch purchase orders");
        }
        const data = await response.json();
        console.log("Purchase Orders data:", data);
        const purchaseOrdersData = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setPurchaseOrders(purchaseOrdersData);
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
        setPurchaseOrders([]);
      }
    }

    fetchPurchaseOrders();
  }, [reload, lastUpdate]);

  const handleTabClick = () => {
    setReload((prev) => !prev);
  };

  const handleUpdate = () => {
    setLastUpdate(Date.now());
    setReload((prev) => !prev);
  };

  const tabData = [
    {
      value: "quotes",
      label: "Quotes",
      icon: <FileText className="w-4 h-4" />,
      count: estimates.length,
      color: "bg-blue-500",
    },
    {
      value: "purchase_order",
      label: "Purchase Orders",
      icon: <Package className="w-4 h-4" />,
      count: purchaseOrders.length,
      color: "bg-green-500",
    },
    {
      value: "order_form",
      label: "Order Forms",
      icon: <ShoppingCart className="w-4 h-4" />,
      count: orders.length,
      color: "bg-orange-500",
    },
    {
      value: "invoice",
      label: "Invoices",
      icon: <Receipt className="w-4 h-4" />,
      count: invoices.length,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <FilterDrawer />

      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  RWS Dashboard
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Business Management Suite
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReload((prev) => !prev)}
              className="hidden sm:flex"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="quotes" className="space-y-6">
          {/* Tabs */}
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            {tabData.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                onClick={handleTabClick}
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-700 py-3 px-4 text-sm font-medium"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {tab.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="quotes">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Quotes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px] font-semibold">
                        Quote No.
                      </TableHead>
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold">
                        Date Quoted
                      </TableHead>
                      <TableHead className="text-right font-semibold">
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchase_order">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Purchase Orders</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px] font-semibold">
                        PO No.
                      </TableHead>
                      <TableHead className="font-semibold">Vendor</TableHead>
                      <TableHead className="font-semibold">
                        R.W.S. JOB NO.
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        Date Ordered
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.map((po, index) => (
                      <PurchaseOrderPopup
                        purchaseOrder={po}
                        key={po.DocNumber || index}
                        onUpdate={handleUpdate}
                      />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="order_form">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Order Forms</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px] font-semibold">
                        Order No.
                      </TableHead>
                      <TableHead className="font-semibold">
                        Customer PO
                      </TableHead>
                      <TableHead className="font-semibold">
                        Quotation Ref.
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        Date Ordered
                      </TableHead>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoice">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5" />
                  <span>Invoices</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px] font-semibold">
                        Invoice No.
                      </TableHead>
                      <TableHead className="font-semibold">
                        Customer PO
                      </TableHead>
                      <TableHead className="font-semibold">
                        R.W.S. Job No.
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        Invoice Date
                      </TableHead>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
