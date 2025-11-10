import {
  Truck,
  Stamp,
  MapPinned,
  Flag,
  ChevronsRight,
  CarFrontIcon,
  MapPinCheckIcon,
  Loader,
} from "lucide-react";

export type CargoWorkflowProps = {
  currentStateIndex: number;
  currentDistance: string;
};

// Define the 7 states of the cargo movement workflow
const WORKFLOW_STATES = [
  {
    icon: Truck,
    label: null, // No label for completed/upcoming states
  },
  {
    icon: CarFrontIcon,
    label: null,
  },
  {
    icon: MapPinCheckIcon,
    label: null,
  },
  {
    icon: Loader,
    label: null,
  },
  {
    icon: Stamp,
    label: null,
  },
  {
    icon: MapPinned,
    label: "To Dest.", // Only current state shows label
  },
  {
    icon: Flag,
    label: null,
  },
] as const;

export function CargoWorkflow({
  currentStateIndex,
  currentDistance,
}: CargoWorkflowProps) {
  const getStateColor = (index: number) => {
    if (index < currentStateIndex) {
      // Completed state - green
      return {
        bg: "bg-green-50",
        icon: "text-green-600",
        chevron: "text-green-600",
      };
    } else if (index === currentStateIndex) {
      // Current state - yellow/golden
      return {
        bg: "bg-yellow-50",
        icon: "text-yellow-600",
        chevron: "text-yellow-600",
      };
    } else {
      // Upcoming state - slate-200 style
      return {
        bg: "bg-slate-100",
        icon: "text-slate-400",
        chevron: "text-slate-400",
      };
    }
  };

  const getChevronColor = (index: number) => {
    // Chevron color matches the state it points to (next state)
    const nextIndex = index + 1;
    if (nextIndex < currentStateIndex) {
      return "text-green-600";
    } else if (nextIndex === currentStateIndex) {
      return "text-yellow-600";
    } else {
      return "text-slate-400";
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap w-full">
      {WORKFLOW_STATES.map((state, index) => {
        const colors = getStateColor(index);
        const IconComponent = state.icon;
        const isCurrent = index === currentStateIndex;

        return (
          <div key={index} className="contents">
            {/* State item */}
            {isCurrent ? (
              // Current state - shows details
              <div
                className={`px-3 py-2 ${colors.bg} rounded-lg flex flex-1 justify-center flex-col items-center`}
              >
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-bold ${colors.icon}`}>
                    {state.label}
                  </p>
                  <IconComponent className={`size-4 ${colors.icon} stroke-2`} />
                </div>
                <p className={`text-xs ${colors.icon}`}>{currentDistance}</p>
              </div>
            ) : (
              // Completed or upcoming state - icon only
              <div
                className={`p-3 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <IconComponent className={`size-5 ${colors.icon} stroke-2`} />
              </div>
            )}

            {/* Chevron separator - positioned between states, centered */}
            {index < WORKFLOW_STATES.length - 1 && (
              <ChevronsRight
                className={`size-4 ${getChevronColor(index)} flex-shrink-0`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
