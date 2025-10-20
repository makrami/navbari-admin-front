import ReactCountryFlag from "react-country-flag";

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="text-[11px] text-slate-400">{label}</div>
      <div
        className={`mt-1 text-sm ${
          highlight
            ? "text-orange-600 font-semibold"
            : "text-slate-900 font-semibold"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export function FinancialOverviewCard() {
  const payments: Array<{
    id: number;
    driver: string;
    country: string;
    countryCode: string;
    price: string;
    eta: string;
  }> = [
    {
      id: 1,
      driver: "Xin Zhao",
      country: "China",
      countryCode: "CN",
      price: "$16,256",
      eta: "4 Days",
    },
    {
      id: 2,
      driver: "Amina Ali",
      country: "Morocco",
      countryCode: "MA",
      price: "$12,980",
      eta: "2 Days",
    },
    {
      id: 3,
      driver: "John Doe",
      country: "United States",
      countryCode: "US",
      price: "$9,742",
      eta: "1 Day",
    },
    {
      id: 4,
      driver: "Carlos Ruiz",
      country: "Mexico",
      countryCode: "MX",
      price: "$18,210",
      eta: "3 Days",
    },
    {
      id: 5,
      driver: "Sofia Rossi",
      country: "Italy",
      countryCode: "IT",
      price: "$7,430",
      eta: "6 Days",
    },
    {
      id: 6,
      driver: "Yuki Tanaka",
      country: "Japan",
      countryCode: "JP",
      price: "$14,110",
      eta: "5 Days",
    },
    {
      id: 7,
      driver: "Hans Müller",
      country: "Germany",
      countryCode: "DE",
      price: "$11,520",
      eta: "1 Week",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border flex flex-col flex-1 h-full overflow-auto no-scrollbar  border-slate-200 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-9000 mb-4">
        Financial Overview
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Total Paid" value="$1,563,263,236" />
        <Stat label="Total Pending" value="$463,864" />
        <Stat label="Total Overdue" value="$51,739" highlight />
        <Stat label="Upcoming Payments" value={15} />
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-slate-900 mb-3">
          Upcoming Payments
        </h4>
        <div className="grid grid-cols-12 font-medium text-xs text-slate-900 px-3 mb-2">
          <div className="col-span-5">Driver</div>
          <div className="col-span-3">Country</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">ETA</div>
        </div>
        <div className="space-y-2">
          {payments.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-12 items-center rounded-xl bg-slate-50 px-3 py-2"
            >
              <div className="col-span-5 flex items-center gap-3">
                <img
                  src="/src/assets/images/avatar.png"
                  alt="driver"
                  className="w-6 h-6 rounded-full"
                />
                <div className="text-xs text-slate-600">{p.driver}</div>
              </div>
              <div className="col-span-3 flex items-center gap-2 text-xs text-slate-600">
                <ReactCountryFlag
                  svg
                  countryCode={p.countryCode}
                  style={{ width: 16, height: 12 }}
                />
                {p.country}
              </div>
              <div className="col-span-2 text-xs text-slate-900">{p.price}</div>
              <div className="col-span-2 text-xs text-amber-500 font-semibold">
                {p.eta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FinancialOverviewCard;
