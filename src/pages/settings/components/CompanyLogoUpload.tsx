import { useRef } from "react";
import { useTranslation } from "react-i18next";

type CompanyLogoUploadProps = {
  logoPreview: string | null;
  onLogoChange: (preview: string) => void;
  onFileSelect?: (file: File | null) => void;
};

export function CompanyLogoUpload({
  logoPreview,
  onLogoChange,
  onFileSelect,
}: CompanyLogoUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileSelect?.(file);
    } else {
      onFileSelect?.(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileSelect?.(file);
    }
  };

  return (
    <div>
      <label className="block text-xs  text-slate-900 mb-2">
        {t("settings.sections.general.companyLogo")}
      </label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-slate-200 rounded-lg p-6 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Logo Preview */}
          <div className="w-20 h-20 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Company logo"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">UPS</span>
              </div>
            )}
          </div>

          {/* Upload Text */}
          <div className="flex-1">
            <p className="text-sm text-slate-900 mb-1">
              {t("settings.sections.general.uploadText")}
            </p>
            <p className="text-xs text-slate-500">
              {t("settings.sections.general.uploadHint")}
            </p>
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={handleUploadClick}
            className="px-4 py-2 bg-[#1B54FE]/10 text-[#1B54FE] rounded-lg hover:bg-[#1B54FE]/15  text-sm transition-colors font-bold shrink-0"
          >
            {t("settings.sections.general.uploadButton")}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
