"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Building2, CheckCircle } from "lucide-react";

export default function HomeClient() {
  const router = useRouter();

  const handleClick = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Logo/Brand Area */}
          <div className="space-y-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                RWS QuickBooks
              </h1>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-6 pt-12">
            <Button
              onClick={handleClick}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Connect to QuickBooks
            </Button>
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Secure OAuth2 authentication</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2024 RWS Hoists & Cranes
          </p>
        </div>
      </footer>
    </div>
  );
}
