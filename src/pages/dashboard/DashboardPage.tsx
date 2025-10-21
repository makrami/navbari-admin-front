import { useState, useEffect } from "react";
import { DashboardCards } from "./components/DashboardCards";
import { MapSection } from "./components/MapSection";
import { FinanceDashboardSections } from "./components/FinanceDashboardSections";
import { RecentActivities } from "./components/RecentActivities";
import { DashboardSkeleton } from "./components/DashboardSkeleton";

export function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <div className="py-6 space-y-4 max-w-7xl mx-auto px-4 transition-all">
        {/* Header Section */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-bold text-slate-900">Dashboard</h1>
          </div>
        </div>

        {/* Dashboard Cards */}
        <DashboardCards />

        {/* Map Section */}
        <MapSection />

        {/* Finance Sections */}
        <FinanceDashboardSections />
        {/* Recent Activities */}
        <RecentActivities />
      </div>
    </div>
  );
}
