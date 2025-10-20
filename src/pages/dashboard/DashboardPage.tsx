import { DashboardCards } from "./components/DashboardCards";
import { MapSection } from "./components/MapSection";
import { FinanceDashboardSections } from "./components/FinanceDashboardSections";
import { RecentActivities } from "./components/RecentActivities";

export function DashboardPage() {
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
