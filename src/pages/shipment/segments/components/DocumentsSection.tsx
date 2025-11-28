import {Paperclip, FileText as FileTextIcon, X as XIcon} from "lucide-react";
import {useState, useRef} from "react";
import DocumentCard from "./DocumentCard";
import {
  uploadFileAttachment,
  updateFileAttachmentStatus,
} from "../../../../services/file-attachment/file-attachment.service";
import {ENV} from "../../../../lib/env";

export type DocumentItem = {
  id: string | number;
  name: string;
  sizeLabel: string;
  status: "pending" | "approved" | "rejected";
  author?: string;
  thumbnailUrl?: string;
  filePath?: string;
  rejectionComment?: string;
};

type DocumentsSectionProps = {
  documents?: DocumentItem[];
  segmentId?: string;
  onDocumentsUpdate?: () => void;
};

export function DocumentsSection({
  documents = [],
  segmentId,
  onDocumentsUpdate,
}: DocumentsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionComment, setRejectionComment] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<
    string | number | null
  >(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<DocumentItem | null>(
    null
  );

  // Use provided documents only
  const displayDocuments = documents;

  const getFileUrl = (filePath?: string): string | undefined => {
    if (!filePath) return undefined;
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }
    const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    return `${ENV.FILE_BASE_URL}/${cleanPath}`;
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !segmentId) return;

    setIsUploading(true);
    try {
      await uploadFileAttachment(segmentId, file);
      onDocumentsUpdate?.();
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to upload document:", error);
      alert("Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleApprove = async (docId: string | number) => {
    if (!segmentId) return;

    setIsUpdating(true);
    try {
      await updateFileAttachmentStatus(docId.toString(), "approved");
      onDocumentsUpdate?.();
    } catch (error) {
      console.error("Failed to approve document:", error);
      alert("Failed to approve document. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = (docId: string | number) => {
    setSelectedDocumentId(docId);
    setShowRejectDialog(true);
    setRejectionComment("");
  };

  const confirmReject = async () => {
    if (!selectedDocumentId || !rejectionComment.trim() || !segmentId) return;

    setIsUpdating(true);
    try {
      await updateFileAttachmentStatus(
        selectedDocumentId.toString(),
        "rejected",
        rejectionComment.trim()
      );
      setShowRejectDialog(false);
      setRejectionComment("");
      setSelectedDocumentId(null);
      onDocumentsUpdate?.();
    } catch (error) {
      console.error("Failed to reject document:", error);
      alert("Failed to reject document. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReasons = (doc: DocumentItem) => {
    if (doc.rejectionComment) {
      alert(`Rejection Reason: ${doc.rejectionComment}`);
    }
  };

  const handlePreview = (doc: DocumentItem) => {
    setPreviewDocument(doc);
  };

  const handleView = (doc: DocumentItem) => {
    const fileUrl = getFileUrl(doc.filePath);
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <section>
      <header className="px-3 pt-3 pb-2 text-xs text-slate-900 font-bold">
        Documents
      </header>
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-3 px-3 pb-3">
          {/* Upload card - always first */}
          {segmentId && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
              />
              <button
                type="button"
                aria-label="Upload document"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="flex flex-col w-18 items-center justify-center rounded-xl border border-dashed border-slate-300 px-3 py-6 hover:bg-slate-50 transition-colors bg-white shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Paperclip className="size-5 text-slate-400" />
                <span className="mt-2 font-medium text-xs text-slate-400">
                  {isUploading ? "Uploading..." : "Upload"}
                </span>
              </button>
            </>
          )}

          {/* Document cards */}
          {displayDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              authorName={doc.author ?? ""}
              fileName={doc.name}
              sizeLabel={doc.sizeLabel}
              status={doc.status}
              avatarUrl={doc.thumbnailUrl}
              filePath={doc.filePath}
              onApprove={() => handleApprove(doc.id)}
              onReject={() => handleReject(doc.id)}
              onReasons={() => handleReasons(doc)}
              onPreview={() => handlePreview(doc)}
              onView={() => handleView(doc)}
              disabled={isUpdating}
            />
          ))}
        </div>
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Document</h3>
            <p className="text-sm text-slate-600 mb-4">
              Please provide a reason for rejection:
            </p>
            <textarea
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full min-h-24 rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionComment("");
                  setSelectedDocumentId(null);
                }}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReject}
                disabled={!rejectionComment.trim() || isUpdating}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Rejecting..." : "Reject"}
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
                {previewDocument.name}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close preview"
              >
                <XIcon className="size-5 text-slate-600" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {(() => {
                const previewUrl = getFileUrl(previewDocument.filePath);
                const isImage =
                  previewUrl &&
                  previewDocument.filePath &&
                  /\.(jpg|jpeg|png|gif|webp)$/i.test(previewDocument.filePath);
                const isPdf =
                  previewUrl &&
                  previewDocument.filePath &&
                  /\.pdf$/i.test(previewDocument.filePath);

                if (isImage && previewUrl) {
                  return (
                    <img
                      src={previewUrl}
                      alt={previewDocument.name}
                      className="max-w-full h-auto mx-auto"
                    />
                  );
                } else if (isPdf && previewUrl) {
                  return (
                    <iframe
                      src={previewUrl}
                      className="w-full h-full min-h-[600px] border-0"
                      title={previewDocument.name}
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
                onClick={() => handleView(previewDocument)}
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

export default DocumentsSection;
