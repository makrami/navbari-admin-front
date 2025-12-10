import {X} from "lucide-react";
import {useTranslation} from "react-i18next";
import {DRIVER_DOCUMENT_TYPE} from "../../../services/driver/document.service";
import type {DRIVER_DOCUMENT_TYPE as DriverDocumentType} from "../../../services/driver/document.service";
import {cn} from "../../../shared/utils/cn";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocumentType: (documentType: DriverDocumentType) => void;
}

export function UploadDocumentModal({
  isOpen,
  onClose,
  onSelectDocumentType,
}: UploadDocumentModalProps) {
  const {t} = useTranslation();

  if (!isOpen) return null;

  // Helper function to translate document types
  const translateDocumentType = (documentType: string): string => {
    const translationKey = `drivers.page.documents.types.${documentType}`;
    const translated = t(translationKey);
    return translated === translationKey ? documentType : translated;
  };

  // Get all document types as an array
  const documentTypes = Object.values(DRIVER_DOCUMENT_TYPE);

  const handleSelect = (documentType: DriverDocumentType) => {
    onSelectDocumentType(documentType);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("drivers.page.documents.selectDocumentType")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="size-5 text-slate-900" />
          </button>
        </div>

        {/* Document Types List */}
        <div className="p-4">
          <div className="space-y-2">
            {documentTypes.map((documentType) => (
              <button
                key={documentType}
                type="button"
                onClick={() => handleSelect(documentType)}
                className={cn(
                  "w-full rounded-lg border border-gray-200 px-4 py-3 text-left",
                  "hover:bg-blue-50 hover:border-blue-300 transition-colors",
                  "text-sm font-medium text-gray-900"
                )}
              >
                {translateDocumentType(documentType)}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
