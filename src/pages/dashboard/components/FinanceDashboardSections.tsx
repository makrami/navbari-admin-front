import { FinancialOverviewCard } from "./FinancialOverviewCard";
import { OnTimeDeliveryCard } from "./OnTimeDeliveryCard";
import { AverageDelayRateChart } from "./AverageDelayRateChart";

export function FinanceDashboardSections() {
  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full h-auto md:h-[520px]">
      <div className="w-full md:w-1/2">
        <FinancialOverviewCard />
      </div>
      <div className="flex flex-col gap-3 md:gap-4 w-full md:w-1/2">
        <AverageDelayRateChart />

        <OnTimeDeliveryCard />
      </div>
    </div>
  );
}

export default FinanceDashboardSections;
