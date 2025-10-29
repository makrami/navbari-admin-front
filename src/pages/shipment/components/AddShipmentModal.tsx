import { useState } from "react";
import { XIcon, Search, ChevronDown } from "lucide-react";
import { CITY_OPTIONS } from "../data/cities";

export type AddShipmentInput = {
  id: string;
  title: string;
  destination: string;
  from?: string;
  to?: string;
  place: string; // initial segment place
  datetime: string; // initial segment datetime
  driverName: string; // initial segment + userName
  driverRating: number;
  driverPhoto?: string;
  cargoWeight?: number;
  segmentsAmount?: number;
};

type AddShipmentModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (data: AddShipmentInput) => void;
};

export default function AddShipmentModal({
  open,
  onClose,
  onCreate,
}: AddShipmentModalProps) {
  // Fields per reference design
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cargoCategory, setCargoCategory] = useState("");
  const [cargoWeight, setCargoWeight] = useState<string>("");
  const [segmentsAmount, setSegmentsAmount] = useState<string>("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const genId = `#${Math.random().toString(36).slice(2, 9)}`;
    onCreate({
      id: genId,
      title: name,
      destination: to,
      from,
      to,
      place: "",
      datetime: "",
      driverName: "",
      driverRating: 0,
      driverPhoto: undefined,
      cargoWeight: cargoWeight ? parseFloat(cargoWeight) : undefined,
      segmentsAmount: segmentsAmount ? parseInt(segmentsAmount, 10) : undefined,
    });
    // reset
    setName("");
    setFrom("");
    setTo("");
    setCargoCategory("");
    setCargoWeight("");
    setSegmentsAmount("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-slate-200">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-slate-100"
            aria-label="Close"
            onClick={onClose}
          >
            <XIcon className="size-5 text-slate-500" />
          </button>
          <h3 className="text-slate-900 font-semibold">Add New Shipment</h3>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 grid gap-4">
          <div className="grid gap-1">
            <label className="text-xs text-slate-600">Name</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200"
              placeholder="Shipment Name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <label className="text-xs text-slate-600">From</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-9 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200"
                  placeholder="Search..."
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  list="city-options-list"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              </div>
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-slate-600">To</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-9 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200"
                  placeholder="Search..."
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  list="city-options-list"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              </div>
            </div>
          </div>
          {/* shared datalist for city selection */}
          <datalist id="city-options-list">
            {CITY_OPTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <label className="text-xs text-slate-600">Cargo Category</label>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200"
                  value={cargoCategory}
                  onChange={(e) => setCargoCategory(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="electronics">Electronics</option>
                  <option value="textiles">Textiles</option>
                  <option value="food">Food</option>
                  <option value="medical">Medical</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              </div>
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-slate-600">Cargo Weight</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="w-full rounded-xl border border-slate-200 pr-12 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200"
                  placeholder="0.0"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(e.target.value)}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  KG
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-1">
            <label className="text-xs text-slate-600">Segments Amount</label>
            <input
              type="number"
              min="0"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200"
              placeholder="0"
              value={segmentsAmount}
              onChange={(e) => setSegmentsAmount(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
