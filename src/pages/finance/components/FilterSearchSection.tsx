import { useState } from "react";
import {
  MapIcon,
  BoxesIcon,
  Users,
  ListChecksIcon,
  Calendar,
  Search,
  ChevronDown,
} from "lucide-react";

export function FilterSearchSection() {
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedDriver, setSelectedDriver] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const countryOptions = [
    "All",
    "Egypt",
    "USA",
    "Spain",
    "France",
    "Germany",
    "UK",
    "China",
  ];
  const companyOptions = [
    "All",
    "DHL Logistics",
    "PTM Transport",
    "UPS Logistics",
    "FedEx",
    "TNT Express",
  ];
  const driverOptions = [
    "All",
    "Ahmed Hassan",
    "John Smith",
    "Maria Garcia",
    "Li Wei",
    "Pierre Dubois",
  ];
  const statusOptions = ["All", "Pending", "Paid", "Overdue", "Cancelled"];
  const dateOptions = [
    "All",
    "Today",
    "This Week",
    "This Month",
    "Last Month",
    "This Year",
  ];
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {/* Country Filter */}
        <div className="relative">
          <div
            className="flex items-center gap-3 px-3 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer hover:bg-slate-50"
            onClick={() =>
              setOpenDropdown(openDropdown === "country" ? null : "country")
            }
          >
            <MapIcon className="size-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Country:</span>
            <span className="text-sm ml-auto font-bold text-slate-900">
              {selectedCountry}
            </span>
            <ChevronDown className="size-4 text-slate-400 ml-auto" />
          </div>
          {openDropdown === "country" && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
              {countryOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedCountry(option);
                    setOpenDropdown(null);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Company Filter */}
        <div className="relative">
          <div
            className="flex items-center gap-3 px-3 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer hover:bg-slate-50"
            onClick={() =>
              setOpenDropdown(openDropdown === "company" ? null : "company")
            }
          >
            <BoxesIcon className="size-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-700">Company:</span>
            <span className="text-xs ml-auto font-bold text-slate-900">
              {selectedCompany}
            </span>
            <ChevronDown className="size-4 text-slate-400 ml-auto" />
          </div>
          {openDropdown === "company" && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
              {companyOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedCompany(option);
                    setOpenDropdown(null);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Driver Filter */}
        <div className="relative">
          <div
            className="flex items-center gap-3 px-3 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer hover:bg-slate-50"
            onClick={() =>
              setOpenDropdown(openDropdown === "driver" ? null : "driver")
            }
          >
            <Users className="size-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-700">Driver:</span>
            <span className="text-xs ml-auto font-bold text-slate-900">
              {selectedDriver}
            </span>
            <ChevronDown className="size-4 text-slate-400 ml-auto" />
          </div>
          {openDropdown === "driver" && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
              {driverOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedDriver(option);
                    setOpenDropdown(null);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <div
            className="flex items-center gap-3 px-3 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer hover:bg-slate-50"
            onClick={() =>
              setOpenDropdown(openDropdown === "status" ? null : "status")
            }
          >
            <ListChecksIcon className="size-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-700">Status:</span>
            <span className="text-xs ml-auto font-bold text-slate-900">
              {selectedStatus}
            </span>
            <ChevronDown className="size-4 text-slate-400 ml-auto" />
          </div>
          {openDropdown === "status" && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedStatus(option);
                    setOpenDropdown(null);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Filter */}
        <div className="relative">
          <div
            className="flex items-center gap-3 px-3 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer hover:bg-slate-50"
            onClick={() =>
              setOpenDropdown(openDropdown === "date" ? null : "date")
            }
          >
            <Calendar className="size-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-700">Date:</span>
            <span className="text-xs ml-auto font-bold text-slate-900">
              {selectedDate}
            </span>
            <ChevronDown className="size-4 text-slate-400 ml-auto" />
          </div>
          {openDropdown === "date" && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
              {dateOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedDate(option);
                    setOpenDropdown(null);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 px-3 py-2 border border-slate-200 rounded-lg bg-white">
        <Search className="size-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Shipment ID, Segment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none"
        />
      </div>
    </div>
  );
}
