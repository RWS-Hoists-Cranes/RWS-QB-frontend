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
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export default function Estimate() {
  const [estimates, setEstimates] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMonths, setOpenMonths] = useState(new Set());

  // Utility function to get month-year key from date
  const getMonthYear = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown";

    // Use UTC methods to avoid timezone issues with month boundaries
    const year = date.getUTCFullYear();
    const month = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      timeZone: "UTC",
    });

    return month;
  };

  // Utility function to group items by month-year
  const groupByMonth = (items, getDateFn) => {
    const grouped = {};
    items.forEach((item) => {
      const monthYear = getMonthYear(getDateFn(item));
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(item);
    });

    // Sort months in descending order (newest first)
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;

      // Parse "Month YYYY" format properly
      const dateA = new Date(a + " 1"); // Add day to make it parseable
      const dateB = new Date(b + " 1");
      return dateB - dateA;
    });

    const sortedGrouped = {};
    sortedKeys.forEach((key) => {
      // Sort items within each month by their primary identifier
      sortedGrouped[key] = grouped[key];
    });

    return sortedGrouped;
  };

  // Sorting functions for each form type
  const sortEstimates = (estimates) => {
    return [...estimates].sort((a, b) => {
      const aNum = parseInt(a.DocNumber) || 0;
      const bNum = parseInt(b.DocNumber) || 0;
      return bNum - aNum; // Descending order (newest first)
    });
  };

  const sortOrders = (orders) => {
    return [...orders].sort((a, b) => {
      const aNum = parseInt(a.order_number) || 0;
      const bNum = parseInt(b.order_number) || 0;
      return bNum - aNum; // Descending order (newest first)
    });
  };

  const sortPurchaseOrders = (purchaseOrders) => {
    return [...purchaseOrders].sort((a, b) => {
      const aNum = parseInt(a.DocNumber) || 0;
      const bNum = parseInt(b.DocNumber) || 0;
      return bNum - aNum; // Descending order (newest first)
    });
  };

  const sortInvoices = (invoices) => {
    return [...invoices].sort((a, b) => {
      const aNum = parseInt(a.DocNumber) || 0;
      const bNum = parseInt(b.DocNumber) || 0;
      return bNum - aNum; // Descending order (newest first)
    });
  };

  // Toggle month section open/closed
  const toggleMonth = (monthYear) => {
    const newOpenMonths = new Set(openMonths);
    if (newOpenMonths.has(monthYear)) {
      newOpenMonths.delete(monthYear);
    } else {
      newOpenMonths.add(monthYear);
    }
    setOpenMonths(newOpenMonths);
  };

  // Initialize with current month open
  useEffect(() => {
    const currentMonth = getMonthYear(new Date());
    setOpenMonths(new Set([currentMonth]));
  }, []);

  // Individual fetch functions that can be called independently
  const fetchEstimates = async () => {
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
      console.error("Error fetching estimates:", error);
      setEstimates([]);
    }
  };

  const fetchOrders = async () => {
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

      // Sort orders by order number in descending order
      const sortedOrders = ordersData.sort((a, b) => {
        const orderA = parseInt(a.order_number) || 0;
        const orderB = parseInt(b.order_number) || 0;
        return orderB - orderA; // Descending order (newest first)
      });

      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  };

  const fetchInvoices = async () => {
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
  };

  const fetchPurchaseOrders = async () => {
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
  };

  // Initial load - fetch all data once
  useEffect(() => {
    fetchEstimates();
    fetchOrders();
    fetchInvoices();
    fetchPurchaseOrders();
  }, []); // Only run once on mount

  // Specific update handlers for each data type
  const handleEstimateUpdate = () => {
    fetchEstimates();
  };

  const handleOrderUpdate = () => {
    fetchOrders();
  };

  const handleInvoiceUpdate = () => {
    fetchInvoices();
  };

  const handlePurchaseOrderUpdate = () => {
    fetchPurchaseOrders();
  };

  // Refresh all data (for manual refresh button)
  const handleRefreshAll = () => {
    fetchEstimates();
    fetchOrders();
    fetchInvoices();
    fetchPurchaseOrders();
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

      // Check these specific fields that are displayed in the table
      const orderNumber = order.order_number?.toString().toLowerCase();
      const customerName = order.estimate?.CustomerRef?.name
        ?.toString()
        .toLowerCase();
      const customerPO = order.customer_PO?.toString().toLowerCase();
      const quotationNumber = order.quotation_number?.toString().toLowerCase();

      // Use only the displayed date format, not raw timestamps
      const displayedDate =
        order.estimate?.TxnDate || order.date_ordered?.split("T")[0];
      const dateOrdered = displayedDate?.toString().toLowerCase();

      const matches =
        (orderNumber && orderNumber.includes(searchLower)) ||
        (customerName && customerName.includes(searchLower)) ||
        (customerPO && customerPO.includes(searchLower)) ||
        (quotationNumber && quotationNumber.includes(searchLower)) ||
        (dateOrdered && dateOrdered.includes(searchLower));

      return matches;
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
  const filteredEstimates = sortEstimates(
    filterEstimates(estimates, searchTerm)
  );
  const filteredOrders = sortOrders(filterOrders(orders, searchTerm));
  const filteredInvoices = sortInvoices(filterInvoices(invoices, searchTerm));
  const filteredPurchaseOrders = sortPurchaseOrders(
    filterPurchaseOrders(purchaseOrders, searchTerm)
  );

  // Group filtered and sorted data by month
  const groupedEstimates = groupByMonth(
    filteredEstimates,
    (estimate) => estimate.TxnDate
  );
  const groupedOrders = groupByMonth(
    filteredOrders,
    (order) => order.estimate?.TxnDate || order.date_ordered
  );
  const groupedInvoices = groupByMonth(
    filteredInvoices,
    (invoice) => invoice.TxnDate || invoice.order?.date_ordered
  );
  const groupedPurchaseOrders = groupByMonth(
    filteredPurchaseOrders,
    (po) => po.TxnDate || po.dbData?.date_ordered
  );

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Component for rendering month sections
  const MonthSection = ({ monthYear, items, children, totalCount }) => {
    const isOpen = openMonths.has(monthYear);

    return (
      <div className="border border-slate-200 rounded mb-3 overflow-hidden">
        <div
          className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all duration-200"
          onClick={() => toggleMonth(monthYear)}
        >
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white">
              {isOpen ? (
                <ChevronDown className="w-2.5 h-2.5 text-slate-600" />
              ) : (
                <ChevronRight className="w-2.5 h-2.5 text-slate-600" />
              )}
            </div>
            <span className="font-medium text-slate-800 text-sm">
              {monthYear}
            </span>
            <Badge
              variant="outline"
              className="text-xs bg-white border-slate-300 text-slate-700 px-2 py-0.5 h-5"
            >
              {items.length}
            </Badge>
          </div>
        </div>
        {isOpen && (
          <div className="bg-white max-h-[78vh] overflow-y-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                {children.tableHeader}
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {children.tableBody}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    );
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
      <div className="bg-white border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded flex items-center justify-center">
                <Building2 className="w-3 h-3 text-white" />
              </div>
              <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                RWS Dashboard
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              className="hidden sm:flex h-7 px-3 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2">
        <div className="space-y-2">
          {/* Search Bar */}
          <div className="flex justify-end">
            <Card className="w-full max-w-sm border shadow-sm bg-white">
              <CardContent className="p-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-8 h-8 text-sm border-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0 hover:bg-slate-100 rounded-full"
                    >
                      <X className="w-2.5 h-2.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="quotes" className="space-y-3">
            {/* Tabs */}
            <div className="bg-white rounded border border-slate-200 p-1">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-0 bg-transparent gap-1">
                {tabData.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center justify-between data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 py-2 px-3 text-sm font-medium rounded transition-all duration-200 hover:bg-slate-50"
                  >
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3.5 h-3.5">{tab.icon}</div>
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">
                        {tab.label.split(" ")[0]}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs h-4 px-1.5 ${
                        searchTerm && tab.count !== tab.totalCount
                          ? "bg-orange-100 text-orange-800 border-orange-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {searchTerm && tab.count !== tab.totalCount
                        ? `${tab.count}/${tab.totalCount}`
                        : tab.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {/* Tab Content */}
            <TabsContent value="quotes" className="mt-3">
              <Card className="border bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                        <FileText className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-slate-800">Quotes</span>
                    </div>
                    {searchTerm &&
                      filteredEstimates.length !== estimates.length && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {filteredEstimates.length}/{estimates.length}
                        </span>
                      )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 px-0">
                  {filteredEstimates.length === 0 && searchTerm ? (
                    <div className="text-center py-8 text-slate-500 px-6">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium mb-1">
                        No quotes found
                      </p>
                      <p className="text-xs">{`No quotes match "${searchTerm}"`}</p>
                    </div>
                  ) : Object.keys(groupedEstimates).length === 0 ? (
                    <div className="text-center py-8 text-slate-500 px-6">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium mb-1">Forms Loading</p>
                      <p className="text-xs">
                        Initial website launch may take up to 5s
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[82vh] overflow-y-auto px-4 space-y-3">
                      {Object.entries(groupedEstimates).map(
                        ([monthYear, monthEstimates]) => (
                          <MonthSection
                            key={monthYear}
                            monthYear={monthYear}
                            items={monthEstimates}
                          >
                            {{
                              tableHeader: (
                                <TableRow>
                                  <TableHead className="text-xs font-semibold h-8 text-slate-600 py-2">
                                    Quote No.
                                  </TableHead>
                                  <TableHead className="text-xs font-semibold h-8 text-slate-600 py-2">
                                    Customer
                                  </TableHead>
                                  <TableHead className="text-xs font-semibold h-8 text-slate-600 py-2">
                                    Date Quoted
                                  </TableHead>
                                  <TableHead className="text-xs font-semibold h-8 text-right text-slate-600 py-2">
                                    Actions
                                  </TableHead>
                                </TableRow>
                              ),
                              tableBody: monthEstimates.map((estimate) => (
                                <EstimatePopup
                                  estimate={estimate}
                                  key={estimate.Id}
                                  onUpdate={handleEstimateUpdate}
                                />
                              )),
                            }}
                          </MonthSection>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="order_form" className="mt-3">
              <Card className="border bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                        <ShoppingCart className="w-3 h-3 text-orange-600" />
                      </div>
                      <span className="text-slate-800">Order Forms</span>
                    </div>
                    {searchTerm && filteredOrders.length !== orders.length && (
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {filteredOrders.length}/{orders.length}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 px-0">
                  {filteredOrders.length === 0 && searchTerm ? (
                    <div className="text-center py-8 text-slate-500 px-6">
                      <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium mb-1">
                        No order forms found
                      </p>
                      <p className="text-xs">{`No order forms match "${searchTerm}"`}</p>
                    </div>
                  ) : Object.keys(groupedOrders).length === 0 ? (
                    <div className="text-center py-8 text-slate-500 px-6">
                      <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium mb-1">
                        No order forms available
                      </p>
                      <p className="text-xs">
                        Initial website launch may take up to 5s
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[82vh] overflow-y-auto px-4 space-y-3">
                      {Object.entries(groupedOrders).map(
                        ([monthYear, monthOrders]) => (
                          <MonthSection
                            key={monthYear}
                            monthYear={monthYear}
                            items={monthOrders}
                          >
                            {{
                              tableHeader: (
                                <TableRow>
                                  <TableHead className="text-xs font-semibold h-8 text-slate-600 py-2">
                                    Order No.
                                  </TableHead>
                                  <TableHead className="text-xs font-semibold h-8 text-slate-600 py-2">
                                    Customer
                                  </TableHead>
                                  <TableHead className="text-xs font-semibold h-8 text-slate-600 py-2">
                                    Customer PO
                                  </TableHead>
                                  <TableHead className="text-xs font-semibold h-8 text-slate-600 py-2">
                                    Quotation Ref.
                                  </TableHead>
                                  <TableHead className="text-xs font-semibold h-8 text-right text-slate-600 py-2">
                                    Date Ordered
                                  </TableHead>
                                </TableRow>
                              ),
                              tableBody: monthOrders.map((order) => (
                                <OrderPopup
                                  order={order}
                                  key={`${order.order_number || "no-order"}-${
                                    order.quotation_number || "no-quote"
                                  }-${order.id || Math.random()}`}
                                  onUpdate={handleOrderUpdate}
                                />
                              )),
                            }}
                          </MonthSection>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="purchase_order" className="mt-3">
              <Card className="border bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                        <Package className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-slate-800">Purchase Orders</span>
                    </div>
                    {searchTerm &&
                      filteredPurchaseOrders.length !==
                        purchaseOrders.length && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {filteredPurchaseOrders.length}/
                          {purchaseOrders.length}
                        </span>
                      )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 px-0">
                  {filteredPurchaseOrders.length === 0 && searchTerm ? (
                    <div className="text-center py-8 text-slate-500 px-6">
                      <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium mb-1">
                        No purchase orders found
                      </p>
                      <p className="text-xs">{`No purchase orders match "${searchTerm}"`}</p>
                    </div>
                  ) : Object.keys(groupedPurchaseOrders).length === 0 ? (
                    <div className="text-center py-8 text-slate-500 px-6">
                      <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium mb-1">
                        No purchase orders available
                      </p>
                      <p className="text-xs">
                        Initial website launch may take up to 5s
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[82vh] overflow-y-auto px-4 space-y-3">
                      {Object.entries(groupedPurchaseOrders).map(
                        ([monthYear, monthPOs]) => (
                          <MonthSection
                            key={monthYear}
                            monthYear={monthYear}
                            items={monthPOs}
                          >
                            {{
                              tableHeader: (
                                <TableRow>
                                  <TableHead className="text-xs font-semibold h-8 text-slate-600 py-2">
                                    PO No.
                                  </TableHead>
                                  <TableHead className="text-xs font-semibold h-8 text-slate-600 py-2">
                                    Vendor
                                  </TableHead>
                                  <TableHead className="text-xs font-semibold h-8 text-slate-600 py-2">
                                    R.W.S. JOB NO.
                                  </TableHead>
                                  <TableHead className="text-xs font-semibold h-8 text-right text-slate-600 py-2">
                                    Date Ordered
                                  </TableHead>
                                </TableRow>
                              ),
                              tableBody: monthPOs.map((po, index) => (
                                <PurchaseOrderPopup
                                  purchaseOrder={po}
                                  key={po.DocNumber || index}
                                  onUpdate={handlePurchaseOrderUpdate}
                                />
                              )),
                            }}
                          </MonthSection>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>{" "}
            <TabsContent value="invoice" className="mt-3">
              <Card className="border bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                        <Receipt className="w-3 h-3 text-purple-600" />
                      </div>
                      <span className="text-slate-800">Invoices</span>
                    </div>
                    {searchTerm &&
                      filteredInvoices.length !== invoices.length && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {filteredInvoices.length}/{invoices.length}
                        </span>
                      )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 px-0">
                  {filteredInvoices.length === 0 && searchTerm ? (
                    <div className="text-center py-8 text-slate-500 px-6">
                      <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium mb-1">
                        No invoices found
                      </p>
                      <p className="text-xs">{`No invoices match "${searchTerm}"`}</p>
                    </div>
                  ) : Object.keys(groupedInvoices).length === 0 ? (
                    <div className="text-center py-8 text-slate-500 px-6">
                      <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium mb-1">
                        No invoices available
                      </p>
                      <p className="text-xs">
                        Initial website launch may take up to 5s
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[82vh] overflow-y-auto px-4 space-y-3">
                      {Object.entries(groupedInvoices).map(
                        ([monthYear, monthInvoices]) => (
                          <MonthSection
                            key={monthYear}
                            monthYear={monthYear}
                            items={monthInvoices}
                          >
                            {{
                              tableHeader: (
                                <TableRow>
                                  <TableHead className="text-xs font-semibold h-8 text-slate-600 py-2">
                                    Invoice No.
                                  </TableHead>
                                  <TableHead className="text-xs font-semibold h-8 text-slate-600 py-2">
                                    Customer
                                  </TableHead>
                                  <TableHead className="text-xs font-semibold h-8 text-slate-600 py-2">
                                    Customer PO
                                  </TableHead>
                                  <TableHead className="text-xs font-semibold h-8 text-slate-600 py-2">
                                    R.W.S. Job No.
                                  </TableHead>
                                  <TableHead className="text-xs font-semibold h-8 text-right text-slate-600 py-2">
                                    Invoice Date
                                  </TableHead>
                                </TableRow>
                              ),
                              tableBody: monthInvoices.map((invoice, index) => (
                                <InvoicePopup
                                  invoice={invoice}
                                  key={index}
                                  index={index}
                                  onUpdate={handleInvoiceUpdate}
                                />
                              )),
                            }}
                          </MonthSection>
                        )
                      )}
                    </div>
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
