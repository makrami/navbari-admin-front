import { Paperclip } from "lucide-react";
import avatar from "../../../../assets/images/avatar.png";
import DocumentCard from "./DocumentCard";
export type DocumentItem = {
  id: string | number;
  name: string;
  sizeLabel: string;
  status: "ok" | "error" | "info";
  author?: string;
  thumbnailUrl?: string;
};

type DocumentsSectionProps = {
  documents: DocumentItem[];
};

export function DocumentsSection({ documents }: DocumentsSectionProps) {
  return (
    <section>
      <header className="px-3 pt-3 pb-2 text-xs  text-slate-900">
        Documents
      </header>
      <div className="px-3 pb-3">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
          {/* Upload */}
          <button
            type="button"
            aria-label="Upload document"
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-3 py-6 hover:bg-slate-50"
          >
            <Paperclip className="size-5 text-slate-400" />
            <span className="mt-2 font-medium text-xs text-slate-400">
              Upload
            </span>
          </button>

          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              authorName={doc.author ?? ""}
              fileName={doc.name}
              sizeLabel={doc.sizeLabel}
              status={doc.status}
              avatarUrl={doc.thumbnailUrl ?? avatar}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default DocumentsSection;
