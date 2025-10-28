import { useState } from "react";
import CargoMap, { type Segment } from "../../components/CargoMap";

const segments = [
  {
    color: "#ff0000",
    path: [
      [2.3522, 48.8566],
      [4.8357, 45.764],
    ],
    meta: { vehicleId: "TRK-101", driverId: "DRV-1" },
  },
  {
    color: "#00aa55",
    path: [
      [4.8357, 45.764],
      [13.405, 52.52],
    ],
    meta: { vehicleId: "TRK-101", driverId: "DRV-1" },
  },
] satisfies Segment[];

export function MapDemoPage() {
  const [selected, setSelected] = useState<{
    idx: number;
    label: string;
  } | null>(null);
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-lg font-bold text-slate-900">Cargo Map Demo</h1>
      <CargoMap
        segments={segments}
        initialView={{ longitude: 7.5, latitude: 49.0, zoom: 4 }}
        onSegmentClick={(seg, idx) =>
          setSelected({
            idx,
            label: `${seg.meta?.vehicleId} / ${seg.meta?.driverId}`,
          })
        }
      />
      {selected && (
        <div className="mt-3 rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">
          <div className="font-semibold">
            Selected segment #{selected.idx + 1}
          </div>
          <div>{selected.label}</div>
        </div>
      )}
    </div>
  );
}

export default MapDemoPage;
