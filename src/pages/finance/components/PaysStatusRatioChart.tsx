import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function PaysStatusRatioChart() {
  const statusData = [
    { label: "Paid", value: 55, color: "#10b981" },
    { label: "Pending", value: 25, color: "#f59e0b" },
    { label: "Overdue", value: 20, color: "#f97316" },
  ];

  return (
    <div className="bg-white rounded-2xl w-1/4 p-6 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">
        Pays Status Ratio
      </h3>

      <div className="flex flex-col  items-center gap-6">
        {/* Donut Chart */}
        <div className="relative w-64 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={450}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">$65,425</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex  gap-3">
          {statusData.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
