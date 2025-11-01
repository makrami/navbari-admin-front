import { Paperclip } from "lucide-react";
import DocumentCard from "./DocumentCard";

export type DocumentItem = {
  id: string | number;
  name: string;
  sizeLabel: string;
  status: "pending" | "approved" | "rejected";
  author?: string;
  thumbnailUrl?: string;
};

type DocumentsSectionProps = {
  documents?: DocumentItem[];
};

// Demo documents with pending status
const DEMO_DOCUMENTS: DocumentItem[] = [
  {
    id: 1,
    name: "photo_af...jpg",
    sizeLabel: "1.2MB",
    status: "pending",
    author: "Oni Chan",
  },
  {
    id: 2,
    name: "document_1.pdf",
    sizeLabel: "2.5MB",
    status: "pending",
    author: "Oni Chan",
  },
  {
    id: 3,
    name: "invoice_2024.pdf",
    sizeLabel: "856KB",
    status: "pending",
    author: "Oni Chan",
  },
  {
    id: 4,
    name: "contract_signed.pdf",
    sizeLabel: "1.8MB",
    status: "pending",
    author: "Oni Chan",
  },
];

export function DocumentsSection({ documents = [] }: DocumentsSectionProps) {
  // Use demo documents if no documents provided, otherwise use provided documents
  const displayDocuments = documents.length > 0 ? documents : DEMO_DOCUMENTS;

  const handleApprove = (docId: string | number) => {
    console.log("Approve document:", docId);
    // TODO: Implement approve functionality
  };

  const handleReject = (docId: string | number) => {
    console.log("Reject document:", docId);
    // TODO: Implement reject functionality
  };

  const handleReasons = (docId: string | number) => {
    console.log("Show reasons for document:", docId);
    // TODO: Implement show reasons functionality
  };

  return (
    <section>
      <header className="px-3 pt-3 pb-2 text-xs text-slate-900 font-bold">
        Documents
      </header>
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-3 px-3 pb-3">
          {/* Upload card - always first */}
          <button
            type="button"
            aria-label="Upload document"
            className="flex flex-col w-26 items-center justify-center rounded-xl border border-dashed border-slate-300 px-3 py-6 hover:bg-slate-50 transition-colors bg-white shrink-0"
          >
            <Paperclip className="size-5 text-slate-400" />
            <span className="mt-2 font-medium text-xs text-slate-400">
              Upload
            </span>
          </button>

          {/* Document cards */}
          {displayDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              authorName={doc.author ?? ""}
              fileName={doc.name}
              sizeLabel={doc.sizeLabel}
              status={doc.status}
              avatarUrl={doc.thumbnailUrl}
              onApprove={() => handleApprove(doc.id)}
              onReject={() => handleReject(doc.id)}
              onReasons={() => handleReasons(doc.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default DocumentsSection;
