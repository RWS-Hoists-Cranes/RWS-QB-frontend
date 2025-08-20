"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import {
  FileText,
  BarChart3,
  Package,
  Receipt,
  AlertCircle,
  CreditCard,
  User,
} from "lucide-react";

export default function PickForm({ selectedForm, setSelectedForm }) {
  const formOptions = [
    {
      value: "invoice-report",
      label: "Invoice Report",
      icon: <Receipt className="w-4 h-4" />,
      description: "Detailed invoice listing",
    },
    {
      value: "invoice-summary",
      label: "Invoice Summary",
      icon: <BarChart3 className="w-4 h-4" />,
      description: "Summary statistics",
    },
    {
      value: "order-report",
      label: "Order Report",
      icon: <Package className="w-4 h-4" />,
      description: "Order details and status",
    },
    {
      value: "order-summary",
      label: "Order Summary",
      icon: <BarChart3 className="w-4 h-4" />,
      description: "Order analytics",
    },
    {
      value: "purchase-order-report",
      label: "Purchase Order Report",
      icon: <FileText className="w-4 h-4" />,
      description: "PO details and tracking",
    },
    {
      value: "purchase-order-summary",
      label: "Purchase Order Summary",
      icon: <BarChart3 className="w-4 h-4" />,
      description: "PO analytics",
    },
    {
      value: "outstanding-order",
      label: "Outstanding Order",
      icon: <AlertCircle className="w-4 h-4" />,
      description: "Pending orders",
    },
    {
      value: "receivables",
      label: "Accounts Receivable List",
      icon: <CreditCard className="w-4 h-4" />,
      description: "Outstanding receivables",
    },
    {
      value: "account-statement",
      label: "Customer Account Statement",
      icon: <User className="w-4 h-4" />,
      description: "Customer statement",
    },
  ];

  return (
    <div className="space-y-3">
      <RadioGroup
        onValueChange={setSelectedForm}
        value={selectedForm}
        className="space-y-2"
      >
        {formOptions.map((option) => (
          <div
            key={option.value}
            className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 ${
              selectedForm === option.value
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <RadioGroupItem
              value={option.value}
              id={option.value}
              className="mt-1"
            />
            <div className="flex items-start space-x-3 flex-1">
              <div
                className={`p-2 rounded-md ${
                  selectedForm === option.value
                    ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                {option.icon}
              </div>
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor={option.value}
                  className={`font-medium cursor-pointer ${
                    selectedForm === option.value
                      ? "text-blue-900 dark:text-blue-100"
                      : "text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {option.label}
                </Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {option.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
