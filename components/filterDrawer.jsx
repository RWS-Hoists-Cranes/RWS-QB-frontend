"use client";

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
} from "@/components/ui/drawer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PickDates from "./pickDates";
import PickTerritory from "./pickTerritory";
import PickForm from "./pickForm";
import PickCustomer from "./pickCustomer";
import { useState } from "react";
import { startOfMonth, endOfMonth, startOfDay } from "date-fns";
import { ErrorAlert, SuccessAlert } from "./CustomAlert";
import PickService from "./pickService";
import {
  Filter,
  Calendar,
  MapPin,
  User,
  Wrench,
  FileText,
  Loader2,
} from "lucide-react";
import { Badge } from "./ui/badge";

export default function FilterDrawer() {
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    return {
      from: startOfDay(startOfMonth(now)),
      to: startOfDay(endOfMonth(now)),
    };
  });

  const [territory, setTerritory] = useState("");
  const [selectedForm, setSelectedForm] = useState("invoice-report");
  const [customer, setCustomer] = useState("");
  const [service, setService] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function printForm() {
    // Input validation
    if (selectedForm === "account-statement" && customer === "") {
      setErrorMessage(
        "Please select a Customer to get their Account Statement"
      );
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      setErrorMessage("Please select a valid date range");
      return;
    }

    // Clear previous error messages and set loading state
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/filteredForm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRange,
          territory,
          reportType: selectedForm,
          customer,
          service,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const html = await response.text();
      openHtmlInNewTab(html);
    } catch (error) {
      console.error("Error printing filtered form", error);
      setErrorMessage(`Cannot print the filtered form: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0;
    if (territory) count++;
    if (customer) count++;
    if (service) count++;
    if (dateRange?.from && dateRange?.to) count++;
    return count;
  };

  const getFormDisplayName = () => {
    const formMap = {
      "invoice-report": "Invoice Report",
      "invoice-summary": "Invoice Summary",
      "order-report": "Order Report",
      "order-summary": "Order Summary",
      "purchase-order-report": "Purchase Order Report",
      "purchase-order-summary": "Purchase Order Summary",
      "outstanding-order": "Outstanding Order",
      receivables: "Accounts Receivable",
      "account-statement": "Account Statement",
    };
    return formMap[selectedForm] || selectedForm;
  };

  const openHtmlInNewTab = (htmlContent) => {
    const newWindow = window.open("");
    newWindow.document.write(htmlContent);
    newWindow.print();
    newWindow.close();
  };

  return (
    <>
      {errorMessage && <ErrorAlert message={errorMessage} />}

      <Drawer direction="left">
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed top-4 left-4 z-50 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 min-w-[20px] text-xs"
              >
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="w-full sm:w-96 h-full flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-r border-slate-200 dark:border-slate-700">
          <DrawerHeader className="flex w-full justify-between items-center flex-shrink-0 border-b border-slate-200 dark:border-slate-700 pb-4">
            <div className="space-y-1">
              <DrawerTitle className="text-xl font-bold flex items-center space-x-2">
                <Filter className="w-5 h-5 text-blue-600" />
                <span>Filtering System</span>
              </DrawerTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Configure report parameters
              </p>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <RxDoubleArrowLeft className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div
            className="flex-1 overflow-y-auto px-4"
            style={{ paddingRight: "20px", marginRight: "-16px" }}
          >
            <Accordion
              type="multiple"
              collapsible
              defaultValue={["pick-form"]}
              className="space-y-2"
            >
              <AccordionItem
                value="pick-date"
                className="border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium">Pick Dates</span>
                    {dateRange?.from && dateRange?.to && (
                      <Badge variant="outline" className="ml-auto">
                        Selected
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <PickDates
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="pick-territory"
                className="border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-md flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium">Pick Territory</span>
                    {territory && (
                      <Badge variant="outline" className="ml-auto">
                        Selected
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <PickTerritory value={territory} setValue={setTerritory} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="pick-customer"
                className="border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-md flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-medium">Pick Customer</span>
                    {customer && (
                      <Badge variant="outline" className="ml-auto">
                        Selected
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <PickCustomer value={customer} setValue={setCustomer} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="pick-service"
                className="border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-md flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="font-medium">Pick Service</span>
                    {service && (
                      <Badge variant="outline" className="ml-auto">
                        Selected
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <PickService value={service} setValue={setService} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="pick-form"
                className="border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-md flex items-center justify-center">
                      <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-medium">Pick Form</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {getFormDisplayName()}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <PickForm
                    selectedForm={selectedForm}
                    setSelectedForm={setSelectedForm}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <DrawerFooter className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="space-y-3">
              {/* Selected filters summary */}
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Report Type:</span>
                  <span className="font-medium">{getFormDisplayName()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Filters:</span>
                  <span className="font-medium">{getActiveFiltersCount()}</span>
                </div>
              </div>

              <DrawerClose asChild>
                <Button
                  onClick={printForm}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
