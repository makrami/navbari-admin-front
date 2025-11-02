import { X } from "lucide-react";
import { useEffect, useState } from "react";

export type AddEditUserModalProps = {
  open: boolean;
  mode: "add" | "edit";
  roleName: string;
  initialUser?: { id?: string; name: string; email: string } | null;
  onClose: () => void;
  onSubmit: (data: { id?: string; name: string; email: string }) => void;
};

export function AddEditUserModal({
  open,
  mode,
  roleName,
  initialUser,
  onClose,
  onSubmit,
}: AddEditUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const isEdit = mode === "edit";

  useEffect(() => {
    if (open) {
      setName(initialUser?.name ?? "");
      setEmail(initialUser?.email ?? "");
    }
  }, [open, initialUser]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSubmit({ id: initialUser?.id, name: name.trim(), email: email.trim() });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              {isEdit ? "Edit User in" : "Add New User to"} “{roleName}”
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X className="size-4 text-slate-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="px-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-900 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#1B54FE] text-white hover:bg-[#1545d4] transition-colors text-sm"
              >
                {isEdit ? "Save" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
