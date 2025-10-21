// Skeleton component for individual company cards
function CompanyCardSkeleton() {
  return (
    <div className="text-left rounded-2xl p-4 shadow-sm bg-white animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="size-12 bg-slate-200 rounded-lg"></div>
          <div className="flex flex-col gap-1">
            <div className="h-4 bg-slate-200 rounded w-24"></div>
            <div className="h-3 bg-slate-200 rounded w-16"></div>
          </div>
        </div>
        <div className="rounded-md px-2.5 py-1 bg-slate-200">
          <div className="h-3 bg-slate-200 rounded w-12"></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <div className="h-3 bg-slate-200 rounded w-8"></div>
          <div className="h-4 bg-slate-200 rounded w-12"></div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="h-3 bg-slate-200 rounded w-8"></div>
          <div className="h-4 bg-slate-200 rounded w-12"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="h-3 bg-slate-200 rounded w-16"></div>
        <div className="h-3 bg-slate-200 rounded w-12"></div>
      </div>
    </div>
  );
}

// Skeleton for status filter chips
function StatusFilterSkeleton() {
  return (
    <div className="flex gap-2 animate-pulse">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="rounded-full px-3 py-1.5 bg-slate-200">
          <div className="h-4 bg-slate-300 rounded w-16"></div>
        </div>
      ))}
    </div>
  );
}

// Skeleton for company details panel
function CompanyDetailsSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="size-16 bg-slate-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-6 bg-slate-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
        </div>
        <div className="rounded-md px-3 py-1 bg-slate-200">
          <div className="h-4 bg-slate-300 rounded w-16"></div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="h-3 bg-slate-200 rounded w-20"></div>
            <div className="h-4 bg-slate-200 rounded w-28"></div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="h-4 bg-slate-200 rounded w-16 mb-2"></div>
          <div className="h-6 bg-slate-200 rounded w-8"></div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="h-4 bg-slate-200 rounded w-16 mb-2"></div>
          <div className="h-6 bg-slate-200 rounded w-8"></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton for documents list
function DocumentsListSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 animate-pulse">
      <div className="h-5 bg-slate-200 rounded w-24 mb-4"></div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="size-8 bg-slate-200 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-32 mb-1"></div>
              <div className="h-3 bg-slate-200 rounded w-16"></div>
            </div>
            <div className="h-3 bg-slate-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for internal notes
function InternalNotesSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 animate-pulse">
      <div className="h-5 bg-slate-200 rounded w-24 mb-4"></div>
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex gap-3">
            <div className="size-8 bg-slate-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for recent activities
function RecentActivitiesSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 animate-pulse">
      <div className="h-5 bg-slate-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex gap-3">
            <div className="size-8 bg-slate-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-40 mb-1"></div>
              <div className="h-3 bg-slate-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main skeleton components
export function LocalCompaniesListPanelSkeleton() {
  return (
    <section className="w-1/4 min-w-xs bg-slate-200 p-9 flex flex-col h-screen overflow-hidden space-y-4">
      <header className="shrink-0">
        <div className="h-6 bg-slate-200 rounded w-32 animate-pulse"></div>
      </header>
      <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto no-scrollbar">
        <StatusFilterSkeleton />
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-200 p-4 animate-pulse">
          <div className="h-4 bg-slate-300 rounded w-24"></div>
          <div className="h-5 w-5 bg-slate-300 rounded"></div>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <CompanyCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function LocalCompaniesDetailsPanelSkeleton() {
  return (
    <div className="flex-1 h-screen max-w-5xl mx-auto overflow-hidden">
      <div className="h-full overflow-y-auto no-scrollbar">
        <div className="p-9 flex flex-col gap-4">
          <div className="flex w-full items-center justify-between rounded-xl mb-4">
            <div className="h-9 w-9 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-8 w-24 bg-slate-200 rounded-full animate-pulse"></div>
          </div>
          <CompanyDetailsSkeleton />
          <DocumentsListSkeleton />
          <InternalNotesSkeleton />
          <RecentActivitiesSkeleton />
        </div>
      </div>
    </div>
  );
}

// Main skeleton for split view
export function LocalCompaniesPageSkeleton() {
  return (
    <div className="flex w-full overflow-hidden">
      <LocalCompaniesListPanelSkeleton />
      <LocalCompaniesDetailsPanelSkeleton />
    </div>
  );
}

// Grid view skeleton
export function LocalCompaniesGridSkeleton() {
  return (
    <div className="py-6 space-y-6 h-screen max-w-7xl mx-auto transition-all">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="h-8 bg-slate-200 rounded w-40 animate-pulse"></div>
        </div>
      </div>

      <StatusFilterSkeleton />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <CompanyCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
