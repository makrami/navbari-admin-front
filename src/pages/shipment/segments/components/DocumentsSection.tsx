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

export function DocumentsSection({ documents = [] }: DocumentsSectionProps) {
  // Use provided documents only
  const displayDocuments = documents;

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
            className="flex flex-col w-18 items-center justify-center rounded-xl border border-dashed border-slate-300 px-3 py-6 hover:bg-slate-50 transition-colors bg-white shrink-0"
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
