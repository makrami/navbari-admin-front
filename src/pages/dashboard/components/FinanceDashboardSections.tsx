import { FinancialOverviewCard } from "./FinancialOverviewCard";
import { OnTimeDeliveryCard } from "./OnTimeDeliveryCard";
import { AverageDelayRateChart } from "./AverageDelayRateChart";

export function FinanceDashboardSections() {
  return (
    <div className="flex gap-4 w-full h-[520px]">
      <FinancialOverviewCard />
      <div className="flex flex-col gap-4 w-1/2 ">
        <AverageDelayRateChart />

        <OnTimeDeliveryCard />
      </div>
    </div>
  );
}

export default FinanceDashboardSections;
