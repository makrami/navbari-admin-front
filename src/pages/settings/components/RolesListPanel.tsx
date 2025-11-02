import { useState, useRef, useEffect } from "react";
import { Search, Filter, MoreVertical, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export type Role = {
  id: string;
  name: string;
  description: string;
  userCount: number;
  status: "Active" | "Suspended";
};

type RolesListPanelProps = {
  roles: Role[];
  selectedRoleId: string | null;
  onRoleSelect: (roleId: string) => void;
  onAddRole: () => void;
};

export function RolesListPanel({
  roles,
  selectedRoleId,
  onRoleSelect,
  onAddRole,
}: RolesListPanelProps) {
  const { t } = useTranslation();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const handleSearchIconClick = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchBlur = () => {
    if (!searchValue.trim()) {
      setIsSearchExpanded(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      setIsSearchExpanded(false);
    }
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setIsSearchExpanded(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  return (
    <div className="w-[40%] border-r border-slate-200 pr-4">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          {/* Add New Role Button */}
          <button
            type="button"
            onClick={onAddRole}
            className={`py-1.5 bg-[#1B54FE] text-white rounded-lg hover:bg-[#1545d4] transition-all duration-300 font-medium flex items-center justify-center whitespace-nowrap ${
              isSearchExpanded
                ? "px-2.5 min-w-[30px] flex-shrink-0 gap-0"
                : "px-4 flex-1 gap-2"
            }`}
          >
            <span
              className={`transition-all duration-300 ${
                isSearchExpanded
                  ? "w-0 opacity-0 overflow-hidden"
                  : "opacity-100"
              }`}
            >
              {t("settings.sections.rolesPermissions.addNewRole")}
            </span>
            <Plus className="size-4 flex-shrink-0" />
          </button>

          {/* Search Container */}
          <div
            className={`relative transition-all duration-300 ${
              isSearchExpanded ? "flex-1" : "w-auto"
            }`}
          >
            {!isSearchExpanded ? (
              <button
                type="button"
                onClick={handleSearchIconClick}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors bg-white"
              >
                <Search className="size-4 text-slate-400" />
              </button>
            ) : (
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onBlur={handleSearchBlur}
                  placeholder={t("settings.sections.rolesPermissions.search")}
                  className="w-full pl-10 pr-10 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900 text-sm"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded transition-colors"
                  >
                    <X className="size-3 text-slate-400" />
                  </button>
                )}
              </form>
            )}
          </div>

          {/* Filter Button */}
          <button
            type="button"
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors bg-white flex-shrink-0"
          >
            <Filter className="size-4 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => onRoleSelect(role.id)}
            className={`p-4 rounded-lg  cursor-pointer transition-colors ${
              selectedRoleId === role.id
                ? "bg-blue-50 border-2 text-[#1B54FE] border-[#1B54FE]/10"
                : "bg-white border-2 border-transparent hover:border-slate-300"
            }`}
          >
            <div className="flex items-start ">
              <div className="flex-1 flex flex-col gap-2 justify-between">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={`text-sm font-bold  mb-1 ${
                      selectedRoleId === role.id
                        ? "text-[#1B54FE]"
                        : "text-slate-900"
                    }`}
                  >
                    {role.name}{" "}
                    <span
                      className={`text-xs font-medium ${
                        selectedRoleId === role.id
                          ? "text-[#1B54FE]"
                          : " text-slate-900"
                      }`}
                    >
                      ({role.userCount}{" "}
                      {t("settings.sections.rolesPermissions.user")})
                    </span>
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 font-bold rounded-lg ${
                      role.status === "Active"
                        ? "bg-green-100  text-green-500"
                        : "bg-yellow-100 text-yellow-500"
                    }`}
                  >
                    {role.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400 ">{role.description}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle menu click
                }}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <MoreVertical className="size-4 text-slate-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
