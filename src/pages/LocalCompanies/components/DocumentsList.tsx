import type {HTMLAttributes} from "react";
import {useRef, useState} from "react";
import {cn} from "../../../shared/utils/cn";
import {
  FileText as FileTextIcon,
  Check as CheckIcon,
  X as XIcon,
  Eye as EyeIcon,
  FileClock,
  Upload as UploadIcon,
  X as CloseIcon,
} from "lucide-react";
import {
  useCompanyDocuments,
  useApproveDocument,
  useRejectDocument,
  useUploadDocument,
} from "../../../services/company/hooks";
import {
  COMPANY_DOCUMENT_TYPE,
  COMPANY_DOCUMENT_STATUS,
} from "../../../services/company/document.service";
import type {CompanyDocumentReadDto} from "../../../services/company/document.service";
import {getFileUrl} from "../utils";

export type DocumentStatus = "pending" | "approved" | "rejected";

const documentTypeLabels: Record<string, string> = {
  license: "License",
  insurance: "Insurance",
  manager_id: "Manager ID",
  primary_contact_id: "Primary Contact ID",
  other: "Other Document",
};

type DocumentCardProps = HTMLAttributes<HTMLDivElement> & {
  doc: CompanyDocumentReadDto;
  onApprove?: () => void;
  onReject?: () => void;
  onView?: () => void;
  onPreview?: () => void;
};

function DocumentCard({
  doc,
  onApprove,
  onReject,
  onView,
  onPreview,
  className,
  ...rest
}: DocumentCardProps & {onPreview?: () => void}) {
  const statusBadge = {
    approved: {icon: CheckIcon, wrap: "bg-green-100 text-green-600"},
    rejected: {icon: XIcon, wrap: "bg-red-100 text-red-600"},
    pending: {icon: FileClock, wrap: "bg-amber-100 text-amber-600"},
  }[doc.status];

  const documentTitle =
    documentTypeLabels[doc.documentType] || doc.documentType;
  const fileUrl = getFileUrl(doc.filePath);

  // Check if file is an image
  const isImage =
    fileUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.filePath || "");

  const handleView = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
    onView?.();
  };

  return (
    <div
      className={cn("rounded-2xl bg-white p-4 space-y-3", className)}
      {...rest}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-900 truncate">
          {documentTitle}
        </h3>
        <span
          className={cn(
            "inline-grid place-items-center rounded-full size-6",
            statusBadge.wrap
          )}
          aria-label={doc.status}
        >
          {statusBadge.icon && <statusBadge.icon className="size-4" />}
        </span>
      </div>
      <div className="grid place-items-center rounded-lg bg-slate-100 h-24 overflow-hidden relative group">
        {isImage && fileUrl ? (
          <img
            src={fileUrl}
            alt={documentTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to icon if image fails to load
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const icon = document.createElement("div");
                icon.className = "grid place-items-center";
                icon.innerHTML = `<svg class="size-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`;
                parent.appendChild(icon);
              }
            }}
          />
        ) : (
          <FileTextIcon className="size-10 text-slate-400" />
        )}
        {(doc.status === COMPANY_DOCUMENT_STATUS.PENDING ||
          doc.status === COMPANY_DOCUMENT_STATUS.REJECTED) && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <button
              type="button"
              onClick={handleView}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 shadow-lg"
            >
              Open
              <FileTextIcon className="size-4" />
            </button>
          </div>
        )}
      </div>
      {doc.rejectionReason && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          <strong>Rejection reason:</strong> {doc.rejectionReason}
        </div>
      )}
      {doc.status === COMPANY_DOCUMENT_STATUS.PENDING && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onApprove}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
          >
            Approve
            <CheckIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={onReject}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-200"
          >
            Reject
            <XIcon className="size-4" />
          </button>
        </div>
      )}
      {doc.status === COMPANY_DOCUMENT_STATUS.APPROVED && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-100 py-2 text-xs font-medium text-blue-700 hover:bg-blue-200"
          >
            Preview
            <EyeIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleView}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-100 py-2 text-xs font-medium text-slate-900 hover:bg-slate-200"
          >
            Open
            <FileTextIcon className="size-4" />
          </button>
        </div>
      )}
      {doc.status === COMPANY_DOCUMENT_STATUS.REJECTED && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onApprove}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-green-100 py-2 text-xs font-medium text-green-700 hover:bg-green-200"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-100 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
          >
            Preview
            <EyeIcon className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

