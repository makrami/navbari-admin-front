export function OnTimeDeliveryCard() {
  // Generate smooth curve data points (x, y) - y axis represents hours (0-6hrs range)
  const points: [number, number][] = [
    [0, 60],
    [10, 59],
    [20, 58],
    [30, 57],
    [40, 56],
    [50, 46],
    [60, 34],
    [70, 26],
    [80, 27],
    [90, 36],
    [100, 28],
    [110, 17],
    [120, 34],
    [130, 16],
    [140, 41],
    [150, 14],
    [160, 32],
    [170, 27],
    [180, 45],
    [190, 35],
    [200, 18],
    [210, 25],
    [220, 33],
    [230, 52],
    [240, 37],
    [250, 35],
    [260, 25],
    [270, 17],
    [280, 13],
    [290, 7],
    [300, 2],
    [310, 21],
  ];

  const path = points
    .map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`))
    .join(" ");

  return (
    <div className="bg-white flex-1 flex flex-col rounded-2xl p-5  border border-slate-200">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">
        On-Time Delivery in last 30 Days
      </h3>
      <div className="relative group">
        {/* y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-[11px] text-slate-400">
          {["0hrs", "2hrs", "3hrs", "4hrs", "5hrs", "6hrs"]
            .reverse()
            .map((t, i) => (
              <div key={i} className="leading-none">
                {t}
              </div>
            ))}
        </div>

        {/* Chart area */}
        <div className="ml-8 relative h-40 cursor-crosshair">
          {/* Horizontal grid lines */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-px bg-slate-100"
              style={{ top: `${i * 20}%` }}
            />
          ))}

          {/* SVG Chart */}
          <svg
            viewBox="0 0 300 60"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Gradient for the line - based on y-axis values (hours)
                  0-20 hours = green, 20-40 hours = yellow, 40-60 hours = red */}
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" />{" "}
                {/* Red at top (60hrs) */}
                <stop offset="33.33%" stopColor="#eab308" />{" "}
                {/* Yellow at 40hrs */}
                <stop offset="66.66%" stopColor="#eab308" />{" "}
                {/* Yellow at 20hrs */}
                <stop offset="100%" stopColor="#22c55e" />{" "}
                {/* Green at bottom (0hrs) */}
              </linearGradient>
              {/* Gradient for the fill area with matching zones */}
              <linearGradient id="fillGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#fee2e2" stopOpacity="0.4" />{" "}
                {/* Light red */}
                <stop
                  offset="33.33%"
                  stopColor="#fef3c7"
                  stopOpacity="0.3"
                />{" "}
                {/* Light yellow */}
                <stop
                  offset="66.66%"
                  stopColor="#fef3c7"
                  stopOpacity="0.2"
                />{" "}
                {/* Light yellow */}
                <stop
                  offset="100%"
                  stopColor="#dcfce7"
                  stopOpacity="0.1"
                />{" "}
                {/* Light green */}
              </linearGradient>
            </defs>

            {/* Fill area under the curve */}
            <path d={`${path} L 300 60 L 0 60 Z`} fill="url(#fillGradient)" />

            {/* Line curve */}
            <path
              d={path}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Floating tooltip */}

        {/* x-axis labels */}
        <div className="mt-2 ml-8 flex justify-between text-[11px] text-slate-400">
          <span>06 Aug</span>
          <span>16 Sept</span>
          <span>26 Sept</span>
          <span>06 Sept</span>
        </div>
      </div>
    </div>
  );
}

export default OnTimeDeliveryCard;
