// Skeleton component for individual chat alert items
function ChatAlertItemSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-white animate-pulse">
      {/* Avatar */}
      <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0"></div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name and badges */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="h-5 w-12 bg-slate-200 rounded-lg"></div>
            <div className="h-5 w-12 bg-slate-200 rounded-lg"></div>
          </div>
        </div>

        {/* Message preview and timestamp */}
        <div className="flex items-center justify-between gap-2">
          <div className="h-3 bg-slate-200 rounded flex-1"></div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="h-3 bg-slate-200 rounded w-10"></div>
            <div className="w-4 h-4 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton for search bar
function SearchBarSkeleton() {
  return (
    <div className="flex gap-2 animate-pulse">
      <div className="relative flex-1">
        <div className="w-full rounded-lg bg-slate-200 h-10"></div>
      </div>
      <div className="flex-shrink-0 w-10 h-10 bg-slate-200 rounded-lg"></div>
    </div>
  );
}

// Skeleton for filter tabs
function FilterTabsSkeleton() {
  return (
    <div className="flex items-center gap-2 px-1 py-2 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-full w-16"></div>
      <div className="h-8 bg-slate-200 rounded-full w-24"></div>
      <div className="h-8 bg-slate-200 rounded-full w-28"></div>
    </div>
  );
}

// Skeleton for Driver/Company Details
function DriverCompanyDetailsSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Avatar/Logo + Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-24 w-24 rounded-full bg-slate-200 flex-shrink-0"></div>
          <div className="min-w-0 flex-1">
            <div className="h-6 bg-slate-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-40"></div>
          </div>
        </div>
        {/* Right: Status & Stats */}
        <div className="flex flex-col gap-2 items-center justify-center min-w-[8.75rem]">
          <div className="h-8 bg-slate-200 rounded-lg w-full"></div>
          <div className="h-8 bg-slate-200 rounded-lg w-full"></div>
          <div className="h-8 bg-slate-200 rounded-lg w-full"></div>
        </div>
      </div>
      <div className="border-t border-slate-100"></div>
      {/* Bottom info */}
      <div className="flex items-center gap-4">
        <div className="h-4 bg-slate-200 rounded w-24"></div>
        <div className="h-4 bg-slate-200 rounded w-24"></div>
        <div className="h-4 bg-slate-200 rounded w-24"></div>
      </div>
    </div>
  );
}

