import { useState, useEffect } from "react";
// import { DashboardCards } from "./components/DashboardCards";
// import { FinanceDashboardSections } from "./components/FinanceDashboardSections";
// import { RecentActivities } from "./components/RecentActivities";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import CargoMap, { type Segment } from "../../components/CargoMap";

export function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const segments = [
    {
      color: "#ff0000",
      path: [
        [2.3522, 48.8566], // Paris
        [4.8357, 45.764], // Lyon
      ],
      meta: { vehicleId: "TRK-101", driverId: "DRV-1" },
    },
    {
      color: "#00aa55",
      path: [
        [4.8357, 45.764], // Lyon
        [13.405, 52.52], // Berlin
      ],
      meta: { vehicleId: "TRK-101", driverId: "DRV-1" },
    },
  ] satisfies Segment[];

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
        {/* <DashboardCards /> */}

        {/* Live Map Demo */}
        <CargoMap
          segments={segments}
          initialView={{ longitude: 7.5, latitude: 49.0, zoom: 4 }}
        />

        {/* Finance Sections */}
        {/* <FinanceDashboardSections /> */}
        {/* Recent Activities */}
        {/* <RecentActivities /> */}
      </div>
    </div>
  );
}
