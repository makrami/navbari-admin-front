import ReactCountryFlag from "react-country-flag";
import { useState } from "react";

export function PaysByCountryChart() {
  const countryData = [
    { country: "China", code: "CN", amount: 16000, label: "$16k" },
    { country: "Nauru", code: "NR", amount: 30000, label: "$30k" },
    { country: "Egypt", code: "EG", amount: 59492.1, label: "$59,492.10" },
    { country: "Japan", code: "JP", amount: 30000, label: "$30k" },
    { country: "France", code: "FR", amount: 8000, label: "$8k" },
    { country: "Germany", code: "DE", amount: 8000, label: "$8k" },
  ];

  const maxAmount = 60000; // Set max to $60k as shown in image
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">
        Pays by Country
      </h3>

      {/* Chart Container */}
      <div className="space-y-4">
        {/* Y-axis labels */}
        <div className="relative">
          <div className="  h-32 w-full">
            {/* Y-axis grid lines and labels */}
            <div className="absolute top-0 left-8 text-xs text-slate-500">
              $60k
            </div>
            <div className="absolute top-12 left-8 text-xs text-slate-500">
              $30k
            </div>
            <div className="absolute top-24 left-8 text-xs text-slate-500">
              $20k
            </div>
            <div className="absolute top-36 left-8 text-xs text-slate-500">
              $10k
            </div>
            <div className="absolute top-48 left-8 text-xs text-slate-500">
              $5k
            </div>
            <div className="absolute top-60 left-8 text-xs text-slate-500">
              $0
            </div>

            {/* Grid lines */}
            <div className="absolute top-2 left-16 right-0 h-px bg-slate-100"></div>
            <div className="absolute top-14 left-16 right-0 h-px bg-slate-100"></div>
            <div className="absolute top-26 left-16 right-0 h-px bg-slate-100"></div>
            <div className="absolute top-38 left-16 right-0 h-px bg-slate-100"></div>
            <div className="absolute top-50 left-16 right-0 h-px bg-slate-100"></div>
            <div className="absolute top-62 left-16 right-0 h-px bg-slate-100"></div>
          </div>

          {/* Bars */}
          <div className="flex items-end justify-between h-42 pt-16 pl-20 pr-4">
            {countryData.map((item) => {
              const barHeight = (item.amount / maxAmount) * 240; // Max height of 240px
              const isHovered = hoveredBar === item.code;

              return (
                <div
                  key={item.code}
                  className="flex flex-col items-center gap-2 relative"
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg z-10">
                      <div className="text-sm font-medium text-slate-900">
                        $
                        {item.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                    </div>
                  )}

                  {/* Country flag and bar */}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="bg-blue-600 w-8 rounded-t-sm transition-all duration-200 hover:bg-blue-700"
                      style={{ height: `${barHeight}px` }}
                      onMouseEnter={() => setHoveredBar(item.code)}
                      onMouseLeave={() => setHoveredBar(null)}
                    ></div>
                    <ReactCountryFlag
                      svg
                      countryCode={item.code}
                      style={{ width: 24, height: 16 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