// Skeleton for Driver and Shipment Info
function DriverAndShipmentInfoSkeleton() {
  return (
    <div className="flex gap-4 animate-pulse">
      {/* Left Column: Driver Info and Shipment Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Driver Information */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <div className="size-8 bg-slate-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="h-4 bg-slate-200 rounded w-32"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-xl justify-between">
            <div className="flex items-center gap-6">
              <div className="w-3 h-3 bg-slate-200 rounded"></div>
              <div className="h-3 bg-slate-200 rounded w-40"></div>
            </div>
            <div className="h-3 bg-slate-200 rounded w-12"></div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100"></div>

        {/* Shipment Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 p-3 rounded-xl border border-slate-200"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-200 rounded"></div>
                <div className="h-3 bg-slate-200 rounded w-20"></div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-28"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Map */}
      <div className="flex-1 min-w-0">
        <div className="rounded-xl border border-slate-200 overflow-hidden w-full h-[240px] bg-slate-200"></div>
      </div>
    </div>
  );
}

// Skeleton for Shipment Header
function ShipmentHeaderSkeleton() {
  return (
    <div className="flex items-start justify-between animate-pulse">
      <div className="flex flex-col gap-1">
        <div className="h-4 bg-slate-200 rounded w-48"></div>
        <div className="h-3 bg-slate-200 rounded w-24"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-slate-200 rounded-lg"></div>
        <div className="w-9 h-9 bg-slate-200 rounded-lg"></div>
        <div className="w-9 h-9 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  );
}

// Skeleton for chat alert details
function ChatAlertDetailsSkeleton() {
  return (
    <div className="flex rounded-xl flex-col gap-6 animate-pulse">
      {/* Header Section */}
      <div className="bg-white rounded-xl p-4 space-y-4">
        {/* Shipment Header */}
        <ShipmentHeaderSkeleton />

        {/* Driver/Company Details */}
        <DriverCompanyDetailsSkeleton />

        {/* Driver and Shipment Info (only for drivers) */}
        <DriverAndShipmentInfoSkeleton />

        {/* Financial Cards */}
        <div className="flex gap-4">
          <div className="flex flex-col justify-center gap-2 flex-1/3 rounded-xl p-4 border border-slate-200">
            <div className="flex items-start gap-2">
              <div className="size-5 bg-slate-200 rounded flex-shrink-0"></div>
              <div className="h-3 bg-slate-200 rounded w-16"></div>
            </div>
            <div className="h-4 bg-slate-200 rounded w-32"></div>
          </div>
          <div className="flex gap-4 flex-2/3 bg-white rounded-xl p-4 border border-slate-200">
            <div className="bg-white flex-1 rounded-xl">
              <div className="h-3 bg-slate-200 rounded w-16 mb-2"></div>
              <div className="h-5 bg-slate-200 rounded w-32"></div>
            </div>
            <div className="bg-white flex-1 rounded-xl">
              <div className="h-3 bg-slate-200 rounded w-20 mb-2"></div>
              <div className="h-5 bg-slate-200 rounded w-24"></div>
            </div>
          </div>
        </div>

        {/* Segment Section */}
        <div className="bg-white rounded-xl relative">
          <div className="h-4 bg-slate-200 rounded w-20 mb-4"></div>
          <div className="relative">
            <div className="flex flex-col p-4 rounded-xl border-2 gap-4 border-slate-200">
              <div className="absolute top-0 left-0 w-2 h-2 bg-slate-200 rounded-full"></div>

              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-1">
                  <div className="bg-slate-200 p-1 text-xs w-8 h-6"></div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="h-3 bg-slate-200 rounded w-16"></div>
                    <div className="h-3 bg-slate-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                  <div className="size-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                  <div className="size-4 bg-slate-200 rounded ml-4"></div>
                  <div className="h-3 bg-slate-200 rounded w-12"></div>
                </div>
                <div className="size-4 bg-slate-200 rounded"></div>
              </div>

              <div className="w-full h-px bg-slate-100"></div>

              {/* Workflow States */}
              <div className="flex items-center gap-2 flex-wrap w-full">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="contents">
                    <div className="p-3 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="size-5 bg-slate-200 rounded"></div>
                    </div>
                    {index < 6 && (
                      <div className="size-4 bg-slate-200 rounded flex-shrink-0"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-[600px] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
          {/* Date Group Label */}
          <div className="flex items-center gap-2">
            <div className="h-px bg-slate-200 flex-1"></div>
            <div className="h-3 bg-slate-200 rounded w-16"></div>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* Message Bubbles */}
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={`flex ${
                  index % 2 === 0 ? "justify-start" : "justify-end"
                }`}
              >
                <div className="max-w-[85%] rounded-xl px-4 py-3 bg-slate-200">
                  <div className="h-4 bg-slate-300 rounded w-full mb-1"></div>
                  <div className="h-3 bg-slate-300 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Another Date Group */}
          <div className="flex items-center gap-2 mt-6">
            <div className="h-px bg-slate-200 flex-1"></div>
            <div className="h-3 bg-slate-200 rounded w-20"></div>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* Alert Cards */}
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex justify-start">
                <div className="max-w-[85%] rounded-xl px-4 py-3 bg-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="size-5 bg-slate-300 rounded flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-300 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-slate-300 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Chips and Input */}
        <div className="border-t border-slate-100 bg-white">
          {/* Actionable Chips */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-8 bg-slate-200 rounded-full w-24"
                ></div>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-10 bg-slate-200 rounded-lg"></div>
              <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main skeleton components
export function ChatAlertListPanelSkeleton() {
  return (
    <section className="w-1/4 min-w-sm bg-slate-200 p-9 flex flex-col h-screen overflow-hidden space-y-4">
      <header className="shrink-0">
        <div className="h-6 bg-slate-300 rounded w-32 animate-pulse"></div>
      </header>
      <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto no-scrollbar">
        <SearchBarSkeleton />
        <FilterTabsSkeleton />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <ChatAlertItemSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ChatAlertDetailsPanelSkeleton() {
  return (
    <div className="flex-1 h-screen max-w-4xl mx-auto overflow-hidden">
      <div className="h-full overflow-y-auto no-scrollbar">
        <div className="p-9 flex flex-col gap-4">
          <ChatAlertDetailsSkeleton />
        </div>
      </div>
    </div>
  );
}

// Empty Details Panel Skeleton
export function EmptyDetailsPanelSkeleton() {
  return (
    <div className="flex-1 h-screen max-w-4xl mx-auto overflow-hidden">
      <div className="h-full overflow-y-auto no-scrollbar">
        <div className="p-9 flex flex-col gap-4">
          <div className="flex items-center justify-center h-full text-center">
            <div className="animate-pulse">
              <div className="size-16 bg-slate-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main skeleton for split view (with selected chat)
export function ChatAlertPageSkeleton() {
  return (
    <div className="flex w-full overflow-hidden">
      <ChatAlertListPanelSkeleton />
      <ChatAlertDetailsPanelSkeleton />
    </div>
  );
}

// Grid view skeleton - when no chat is selected
export function ChatAlertGridSkeleton() {
  return (
    <div className="flex w-full overflow-hidden">
      <ChatAlertListPanelSkeleton />
      <EmptyDetailsPanelSkeleton />
    </div>
  );
}
