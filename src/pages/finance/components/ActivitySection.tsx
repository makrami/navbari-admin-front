import ReactCountryFlag from "react-country-flag";
import { Eye, Edit, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../../shared/utils/cn";

export function ActivitySection() {
  const activityData = [
    {
      id: "#SHP-61336",
      date: "22 Sep - 25 Sep",
      segment: "#3 Rome/Napoli",
      localCompany: { name: "DHL Logest..", country: "CN" },
      driver: { name: "Xin Zhao", avatar: "/src/assets/images/avatar.png" },
      amount: "$16,256 (Wire)",
      status: "Delivered",
      statusColor: "text-green-600",
      reason: <FileText className="w-4 h-4 text-slate-400" />,
    },
    {
      id: "#SHP-61336",
      date: "22 Sep - 25 Sep",
      segment: "#3 Napoli/Rome",
      localCompany: { name: "DHL Logest..", country: "CN" },
      driver: { name: "Xin Zhao", avatar: "/src/assets/images/avatar.png" },
      amount: "$16,256 (Wire)",
      status: "Delivered",
      statusColor: "text-green-600",
      reason: <FileText className="w-4 h-4 text-slate-400" />,
    },
    {
      id: "#SHP-61452",
      date: "26 Sep - 29 Sep",
      segment: "#4 Venice/Venice",
      localCompany: { name: "FedEx Express", country: "CN" },
      driver: { name: "Liu Wei", avatar: "/src/assets/images/avatar.png" },
      amount: "$12,780 (Credit..)",
      status: "In Transit",
      statusColor: "text-orange-500",
      reason: <FileText className="w-4 h-4 text-slate-400" />,
    },
    {
      id: "#SHP-61547",
      date: "30 Sep - 03 Oct",
      segment: "#2 Florence/Flore..",
      localCompany: { name: "UPS Ground", country: "CN" },
      driver: { name: "Maria Rossi", avatar: "/src/assets/images/avatar.png" },
      amount: "$9,450 (PayPal)",
      status: "Pending",
      statusColor: "text-yellow-500",
      reason: <FileText className="w-4 h-4 text-slate-400" />,
    },
    {
      id: "#SHP-61689",
      date: "04 Oct - 07 Oct",
      segment: "#5 Milan/Rome",
      localCompany: { name: "TNT Express", country: "CN" },
      driver: {
        name: "Giovanni Bia..",
        avatar: "/src/assets/images/avatar.png",
      },
      amount: "$14,300 (Wire)",
      status: "Delivered",
      statusColor: "text-green-600",
      reason: <FileText className="w-4 h-4 text-slate-400" />,
    },
  ];

  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1.3fr_0.7fr_0.8fr] items-center px-3 py-2 text-xs font-semibold text-slate-900">
        <div>ID</div>
        <div>Date</div>
        <div>Segment</div>
        <div>Local Comp.</div>
        <div>Driver</div>
        <div>Amount</div>
        <div>Status</div>
        <div>Reason</div>
        <div>Actions</div>
      </div>
      <ul className="space-y-3 divide-slate-100">
        {activityData.map((row, index) => (
          <li
            key={row.id + index}
            className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_0.2fr_1.3fr] bg-slate-50 items-center gap-3 rounded-lg px-3 py-3 text-sm"
          >
            {/* ID */}
            <span className="text-slate-600 font-medium">{row.id}</span>

            {/* Date */}
            <span className="text-slate-600">{row.date}</span>

            {/* Segment */}
            <span className="text-slate-600">
              <span className="font-semibold">{row.segment.split("/")[0]}</span>
              <span className="text-slate-500">
                /{row.segment.split("/")[1]}
              </span>
            </span>

            {/* Local Company */}
            <div className="flex items-center gap-2">
              <ReactCountryFlag
                svg
                countryCode={row.localCompany.country}
                style={{ width: 16, height: 12 }}
              />
              <span className="text-slate-600">{row.localCompany.name}</span>
            </div>

            {/* Driver */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center">
                <span className="text-xs text-slate-600">
                  {row.driver.name.charAt(0)}
                </span>
              </div>
              <span className="text-slate-600">{row.driver.name}</span>
            </div>

            {/* Amount */}
            <span className="text-slate-600">{row.amount}</span>

            {/* Status */}
            <span className={cn("font-medium", row.statusColor)}>
              {row.status}
            </span>

            {/* Reason */}
            <div className="flex items-center justify-center h-6 hover:bg-slate-100 rounded transition-colors bg-white border border-slate-200">
              {row.reason}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-2">
              <button className="p-1 hover:bg-slate-100 bg-white border border-slate-200 rounded transition-colors">
                <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
              <button className="p-1 hover:bg-slate-100 bg-white border border-slate-200 rounded transition-colors">
                <Edit className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 pt-4 text-sm text-slate-600">
        <button
          className="grid place-items-center rounded-md bg-slate-100 size-6"
          aria-label="Prev"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="inline-flex items-center gap-2">
          <button className="rounded-full bg-blue-600 text-white size-6 grid place-items-center text-xs">
            1
          </button>
          <button className="text-slate-600">2</button>
          <button className="text-slate-600">3</button>
          <span className="text-slate-400">…</span>
          <button className="text-slate-600">43</button>
        </div>
        <button
          className="grid place-items-center rounded-md bg-slate-100 size-6"
          aria-label="Next"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
