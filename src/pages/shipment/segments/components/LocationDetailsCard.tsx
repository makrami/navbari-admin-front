import { useState, useEffect } from "react";
import { PenLine, Check, X } from "lucide-react";

type LocationDetailsCardProps = {
  title: "ORIGIN DETAILS" | "DESTINATION DETAILS";
  content: string;
  onSave?: (newContent: string) => void | Promise<void>;
  disabled?: boolean;
};

export default function LocationDetailsCard({
  title,
  content,
  onSave,
  disabled = false,
}: LocationDetailsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  // Sync editedContent when content prop changes (but not when editing)
  useEffect(() => {
    if (!isEditing) {
      setEditedContent(content);
    }
  }, [content, isEditing]);

  const handleEdit = () => {
    setEditedContent(content);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const handleConfirm = async () => {
    if (onSave) {
      await onSave(editedContent);
    }
    setIsEditing(false);
  };

  return (
    <div className="rounded-xl  bg-white border border-slate-100 p-4 relative">
      {/* Title */}
      <div className="text-[10px] font-medium  text-slate-400 uppercase mb-4">
        {title}
      </div>

      {/* Content or Textarea */}
      {isEditing ? (
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full p-3 bg-blue-50 rounded-lg text-xs focus:outline-none text-[#1b54fe] placeholder:text-blue-400/60 resize-none"
          placeholder="Details..."
          disabled={disabled}
          autoFocus
        />
      ) : (
        <div className="text-xs text-[#1b54fe] whitespace-pre-wrap break-words">
          {content || "No details provided"}
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute top-2 right-4">
        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={disabled}
              className="p-1.5 rounded bg-red-600/10 hover:bg-red-600/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              aria-label="Cancel"
            >
              <X className="w-3 h-3 text-red-600" />
            </button>
            <button
              onClick={handleConfirm}
              disabled={disabled}
              className="p-1.5 rounded bg-blue-100 hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              aria-label="Confirm"
            >
              <Check className="w-3 h-3 text-blue-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleEdit}
            disabled={disabled}
            className="p-1.5 rounded bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            aria-label="Edit"
          >
            <PenLine className="w-3 h-3 text-[#1b54fe]" />
          </button>
        )}
      </div>
    </div>
  );
}
