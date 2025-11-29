type ActionButtonsProps = {
  changesCount: number;
  onRevert: () => void;
  onSave: () => void;
  revertLabel?: string;
  saveLabel?: string;
  isSaving?: boolean;
};

export function ActionButtons({
  changesCount,
  onRevert,
  onSave,
  revertLabel = "Revert",
  saveLabel = "Save Changes",
  isSaving = false,
}: ActionButtonsProps) {
  const isDisabled = changesCount === 0 || isSaving;

  return (
    <div className="flex items-center bg-white p-3 rounded-lg justify-between border-slate-200">
      <span className="text-xs text-slate-900">
        {isSaving ? (
          <span className="text-slate-900">Saving...</span>
        ) : changesCount > 0 ? (
          <span className="text-slate-900">
            There are <span className="font-bold">{changesCount}</span> changes
            to save
          </span>
        ) : (
          <span className="text-slate-900">No changes</span>
        )}
      </span>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRevert}
          disabled={isDisabled}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isDisabled
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          {revertLabel}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isDisabled}
          className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
            isDisabled
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSaving ? "Saving..." : saveLabel}
        </button>
      </div>
    </div>
  );
}
