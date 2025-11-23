import {useState, useEffect, useRef, useMemo} from "react";
import {XIcon, Search, ChevronDown, Check} from "lucide-react";
import {useCities} from "../../../services/geography/hooks";
import type {City} from "../../../services/geography/geography.service";

const CARGO_CATEGORY_OPTIONS = [
  {value: "electronics", label: "Electronics"},
  {value: "textiles", label: "Textiles"},
  {value: "food", label: "Food"},
  {value: "medical", label: "Medical"},
  {value: "machinery", label: "Machinery"},
  {value: "chemicals", label: "Chemicals"},
  {value: "automotive", label: "Automotive"},
  {value: "furniture", label: "Furniture"},
];

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

type CityDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  cities: City[];
  isLoading?: boolean;
};

function CityDropdown({
  value,
  onChange,
  placeholder,
  label,
  cities,
  isLoading = false,
}: CityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Format city display as "city, country"
  const cityOptions = useMemo(() => {
    return cities.map((city) => ({
      ...city,
      displayLabel: `${city.city}, ${city.country}`,
    }));
  }, [cities]);

  // Filter cities based on search term - show all when no search term
  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) return cityOptions;
    const lowerSearch = searchTerm.toLowerCase();
    return cityOptions.filter(
      (city) =>
        city.city.toLowerCase().includes(lowerSearch) ||
        city.country.toLowerCase().includes(lowerSearch) ||
        city.displayLabel.toLowerCase().includes(lowerSearch)
    );
  }, [cityOptions, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle city selection
  const handleSelectCity = (city: string) => {
    onChange(city);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Handle input focus and dropdown toggle
  const handleInputClick = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen) {
      setSearchTerm(""); // Clear search when opening to show all cities
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  // Handle input change for search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    // If user types and matches exactly, select it
    const exactMatch = cityOptions.find(
      (city) => city.displayLabel.toLowerCase() === newValue.toLowerCase()
    );
    if (exactMatch) {
      onChange(exactMatch.displayLabel);
    } else {
      onChange(newValue);
    }
  };

  // Handle clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div className="grid gap-1">
      <label className="text-xs text-slate-600">{label}</label>
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            ref={inputRef}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-9 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200"
            placeholder={placeholder}
            value={isOpen ? searchTerm : value}
            onChange={handleInputChange}
            onClick={handleInputClick}
          />
          {value && !isOpen && (
            <button
              type="button"
              className="absolute right-8 top-1/2 -translate-y-1/2 size-4 text-slate-400 hover:text-slate-600"
              onClick={handleClear}
            >
              <XIcon className="size-4" />
            </button>
          )}
          <ChevronDown
            className={`absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-slate-500">
                Loading cities...
              </div>
            ) : filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <div
                  key={`${city.city}-${city.country}`}
                  className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={() => handleSelectCity(city.displayLabel)}
                >
                  <span
                    className={
                      value === city.displayLabel
                        ? "font-medium text-slate-900"
                        : "text-slate-700"
                    }
                  >
                    {city.displayLabel}
                  </span>
                  {value === city.displayLabel && (
                    <Check className="size-4 text-blue-600" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">
                No cities found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type CargoCategoryDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
};

function CargoCategoryDropdown({
  value,
  onChange,
  placeholder,
  label,
}: CargoCategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter categories based on search term
  const filteredCategories = searchTerm.trim()
    ? CARGO_CATEGORY_OPTIONS.filter((category) =>
        category.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : CARGO_CATEGORY_OPTIONS;

  // Get selected category label
  const selectedCategory = CARGO_CATEGORY_OPTIONS.find(
    (cat) => cat.value === value
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle category selection
  const handleSelectCategory = (categoryValue: string) => {
    onChange(categoryValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Handle input focus and dropdown toggle
  const handleInputClick = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen) {
      setSearchTerm(""); // Clear search when opening to show all categories
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  // Handle input change for search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div className="grid gap-1">
      <label className="text-xs text-slate-600">{label}</label>
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            ref={inputRef}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-9 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200"
            placeholder={placeholder}
            value={isOpen ? searchTerm : selectedCategory?.label || ""}
            onChange={handleInputChange}
            onClick={handleInputClick}
          />
          {value && !isOpen && (
            <button
              type="button"
              className="absolute right-8 top-1/2 -translate-y-1/2 size-4 text-slate-400 hover:text-slate-600"
              onClick={handleClear}
            >
              <XIcon className="size-4" />
            </button>
          )}
          <ChevronDown
            className={`absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div
                  key={category.value}
                  className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={() => handleSelectCategory(category.value)}
                >
                  <span
                    className={
                      value === category.value
                        ? "font-medium text-slate-900"
                        : "text-slate-700"
                    }
                  >
                    {category.label}
                  </span>
                  {value === category.value && (
                    <Check className="size-4 text-blue-600" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">
                No categories found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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

  // Fetch cities from API
  const {data: cities = [], isLoading: isLoadingCities} = useCities();

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    // Generate a more unique ID using timestamp + random string
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 9);
    const genId = `#${timestamp}-${random}`;
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
            <CityDropdown
              label="From"
              placeholder="Search cities..."
              value={from}
              onChange={setFrom}
              cities={cities}
              isLoading={isLoadingCities}
            />
            <CityDropdown
              label="To"
              placeholder="Search cities..."
              value={to}
              onChange={setTo}
              cities={cities}
              isLoading={isLoadingCities}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CargoCategoryDropdown
              label="Cargo Category"
              placeholder="Search categories..."
              value={cargoCategory}
              onChange={setCargoCategory}
            />
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
            <label className="text-xs text-slate-600">Segment Count</label>
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