type DocumentsListProps = {
  title?: string;
  companyId: string | null;
  className?: string;
};

export default function DocumentsList({
  title = "Documents",
  companyId,
  className,
}: DocumentsListProps) {
  const {data: documents = [], isLoading} = useCompanyDocuments(companyId);
  const approveMutation = useApproveDocument();
  const rejectMutation = useRejectDocument();
  const uploadMutation = useUploadDocument();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [previewDocument, setPreviewDocument] =
    useState<CompanyDocumentReadDto | null>(null);

  // New ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to approve document:", error);
    }
  };

  const handleReject = (id: string) => {
    setSelectedDocumentId(id);
    setShowRejectDialog(true);
  };

  const confirmReject = async () => {
    if (!selectedDocumentId || !rejectReason.trim()) return;
    try {
      await rejectMutation.mutateAsync({
        id: selectedDocumentId,
        rejectionReason: rejectReason.trim(),
      });
      setShowRejectDialog(false);
      setRejectReason("");
      setSelectedDocumentId(null);
    } catch (error) {
      console.error("Failed to reject document:", error);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !companyId) return;

    // You might want to add a document type selector
    const documentType = COMPANY_DOCUMENT_TYPE.OTHER; // Default, could be made configurable

    try {
      await uploadMutation.mutateAsync({
        companyId,
        documentType,
        file,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input to allow uploading the same file again
      }
    } catch (error) {
      console.error("Failed to upload document:", error);
    }
  };

  if (!companyId) {
    return null;
  }

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <div>
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            style={{display: "none"}}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            <UploadIcon className="size-4" />
            Upload
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-slate-500">
          Loading documents...
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No documents found
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onApprove={() => handleApprove(doc.id)}
              onReject={() => handleReject(doc.id)}
              onPreview={() => setPreviewDocument(doc)}
            />
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Document</h3>
            <p className="text-sm text-slate-600 mb-4">
              Please provide a reason for rejection:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full min-h-24 rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason("");
                  setSelectedDocumentId(null);
                }}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReject}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {(() => {
                  const documentTypeLabels: Record<string, string> = {
                    license: "License",
                    insurance: "Insurance",
                    manager_id: "Manager ID",
                    primary_contact_id: "Primary Contact ID",
                    other: "Other Document",
                  };
                  return (
                    documentTypeLabels[previewDocument.documentType] ||
                    previewDocument.documentType
                  );
                })()}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close preview"
              >
                <CloseIcon className="size-5 text-slate-600" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {(() => {
                const previewUrl = getFileUrl(previewDocument.filePath);
                const isImage =
                  previewUrl &&
                  /\.(jpg|jpeg|png|gif|webp)$/i.test(
                    previewDocument.filePath || ""
                  );

                if (isImage && previewUrl) {
                  return (
                    <img
                      src={previewUrl}
                      alt={
                        documentTypeLabels[previewDocument.documentType] ||
                        previewDocument.documentType
                      }
                      className="max-w-full h-auto mx-auto"
                    />
                  );
                } else if (previewUrl) {
                  return (
                    <div className="text-center py-12">
                      <FileTextIcon className="size-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">
                        Preview not available for this file type
                      </p>
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Open File
                        <FileTextIcon className="size-4" />
                      </a>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-center py-12">
                      <FileTextIcon className="size-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">File not available</p>
                    </div>
                  );
                }
              })()}
            </div>
            <div className="p-4 border-t border-slate-200 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const url = getFileUrl(previewDocument.filePath);
                  if (url) {
                    window.open(url, "_blank");
                  }
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Open in New Tab
                <FileTextIcon className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
