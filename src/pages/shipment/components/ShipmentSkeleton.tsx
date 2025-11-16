// Skeleton component for individual shipment items
function ShipmentItemSkeleton() {
  return (
    <div className="text-left rounded-2xl p-4 shadow-sm bg-white animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs leading-none flex flex-col gap-2">
          <div className="h-4 bg-slate-200 rounded w-32"></div>
          <div className="h-3 bg-slate-200 rounded w-20"></div>
        </div>
        <div className="rounded-md px-2.5 py-2 bg-slate-200">
          <div className="h-4 bg-slate-200 rounded w-16"></div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 flex w-full items-center gap-2">
        <div className="w-6 h-4 bg-slate-200 rounded"></div>
        <div className="h-[9px] flex-1 rounded-full bg-slate-200"></div>
        <div className="h-3.5 w-3.5 bg-slate-200 rounded"></div>
        <div className="w-6 h-4 bg-slate-200 rounded"></div>
      </div>

      {/* Divider */}
      <div className="mt-4 h-px bg-slate-200" />

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 bg-slate-200 rounded"></div>
          <div className="size-4 bg-slate-200 rounded-full"></div>
          <div className="h-3 bg-slate-200 rounded w-16"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 bg-slate-200 rounded w-8"></div>
          <div className="h-3.5 w-3.5 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton for search and add shipment components
function SearchShipmentSkeleton() {
  return (
    <div className="flex w-full items-start gap-2 animate-pulse">
      <div className="flex h-11 flex-1 items-center gap-2 rounded-lg bg-slate-200 px-2.5">
        <div className="h-5 w-5 bg-slate-300 rounded"></div>
        <div className="h-4 bg-slate-300 rounded w-20"></div>
      </div>
      <div className="flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-200 p-3">
        <div className="h-5 w-5 bg-slate-300 rounded"></div>
      </div>
    </div>
  );
}

function AddShipmentSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-200 p-4 animate-pulse">
      <div className="h-4 bg-slate-300 rounded w-24"></div>
      <div className="h-5 w-5 bg-slate-300 rounded"></div>
    </div>
  );
}

// Skeleton for navigating info
function NavigatingInfoSkeleton() {
  return (
    <section className="flex flex-col gap-4 p-4 bg-white rounded-[16px] animate-pulse">
      {/* Shipment Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col gap-1 min-w-px">
          <div className="h-3 bg-slate-200 rounded w-32"></div>
          <div className="h-3 bg-slate-200 rounded w-20"></div>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-slate-200 border border-slate-200 rounded-[8px] p-2 size-auto"
            >
              <div className="size-5 bg-slate-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-1/2 flex flex-col gap-4">
          {/* Driver Header */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4 min-w-0">
              <div className="size-7 bg-slate-200 rounded-full"></div>
              <div className="h-4 bg-slate-200 rounded w-20"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="h-4 bg-slate-200 rounded w-8"></div>
                <div className="size-4 bg-slate-200 rounded"></div>
              </div>
              <div className="bg-slate-200 rounded-[8px] p-2">
                <div className="size-4 bg-slate-300 rounded"></div>
              </div>
            </div>
          </div>

          {/* Activity chip */}
          <div className="bg-slate-200 rounded-[8px] px-3 py-[6px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-[14px] bg-slate-300 rounded"></div>
              <div className="h-3 bg-slate-300 rounded w-24"></div>
            </div>
            <div className="h-3 bg-slate-300 rounded w-12"></div>
          </div>

          <div className="border-t border-slate-200" />

          {/* Content */}
          <div className="grid gap-4 md:grid-cols-[1fr,320px] items-start">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="size-[14px] bg-slate-200 rounded"></div>
                    <div className="h-2 bg-slate-200 rounded w-16"></div>
                  </div>
                  <div className="h-3 bg-slate-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative h-auto max-h-[240px] w-1/2">
          <div className="size-full bg-slate-200 rounded-2xl"></div>
          <div className="absolute top-4 right-4 flex flex-col gap-2 w-[30px]">
            <div className="flex flex-col overflow-hidden rounded-[8px] shadow-sm">
              <div className="bg-slate-200 p-2">
                <div className="size-[14px] bg-slate-300 rounded"></div>
              </div>
              <div className="bg-slate-200 border-t border-slate-300 p-2">
                <div className="size-[14px] bg-slate-300 rounded"></div>
              </div>
            </div>
            <div className="bg-slate-200 rounded-[8px] p-2">
              <div className="size-[14px] bg-slate-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Skeleton for segment details
export function SegmentDetailsSkeleton() {
  return (
    <div className="relative bg-white border border-slate-200 rounded-[12px] shadow-sm animate-pulse">
      <div className="w-full px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-4 bg-slate-200 rounded"></div>
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-3 bg-slate-200 rounded w-8"></div>
            <div className="h-4 bg-slate-200 rounded w-24"></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="size-4 bg-slate-200 rounded-full"></div>
          <div className="h-4 bg-slate-200 rounded w-16"></div>
          <div className="size-5 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton for activity section
function ActivitySectionSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-pulse">
      <div className="h-5 bg-slate-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="size-8 bg-slate-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-32 mb-1"></div>
              <div className="h-3 bg-slate-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main shipment page skeleton components
export function ShipmentListPanelSkeleton() {
  return (
    <section className="w-1/4 min-w-xs bg-slate-200 p-9 flex flex-col h-screen overflow-hidden space-y-4">
      <header className="shrink-0">
        <div className="h-6 bg-slate-200 rounded w-20 animate-pulse"></div>
      </header>
      <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto no-scrollbar">
        <SearchShipmentSkeleton />
        <AddShipmentSkeleton />
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <ShipmentItemSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ShipmentDetailsPanelSkeleton() {
  return (
    <div className="flex-1 h-screen bg-slate-100 max-w-5xl mx-auto overflow-hidden">
      <div className="h-full overflow-y-auto no-scrollbar">
        <div className="p-9 flex flex-col gap-4">
          <NavigatingInfoSkeleton />
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 rounded w-20 animate-pulse"></div>
            {Array.from({ length: 3 }).map((_, index) => (
              <SegmentDetailsSkeleton key={index} />
            ))}
          </div>
          <ActivitySectionSkeleton />
        </div>
      </div>
    </div>
  );
}

// Main shipment page skeleton
export function ShipmentPageSkeleton() {
  return (
    <div className="flex w-full h-screen overflow-hidden">
      <ShipmentListPanelSkeleton />
      <ShipmentDetailsPanelSkeleton />
    </div>
  );
}
