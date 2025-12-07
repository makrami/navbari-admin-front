import {useState} from "react";
import {Loader2} from "lucide-react";

type SegmentActionsProps = {
  onReset: () => void;
  onSave: () => void | Promise<void>;
  onSaveDeclare: () => void | Promise<void>;
  readOnly?: boolean;
};

export default function SegmentActions({
  onReset,
  onSave,
  onSaveDeclare,
  readOnly = false,
}: SegmentActionsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDeclare, setIsSavingDeclare] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDeclare = async () => {
    if (isSavingDeclare) return;
    setIsSavingDeclare(true);
    try {
      await onSaveDeclare();
    } finally {
      setIsSavingDeclare(false);
    }
  };

  if (readOnly) return null;
  return (
    <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
      <button
        type="button"
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        onClick={onReset}
        disabled={isSaving || isSavingDeclare}
      >
        Reset
      </button>
      <button
        type="button"
        className="rounded-lg bg-blue-100 font-bold text-blue-700 px-4 py-2 text-sm hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        onClick={handleSave}
        disabled={isSaving || isSavingDeclare}
      >
        {isSaving && <Loader2 className="size-4 animate-spin" />}
        Save
      </button>
      <button
        type="button"
        className="rounded-lg font-bold bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        onClick={handleSaveDeclare}
        disabled={isSaving || isSavingDeclare}
      >
        {isSavingDeclare && <Loader2 className="size-4 animate-spin" />}
        Save & Declare
      </button>
    </div>
  );
}
