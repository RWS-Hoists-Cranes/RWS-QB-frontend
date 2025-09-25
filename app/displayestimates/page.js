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
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export default function Estimate() {
  const [estimates, setEstimates] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [reload, setReload] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Separate useEffect for each of the forms
  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/invoices`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }

        const data = await response.json();
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/estimates`
        );
        if (estimatesResponse.ok) {
          const estimatesText = await estimatesResponse.text();

          if (estimatesText) {
            const estimatesData = JSON.parse(estimatesText);
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/purchaseorders`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch purchase orders");
        }
        const data = await response.json();
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

  const filterEstimates = (estimates, searchTerm) => {
    if (!searchTerm) return estimates;

    return estimates.filter((estimate) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        estimate.CustomerRef?.name
          ?.toString()
          .toLowerCase()
          .includes(searchLower) ||
        estimate.DocNumber?.toString().toLowerCase().includes(searchLower) ||
        estimate.TxnDate?.toString().toLowerCase().includes(searchLower)
      );
    });
  };

  const filterOrders = (orders, searchTerm) => {
    if (!searchTerm) return orders;

    return orders.filter((order) => {
      const searchLower = searchTerm.toLowerCase();

      // Check these specific fields
      const orderNumber = order.order_number?.toString().toLowerCase();
      const customerPO = order.customer_PO?.toString().toLowerCase();
      const quotationNumber = order.quotation_number?.toString().toLowerCase();
      const dateOrdered = order.date_ordered?.toString().toLowerCase();

      return (
        orderNumber?.includes(searchLower) ||
        customerPO?.includes(searchLower) ||
        quotationNumber?.includes(searchLower) ||
        dateOrdered?.includes(searchLower)
      );
    });
  };

  const filterInvoices = (invoices, searchTerm) => {
    if (!searchTerm) return invoices;

    return invoices.filter((invoice) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        invoice.invoice.invoice_number
          ?.toString()
          .toLowerCase()
          .includes(searchLower) ||
        invoice.DocNumber?.toString().toLowerCase().includes(searchLower) ||
        invoice.order?.customer_PO
          ?.toString()
          .toLowerCase()
          .includes(searchLower) ||
        invoice.order?.order_number
          ?.toString()
          .toLowerCase()
          .includes(searchLower) ||
        invoice.order?.date_ordered
          ?.toString()
          .toLowerCase()
          .includes(searchLower)
      );
    });
  };

  const filterPurchaseOrders = (purchaseOrders, searchTerm) => {
    if (!searchTerm) return purchaseOrders;

    return purchaseOrders.filter((po) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        po.dbData.po_number?.toString().toLowerCase().includes(searchLower) ||
        po.dbData.vendor_name?.toString().toLowerCase().includes(searchLower) ||
        po.dbData.order_number
          ?.toString()
          .toLowerCase()
          .includes(searchLower) ||
        po.dbData.date_ordered?.toString().toLowerCase().includes(searchLower)
      );
    });
  };

  // Get filtered data
  const filteredEstimates = filterEstimates(estimates, searchTerm);
  const filteredOrders = filterOrders(orders, searchTerm);
  const filteredInvoices = filterInvoices(invoices, searchTerm);
  const filteredPurchaseOrders = filterPurchaseOrders(
    purchaseOrders,
    searchTerm
  );

  const clearSearch = () => {
    setSearchTerm("");
  };

  const tabData = [
    {
      value: "quotes",
      label: "Quotes",
      icon: <FileText className="w-4 h-4" />,
      count: filteredEstimates.length,
      totalCount: estimates.length,
      color: "bg-blue-500",
    },
    {
      value: "order_form",
      label: "Order Forms",
      icon: <ShoppingCart className="w-4 h-4" />,
      count: filteredOrders.length,
      totalCount: orders.length,
      color: "bg-orange-500",
    },
    {
      value: "purchase_order",
      label: "Purchase Orders",
      icon: <Package className="w-4 h-4" />,
      count: filteredPurchaseOrders.length,
      totalCount: purchaseOrders.length,
      color: "bg-green-500",
    },
    {
      value: "invoice",
      label: "Invoices",
      icon: <Receipt className="w-4 h-4" />,
      count: filteredInvoices.length,
      totalCount: invoices.length,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <FilterDrawer />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  RWS Dashboard
                </h1>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReload((prev) => !prev)}
              className="hidden sm:flex h-8"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 lg:px-8 py-2">
        <div className="">
          {/* Search Bar */}
          <Card className="w-fit ml-auto border shadow-sm bg-white">
            <CardContent className="p-0">
              <div className="relative max-w-sm mx-auto">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 pr-7 h-8 text-sm border-slate-200 focus:ring-1 focus:ring-blue-500"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0 hover:bg-slate-100"
                  >
                    <X className="w-2 h-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="quotes" className="space-y-3">
            {/* Tabs */}
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 lg:grid-cols-4 h-auto p-0.5 bg-slate-100">
              {tabData.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  onClick={handleTabClick}
                  className="flex items-center space-x-1 data-[state=active]:bg-white data-[state=active]:shadow-sm py-2 px-2 text-xs font-medium"
                >
                  {}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                  <Badge
                    variant="secondary"
                    className={`ml-auto text-xs h-4 px-1 ${
                      searchTerm && tab.count !== tab.totalCount
                        ? "bg-orange-100 text-orange-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {searchTerm && tab.count !== tab.totalCount
                      ? `${tab.count}/${tab.totalCount}`
                      : tab.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content */}
            <TabsContent value="quotes">
              <Card className="border shadow-sm bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Quotes</span>
                    </div>
                    {searchTerm &&
                      filteredEstimates.length !== estimates.length && (
                        <span className="text-xs text-slate-500">
                          {filteredEstimates.length} of {estimates.length}
                        </span>
                      )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {filteredEstimates.length === 0 && searchTerm ? (
                    <div className="text-center py-6 text-sm text-slate-500">
                      {`No quotes found matching "${searchTerm}"`}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs font-medium h-8">
                            Quote No.
                          </TableHead>
                          <TableHead className="text-xs font-medium h-8">
                            Customer
                          </TableHead>
                          <TableHead className="text-xs font-medium h-8">
                            Date Quoted
                          </TableHead>
                          <TableHead className="text-xs font-medium h-8 text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEstimates.map((estimate) => (
                          <EstimatePopup
                            estimate={estimate}
                            key={estimate.Id}
                            onUpdate={handleUpdate}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="order_form">
              <Card className="border shadow-sm bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Order Forms</span>
                    </div>
                    {searchTerm && filteredOrders.length !== orders.length && (
                      <span className="text-xs text-slate-500">
                        {filteredOrders.length} of {orders.length}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {filteredOrders.length === 0 && searchTerm ? (
                    <div className="text-center py-6 text-sm text-slate-500">
                      {`No order forms found matching "${searchTerm}"`}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs font-medium h-8">
                            Order No.
                          </TableHead>
                          <TableHead className="text-xs font-medium h-8">
                            Customer PO
                          </TableHead>
                          <TableHead className="text-xs font-medium h-8">
                            Quotation Ref.
                          </TableHead>
                          <TableHead className="text-xs font-medium h-8 text-right">
                            Date Ordered
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <OrderPopup
                            order={order}
                            key={
                              order.order_number || order.id || Math.random()
                            } // Use unique identifier instead of index
                            onUpdate={handleUpdate}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="purchase_order">
              <Card className="border shadow-sm bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4" />
                      <span>Purchase Orders</span>
                    </div>
                    {searchTerm &&
                      filteredPurchaseOrders.length !==
                        purchaseOrders.length && (
                        <span className="text-xs text-slate-500">
                          {filteredPurchaseOrders.length} of{" "}
                          {purchaseOrders.length}
                        </span>
                      )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {filteredPurchaseOrders.length === 0 && searchTerm ? (
                    <div className="text-center py-6 text-sm text-slate-500">
                      {`No purchase orders found matching "${searchTerm}"`}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs font-medium h-8">
                            PO No.
                          </TableHead>
                          <TableHead className="text-xs font-medium h-8">
                            Vendor
                          </TableHead>
                          <TableHead className="text-xs font-medium h-8">
                            R.W.S. JOB NO.
                          </TableHead>
                          <TableHead className="text-xs font-medium h-8 text-right">
                            Date Ordered
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPurchaseOrders.map((po, index) => (
                          <PurchaseOrderPopup
                            purchaseOrder={po}
                            key={po.DocNumber || index}
                            onUpdate={handleUpdate}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoice">
              <Card className="border shadow-sm bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center space-x-2">
                      <Receipt className="w-4 h-4" />
                      <span>Invoices</span>
                    </div>
                    {searchTerm &&
                      filteredInvoices.length !== invoices.length && (
                        <span className="text-xs text-slate-500">
                          {filteredInvoices.length} of {invoices.length}
                        </span>
                      )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {filteredInvoices.length === 0 && searchTerm ? (
                    <div className="text-center py-6 text-sm text-slate-500">
                      {`No invoices found matching "${searchTerm}"`}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs font-medium h-8">
                            Invoice No.
                          </TableHead>
                          <TableHead className="text-xs font-medium h-8">
                            Customer PO
                          </TableHead>
                          <TableHead className="text-xs font-medium h-8">
                            R.W.S. Job No.
                          </TableHead>
                          <TableHead className="text-xs font-medium h-8 text-right">
                            Invoice Date
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.map((invoice, index) => (
                          <InvoicePopup
                            invoice={invoice}
                            key={index}
                            index={index}
                            onUpdate={handleUpdate}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
