type SegmentActionsProps = {
  onReset: () => void;
  onSave: () => void;
  onSaveDeclare: () => void;
};

export default function SegmentActions({
  onReset,
  onSave,
  onSaveDeclare,
}: SegmentActionsProps) {
  return (
    <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
      <button
        type="button"
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        onClick={onReset}
      >
        Reset
      </button>
      <button
        type="button"
        className="rounded-lg bg-blue-100 font-bold text-blue-700 px-4 py-2 text-sm hover:bg-blue-200"
        onClick={onSave}
      >
        Save
      </button>
      <button
        type="button"
        className="rounded-lg font-bold bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        onClick={onSaveDeclare}
      >
        Save & Declare
      </button>
    </div>
  );
}
