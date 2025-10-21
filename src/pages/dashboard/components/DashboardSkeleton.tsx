// Skeleton component for individual cards
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-pulse">
      <div className="flex items-center gap-4">
        {/* Icon skeleton */}
        <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>

        <div className="flex-1">
          {/* Title skeleton */}
          <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
          {/* Sub info skeleton */}
          <div className="h-3 bg-slate-200 rounded w-32 mb-1"></div>
          <div className="h-3 bg-slate-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton for dashboard cards section
export function DashboardCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

// Skeleton for map section
export function MapSectionSkeleton() {
  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden bg-white shadow-lg animate-pulse">
      {/* Map background skeleton */}
      <div className="absolute top-5 left-5 right-5 bottom-5 bg-slate-200 rounded-2xl"></div>

      {/* Dropdown skeleton */}
      <div className="absolute top-8 left-8">
        <div className="w-24 h-10 bg-slate-200 rounded-xl"></div>
      </div>

      {/* Legend skeleton */}
      <div className="absolute bottom-8 left-8">
        <div className="bg-slate-200 rounded-xl p-3 w-32 h-24"></div>
      </div>

      {/* Zoom controls skeleton */}
      <div className="absolute top-8 right-8">
        <div className="bg-slate-200 rounded-xl w-10 h-20"></div>
      </div>

      {/* Refresh button skeleton */}
      <div className="absolute top-30 right-8">
        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
      </div>

      {/* Search input skeleton */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md px-6">
        <div className="w-full h-12 bg-slate-200 rounded-xl"></div>
      </div>

      {/* Fullscreen button skeleton */}
      <div className="absolute bottom-8 right-8">
        <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  );
}

// Skeleton for finance sections
export function FinanceDashboardSectionsSkeleton() {
  return (
    <div className="flex gap-4 w-full h-[500px] animate-pulse">
      {/* Financial overview card skeleton */}
      <div className="w-1/2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="h-4 bg-slate-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts section skeleton */}
      <div className="flex flex-col gap-4 w-1/2">
        {/* Chart skeleton */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="h-6 bg-slate-200 rounded w-28 mb-4"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
        </div>

        {/* On-time delivery card skeleton */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="h-6 bg-slate-200 rounded w-36 mb-4"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton for recent activities
export function RecentActivitiesSkeleton() {
  return (
    <section className="space-y-4 animate-pulse">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="h-5 bg-slate-200 rounded w-32 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-start gap-3 bg-slate-50 rounded-lg p-3"
            >
              <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Main dashboard skeleton component
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-200">
      <div className="py-6 space-y-4 max-w-7xl mx-auto px-4 transition-all">
        {/* Header skeleton */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-32"></div>
          </div>
        </div>

        {/* Dashboard Cards Skeleton */}
        <DashboardCardsSkeleton />

        {/* Map Section Skeleton */}
        <MapSectionSkeleton />

        {/* Finance Sections Skeleton */}
        <FinanceDashboardSectionsSkeleton />

        {/* Recent Activities Skeleton */}
        <RecentActivitiesSkeleton />
      </div>
    </div>
  );
}
