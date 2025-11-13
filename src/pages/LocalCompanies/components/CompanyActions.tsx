import { useState } from "react";
import { Check as CheckIcon, X as XIcon, AlertTriangle as AlertTriangleIcon } from "lucide-react";
import {
  useApproveCompany,
  useRejectCompany,
  useSuspendCompany,
  useUnsuspendCompany,
} from "../../../services/company/hooks";
import { COMPANY_STATUS } from "../../../services/company/company.service";
import type { CompanyReadDto } from "../../../services/company/company.service";

type CompanyActionsProps = {
  company: CompanyReadDto;
};

export function CompanyActions({ company }: CompanyActionsProps) {
  const approveMutation = useApproveCompany();
  const rejectMutation = useRejectCompany();
  const suspendMutation = useSuspendCompany();
  const unsuspendMutation = useUnsuspendCompany();

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async () => {
    if (window.confirm(`Are you sure you want to approve "${company.name}"?`)) {
      try {
        await approveMutation.mutateAsync(company.id);
      } catch (error) {
        console.error("Failed to approve company:", error);
        alert("Failed to approve company. Please try again.");
      }
    }
  };

  const handleReject = () => {
    setShowRejectDialog(true);
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        id: company.id,
        rejectionReason: rejectionReason.trim(),
      });
      setShowRejectDialog(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Failed to reject company:", error);
      alert("Failed to reject company. Please try again.");
    }
  };

  const handleSuspend = async () => {
    if (
      window.confirm(
        `Are you sure you want to deactivate "${company.name}"? The company will be suspended and cannot operate normally.`
      )
    ) {
      try {
        await suspendMutation.mutateAsync(company.id);
      } catch (error) {
        console.error("Failed to suspend company:", error);
        alert("Failed to deactivate company. Please try again.");
      }
    }
  };

  const handleUnsuspend = async () => {
    if (
      window.confirm(
        `Are you sure you want to activate "${company.name}"? The company will be able to operate normally again.`
      )
    ) {
      try {
        await unsuspendMutation.mutateAsync(company.id);
      } catch (error) {
        console.error("Failed to unsuspend company:", error);
        alert("Failed to activate company. Please try again.");
      }
    }
  };

  // Show actions based on company status
  if (company.status === COMPANY_STATUS.PENDING) {
    return (
      <>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleApprove}
            disabled={approveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            <CheckIcon className="size-4" />
            {approveMutation.isPending ? "Approving..." : "Approve"}
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={rejectMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            <XIcon className="size-4" />
            {rejectMutation.isPending ? "Rejecting..." : "Reject"}
          </button>
        </div>

        {/* Reject Dialog */}
        {showRejectDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangleIcon className="size-6 text-red-600" />
                <h3 className="text-lg font-semibold">Reject Company</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Are you sure you want to reject "{company.name}"? Please provide a reason:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason (required)..."
                className="w-full min-h-24 rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              />
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectionReason("");
                  }}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmReject}
                  disabled={!rejectionReason.trim() || rejectMutation.isPending}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (company.status === COMPANY_STATUS.APPROVED) {
    return (
      <button
        type="button"
        onClick={handleSuspend}
        disabled={suspendMutation.isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        <XIcon className="size-4" />
        {suspendMutation.isPending ? "Deactivating..." : "Deactivate"}
      </button>
    );
  }

  if (company.status === COMPANY_STATUS.SUSPENDED) {
    return (
      <button
        type="button"
        onClick={handleUnsuspend}
        disabled={unsuspendMutation.isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        <CheckIcon className="size-4" />
        {unsuspendMutation.isPending ? "Activating..." : "Activate"}
      </button>
    );
  }

  // For rejected companies, no actions available
  return null;
}

