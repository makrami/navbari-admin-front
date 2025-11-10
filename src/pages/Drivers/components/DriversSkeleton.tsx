// Skeleton component for individual driver cards matching EntityCard structure
function DriverCardSkeleton() {
  return (
    <div className="relative overflow-hidden p-2 rounded-2xl bg-white animate-pulse">
      {/* Status bar */}
      <div className="h-1.5 rounded-full bg-slate-200"></div>

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
            <div className="h-4 bg-slate-200 rounded w-24"></div>
          </div>
          <div className="rounded-full px-2 py-0.5 bg-slate-200">
            <div className="h-3 bg-slate-300 rounded w-12"></div>
          </div>
        </div>

        {/* Location & Manager */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-6 bg-slate-200 rounded"></div>
            <div className="h-3 bg-slate-200 rounded w-20"></div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="h-3 bg-slate-200 rounded w-16"></div>
          <div className="h-3 bg-slate-200 rounded w-20"></div>
        </div>

        <div className="h-[1px] bg-slate-100"></div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-slate-200 rounded"></div>
            <div className="h-3 bg-slate-200 rounded w-12"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-slate-200 rounded"></div>
            <div className="h-3 bg-slate-200 rounded w-12"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-slate-200 rounded"></div>
            <div className="h-3 bg-slate-200 rounded w-12"></div>
          </div>
        </div>

        {/* Footer button */}
        <div className="mt-auto pt-2">
          <div className="h-7 w-full bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton for status filter chips matching StatusFilterChips structure
function StatusFilterSkeleton({
  isListPanel = false,
}: {
  isListPanel?: boolean;
}) {
  return (
    <div
      className={
        isListPanel ? "relative pl-8 pr-8 w-full max-w-[376px] h-9" : ""
      }
    >
      {isListPanel && (
        <>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 size-7 bg-slate-200 rounded-full animate-pulse"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 size-7 bg-slate-200 rounded-full animate-pulse"></div>
        </>
      )}
      <div
        className={`flex flex-nowrap items-center gap-2 ${
          isListPanel ? "h-full py-0" : "py-1"
        } w-full max-w-[376px]`}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-full px-4 h-8 bg-slate-200 min-w-[120px] animate-pulse"
          >
            <div className="h-4 bg-slate-300 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for driver details panel matching DriverDetails structure
function DriverDetailsSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="size-16 bg-slate-200 rounded-full"></div>
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

// Skeleton for AddDriver button
function AddDriverSkeleton() {
  return (
    <div className="w-full bg-slate-200 rounded-2xl p-3 h-12 animate-pulse flex items-center justify-center">
      <div className="h-4 bg-slate-300 rounded w-24"></div>
    </div>
  );
}

// Main skeleton components
export function DriversListPanelSkeleton() {
  return (
    <section className="w-64 min-w-64 bg-slate-200 p-9 flex flex-col h-screen overflow-hidden space-y-4">
      <header className="shrink-0">
        <div className="h-6 bg-slate-300 rounded w-20 animate-pulse"></div>
      </header>
      <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto no-scrollbar">
        <StatusFilterSkeleton isListPanel={true} />
        <AddDriverSkeleton />
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <DriverCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function DriversDetailsPanelSkeleton() {
  return (
    <div className="flex-1 h-screen max-w-4xl mx-auto overflow-hidden">
      <div className="h-full overflow-y-auto no-scrollbar">
        <div className="p-9 flex flex-col gap-4">
          <div className="flex w-full items-center justify-between rounded-xl">
            <div className="h-9 w-9 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-8 min-w-[132px] bg-slate-200 rounded-full animate-pulse"></div>
          </div>
          <DriverDetailsSkeleton />
          <RecentActivitiesSkeleton />
          <DocumentsListSkeleton />
          <InternalNotesSkeleton />
        </div>
      </div>
    </div>
  );
}

// Main skeleton component that matches DriversPage structure
// Shows grid view skeleton by default (matching when selectedId is null)
export function DriversPageSkeleton() {
  return <DriversGridSkeleton />;
}

// Grid view skeleton matching the default view structure
export function DriversGridSkeleton() {
  return (
    <div className="py-6 space-y-6 min-h-screen max-w-7xl mx-auto flex flex-col items-start transition-all">
      <div className="w-full max-w-7xl px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="h-8 bg-slate-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl px-6">
        <StatusFilterSkeleton isListPanel={false} />
      </div>

      <div className="w-full max-w-7xl px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="w-full">
            <DriverCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
