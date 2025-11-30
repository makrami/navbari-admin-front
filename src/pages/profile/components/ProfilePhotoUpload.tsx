import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { cn } from "../../../shared/utils/cn";

type ProfilePhotoUploadProps = {
  photo: string | null;
  onPhotoChange: (file: File | null, preview: string | null) => void;
};

export function ProfilePhotoUpload({
  photo,
  onPhotoChange,
}: ProfilePhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        onPhotoChange(file, preview);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div>
      <label className="block text-xs text-slate-900 mb-2">Profile Photo</label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed bg-white rounded-lg p-4 flex items-center gap-4 cursor-pointer transition-colors",
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 hover:border-slate-400"
        )}
      >
        <div className="flex-shrink-0">
          {photo ? (
            <img
              src={photo}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
              <Upload className="w-6 h-6 text-slate-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-900">
            Click upload or drag and drop
          </p>
          <p className="text-xs text-slate-900">
            JPEG, PNG, JPG, WEBP (Max 5MB)
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="px-4 py-2 bg-blue-600/10 text-blue-600 font-bold rounded-lg text-xs hover:bg-blue-700 transition-colors"
        >
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
