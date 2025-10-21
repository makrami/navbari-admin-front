import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { FilterSearchSection } from "./components/FilterSearchSection";
import { SummaryCards } from "./components/SummaryCards";
import { PaysByCountryChart } from "./components/PaysByCountryChart";
import { PaysStatusRatioChart } from "./components/PaysStatusRatioChart";
import { ActivitySection } from "./components/ActivitySection";
import { AddPaymentDrawer } from "./components/AddPaymentDrawer";
import { FinancePageSkeleton } from "./components/FinanceSkeleton";

export function FinancePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <FinancePageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <div className="py-6 space-y-4 max-w-7xl mx-auto px-4 transition-all">
        {/* Header Section */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className=" font-bold text-slate-900">Finance</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 font-medium"
            >
              Add Payment
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        {/* Filter and Search Section */}
        <FilterSearchSection />

        {/* Summary Cards */}

        {/* Charts Section */}
        <div className="flex gap-4">
          <div className=" flex flex-1 flex-col gap-4">
            <SummaryCards />

            <PaysByCountryChart />
          </div>
          <PaysStatusRatioChart />
        </div>

        {/* Activity Section */}
        <ActivitySection />
      </div>

      {/* Add Payment Drawer */}
      <AddPaymentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
