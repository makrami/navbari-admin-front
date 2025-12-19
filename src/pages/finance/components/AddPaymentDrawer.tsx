import {useState, useEffect} from "react";
import {X, Search, ChevronDown, Calendar, Paperclip} from "lucide-react";

interface AddPaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPaymentDrawer({isOpen, onClose}: AddPaymentDrawerProps) {
  const [formData, setFormData] = useState({
    shipment: "",
    segment: "",
    country: "",
    driver: "",
    amount: "",
    method: "",
    status: "",
    date: "",
    reason: "",
    notes: "",
  });

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-full max-w-md bg-slate-100 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="sticky top-0 px-6 py-4 z-10">
          <div className="flex items-center gap-10">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2
              id="drawer-title"
              className="text-lg font-semibold text-gray-900"
            >
              Add New Payment
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 ">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Shipment */}
            <div>
              <label className="block text-xs  text-gray-900 mb-2">
                Shipment
              </label>
              <div className="relative ">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Shipment ID..."
                  value={formData.shipment}
                  onChange={(e) =>
                    handleInputChange("shipment", e.target.value)
                  }
                  className="w-full pl-10 pr-10 py-2 placeholder:text-gray-300 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Segment & Country */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs  text-gray-900 mb-2">
                  Segment
                </label>
                <div className="relative">
                  <select
                    value={formData.segment}
                    onChange={(e) =>
                      handleInputChange("segment", e.target.value)
                    }
                    className="w-full py-2 px-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="segment1">Segment 1</option>
                    <option value="segment2">Segment 2</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs  text-gray-900 mb-2">
                  Country
                </label>
                <div className="relative">
                  <select
                    value={formData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    className="w-full py-2 px-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="us">United States</option>
                    <option value="ca">Canada</option>
                    <option value="mx">Mexico</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Driver */}
            <div>
              <label className="block text-xs  text-gray-900 mb-2">
                Driver
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Shipment ID..."
                  value={formData.driver}
                  onChange={(e) => handleInputChange("driver", e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-white border placeholder:text-gray-300 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Amount & Method */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs  text-gray-900 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="text"
                    placeholder="$0.0"
                    value={formData.amount}
                    onChange={(e) =>
                      handleInputChange("amount", e.target.value)
                    }
                    className="w-full pl-8 py-2 bg-white border placeholder:text-gray-300 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs  text-gray-900 mb-2">
                  Method
                </label>
                <div className="relative">
                  <select
                    value={formData.method}
                    onChange={(e) =>
                      handleInputChange("method", e.target.value)
                    }
                    className="w-full py-2 px-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="wire">Wire Transfer</option>
                    <option value="credit">Credit Card</option>
                    <option value="paypal">PayPal</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Status & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs  text-gray-900 mb-2">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="w-full py-2 px-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs  text-gray-900 mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="mm/dd/yyyy"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="w-full pl-10 pr-10 py-2 placeholder:text-gray-300 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs  text-gray-900 mb-2">
                Reason
              </label>
              <input
                type="text"
                placeholder="e.g Custom Fee"
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                className="w-full py-2 px-3 bg-white border placeholder:text-gray-300 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs  text-gray-900 mb-2">
                Notes (Optional)
              </label>
              <textarea
                placeholder="Add any extra detail..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="w-full py-2 px-3 bg-white border placeholder:text-gray-300 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-xs  text-gray-900 mb-2">
                Attachments
              </label>
              <div className="border-2 border-dashed border-gray-200 bg-white hover:bg-gray-100 transition-colors rounded-xl p-8 text-center cursor-pointer">
                <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG or PDF (Max 2MB)
                </p>
              </div>
            </div>
          </form>
          <div className=" mt-4">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Payment
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
      </div>
    </>
  );
}
