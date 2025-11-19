import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";

interface RejectionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  driverName?: string;
}

export function RejectionReasonModal({
  isOpen,
  onClose,
  onSubmit,
  driverName,
}: RejectionReasonModalProps) {
  const [reason, setReason] = useState("");

  // Handle escape key and body scroll lock
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
      setReason(""); // Reset form when closing
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit(reason.trim());
      setReason("");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 opacity-100 pointer-events-auto"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              Reject Driver
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {driverName && (
              <p className="text-sm text-slate-600 mb-4">
                Please provide a reason for rejecting{" "}
                <span className="font-semibold">{driverName}</span>.
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="rejection-reason"
                  className="block text-sm font-medium text-slate-900 mb-2"
                >
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="rejection-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                disabled={!reason.trim()}
              >
                Reject Driver
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
