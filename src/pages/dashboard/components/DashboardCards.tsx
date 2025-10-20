import { IdCard, MessageSquareDot, Truck, UsersRound } from "lucide-react";
import { DashboardCard } from "../../../shared/components";

export function DashboardCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <DashboardCard
        icon={<Truck className="text-green-600 size-5" />}
        iconBgColor="#dcfce7"
        title="Total Shipments"
        subInfo1="76 active, 538 delivered"
        subInfo2="614 total"
      />

      <DashboardCard
        icon={<UsersRound className="text-yellow-600 size-5" />}
        iconBgColor="#fef3c7"
        title="Segments Awaiting Driver"
        subInfo1="6 arriving soon, 9 unassigned"
        subInfo2="6 countries impacted"
      />

      <DashboardCard
        icon={<IdCard className="text-orange-600 size-5" />}
        iconBgColor="#fed7aa"
        title="New Awaiting Registrations"
        subInfo1="6 new drivers, 9 new companies"
        subInfo2="last request: 2h ago"
      />

      <DashboardCard
        icon={<MessageSquareDot className="text-violet-600 size-5" />}
        iconBgColor="#e9d5ff"
        title="Unread Messages"
        subInfo1="6 unread, 9 waiting response"
        subInfo2="last message: 25m ago"
      />
    </div>
  );
}

export default DashboardCards;
