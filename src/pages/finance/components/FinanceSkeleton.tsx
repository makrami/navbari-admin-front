// Skeleton component for summary cards
function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-4 border border-slate-200"
        >
          <div className="flex flex-col gap-2">
            <div className="h-3 bg-slate-200 rounded w-20"></div>
            <div className="h-5 bg-slate-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton for filter search section
function FilterSearchSectionSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse">
      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
          >
            <div className="size-4 bg-slate-200 rounded"></div>
            <div className="h-3 bg-slate-200 rounded w-12"></div>
            <div className="h-3 bg-slate-200 rounded w-16 ml-auto"></div>
            <div className="size-4 bg-slate-200 rounded ml-auto"></div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50">
        <div className="size-4 bg-slate-200 rounded"></div>
        <div className="h-4 bg-slate-200 rounded w-48"></div>
      </div>
    </div>
  );
}

// Skeleton for pays by country chart
function PaysByCountryChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-32 mb-6"></div>

      {/* Chart Container */}
      <div className="space-y-4">
        <div className="relative h-32 w-full">
          {/* Y-axis labels */}
          <div className="absolute top-0 left-8 h-3 bg-slate-200 rounded w-8"></div>
          <div className="absolute top-12 left-8 h-3 bg-slate-200 rounded w-8"></div>
          <div className="absolute top-24 left-8 h-3 bg-slate-200 rounded w-8"></div>
          <div className="absolute top-36 left-8 h-3 bg-slate-200 rounded w-8"></div>
          <div className="absolute top-48 left-8 h-3 bg-slate-200 rounded w-8"></div>
          <div className="absolute top-60 left-8 h-3 bg-slate-200 rounded w-8"></div>

          {/* Grid lines */}
          <div className="absolute top-2 left-16 right-0 h-px bg-slate-100"></div>
          <div className="absolute top-14 left-16 right-0 h-px bg-slate-100"></div>
          <div className="absolute top-26 left-16 right-0 h-px bg-slate-100"></div>
          <div className="absolute top-38 left-16 right-0 h-px bg-slate-100"></div>
          <div className="absolute top-50 left-16 right-0 h-px bg-slate-100"></div>
          <div className="absolute top-62 left-16 right-0 h-px bg-slate-100"></div>

          {/* Bars */}
          <div className="flex items-end justify-between h-42 pt-16 pl-20 pr-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div
                  className="bg-slate-200 w-8 rounded-t-sm"
                  style={{ height: `${Math.random() * 200 + 40}px` }}
                ></div>
                <div className="size-6 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton for pays status ratio chart
function PaysStatusRatioChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl w-1/4 p-6 border border-slate-200 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-32 mb-6"></div>

      <div className="flex flex-col items-center gap-6">
        {/* Donut Chart */}
        <div className="relative w-64 h-64">
          <div className="w-full h-full bg-slate-200 rounded-full"></div>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="h-8 bg-slate-200 rounded w-20"></div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
              <div className="h-4 bg-slate-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton for activity section
function ActivitySectionSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-4 animate-pulse">
      {/* Header */}
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1.3fr_0.7fr_0.8fr] items-center px-3 py-2 gap-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="h-3 bg-slate-200 rounded w-16"></div>
        ))}
      </div>

      {/* Rows */}
      <ul className="space-y-3 divide-slate-100">
        {Array.from({ length: 5 }).map((_, index) => (
          <li
            key={index}
            className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_0.2fr_1.3fr] bg-slate-50 items-center gap-3 rounded-lg px-3 py-3"
          >
            {/* ID */}
            <div className="h-4 bg-slate-200 rounded w-20"></div>
            {/* Date */}
            <div className="h-4 bg-slate-200 rounded w-16"></div>
            {/* Segment */}
            <div className="h-4 bg-slate-200 rounded w-24"></div>
            {/* Local Company */}
            <div className="flex items-center gap-2">
              <div className="size-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-16"></div>
            </div>
            {/* Driver */}
            <div className="flex items-center gap-2">
              <div className="size-6 bg-slate-200 rounded-full"></div>
              <div className="h-4 bg-slate-200 rounded w-16"></div>
            </div>
            {/* Amount */}
            <div className="h-4 bg-slate-200 rounded w-20"></div>
            {/* Status */}
            <div className="h-4 bg-slate-200 rounded w-16"></div>
            {/* Reason */}
            <div className="h-6 bg-slate-200 rounded w-6"></div>
            {/* Actions */}
            <div className="flex items-center justify-center gap-2">
              <div className="size-6 bg-slate-200 rounded"></div>
              <div className="size-6 bg-slate-200 rounded"></div>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <div className="size-6 bg-slate-200 rounded"></div>
        <div className="flex items-center gap-2">
          <div className="size-6 bg-slate-200 rounded-full"></div>
          <div className="h-4 bg-slate-200 rounded w-4"></div>
          <div className="h-4 bg-slate-200 rounded w-4"></div>
          <div className="h-4 bg-slate-200 rounded w-4"></div>
          <div className="h-4 bg-slate-200 rounded w-4"></div>
        </div>
        <div className="size-6 bg-slate-200 rounded"></div>
      </div>
    </div>
  );
}

// Main skeleton for finance page
export function FinancePageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-200">
      <div className="py-6 space-y-4 max-w-7xl mx-auto px-4 transition-all">
        {/* Header Section */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="h-8 bg-slate-200 rounded w-20 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 bg-slate-200 rounded-lg w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Filter and Search Section */}
        <FilterSearchSectionSkeleton />

        {/* Charts Section */}
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-4">
            <SummaryCardsSkeleton />
            <PaysByCountryChartSkeleton />
          </div>
          <PaysStatusRatioChartSkeleton />
        </div>

        {/* Activity Section */}
        <ActivitySectionSkeleton />
      </div>
    </div>
  );
}
