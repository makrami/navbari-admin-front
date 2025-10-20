import ReactCountryFlag from "react-country-flag";
import { useState } from "react";

export function AverageDelayRateChart() {
  const countryData = [
    { country: "China", code: "CN", delayHours: 2.6 },
    { country: "Nauru", code: "NR", delayHours: 5.0 },
    { country: "Egypt", code: "EG", delayHours: 6 },
    { country: "Japan", code: "JP", delayHours: 5.0 },
    { country: "United States", code: "US", delayHours: 2.7 },
  ];

  const maxDelayHours = 6; // Max value for Y-axis
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  return (
    <div className="bg-white h-1/2 rounded-2xl p-5 shadow-sm border  border-slate-200">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">
        Average Delay Rate by Country
      </h3>

      {/* Chart Container */}
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-3 w-8">
          {[0, 1, 2, 3, 4, 5, 6].map((hour) => (
            <div
              key={hour}
              className="absolute text-xs text-slate-500"
              style={{
                bottom: `${(hour / 6.7) * 100}%`,
                transform: "translateY(-50%)",
              }}
            >
              {hour}hrs
            </div>
          ))}
        </div>

        {/* Grid lines */}
        <div className="ml-10 h-24">
          {[0, 1, 2, 3, 4, 5, 6].map((hour) => (
            <div
              key={hour}
              className="absolute w-[90%] bottom-0 h-px bg-slate-200"
              style={{ top: `${(hour / 7.1) * 100}%` }}
            />
          ))}
        </div>

        {/* Bars */}
        <div className="flex items-end justify-between h-16 pt-2 pl-10 pr-4">
          {countryData.map((item) => {
            const barHeight = (item.delayHours / maxDelayHours) * 142; // Reduced max height
            const isHovered = hoveredBar === item.code;

            // Full 6-hour gradient: green (0hrs) at bottom → orange (6hrs) at top
            // Each bar shows only the portion corresponding to its actual delay hours
            const maxHeight = 142; // Full 6-hour scale height in pixels

            return (
              <div
                key={item.code}
                className="flex flex-col items-center gap-2 relative"
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-lg z-10">
                    <div className="text-xs font-medium text-slate-900">
                      {item.delayHours} hours
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                  </div>
                )}

                {/* Bar with gradient */}
                <div className="relative">
                  <div
                    className="w-6 rounded-t-sm transition-all duration-200 hover:opacity-80"
                    style={{
                      height: `${barHeight}px`,
                      background:
                        "linear-gradient(180deg, #F97316 0%, #22C55E 100%)",
                      backgroundSize: `100% ${maxHeight}px`,
                      backgroundPosition: "bottom",
                    }}
                    onMouseEnter={() => setHoveredBar(item.code)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                </div>

                {/* Country flag */}
                <ReactCountryFlag
                  svg
                  countryCode={item.code}
                  style={{ width: 20, height: 14 }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AverageDelayRateChart;
