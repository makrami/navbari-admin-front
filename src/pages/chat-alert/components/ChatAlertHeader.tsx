import {useState, useEffect, useRef} from "react";
import {MoreVertical, Trash2, AlertTriangle} from "lucide-react";
import {cn} from "../../../shared/utils/cn";
import {AlertBadge} from "./AlertBadge";
import {MessageBadge} from "./MessageBadge";
import {DriverInfo} from "../../../shared/components/DriverInfo";
import {useCurrentUser} from "../../../services/user/hooks";
import {useDeleteConversation} from "../../../services/chat/hooks";

type ChatAlertHeaderProps = {
  name: string;
  alerts: number;
  messages: number;
  selected?: boolean;
  rating?: number;
  conversationId: string;
  onMenuClick?: (e: React.MouseEvent) => void;
  onConversationDeleted?: () => void;
};

export function ChatAlertHeader({
  name,
  alerts,
  messages,
  selected = false,
  rating,
  conversationId,
  onMenuClick,
  onConversationDeleted,
}: ChatAlertHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const {data: user} = useCurrentUser();
  const deleteConversationMutation = useDeleteConversation();

  // Get permissions array from user data
  const userRecord = user as Record<string, unknown> | undefined;
  const permissions = (userRecord?.permissions as string[] | undefined) || [];
  const hasChatsDelete = permissions.includes("chats:delete");

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleDelete = async () => {
    try {
      await deleteConversationMutation.mutateAsync(conversationId);
      setShowDeleteModal(false);
      setIsMenuOpen(false);
      onConversationDeleted?.();
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      // Error is handled by the mutation
    }
  };

  const handleMenuButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChatsDelete) {
      setIsMenuOpen(!isMenuOpen);
    }
    onMenuClick?.(e);
  };

  return (
    <>
      <div className="flex-col ">
        <div className="flex items-center justify-between gap-1.5 min-w-0">
          <DriverInfo
            selected={selected}
            driverName={name}
            driverRating={rating}
            showRating={true}
            avatarSize="sm"
            nameClassName={cn(
              "text-sm font-bold truncate",
              selected ? "text-white" : "text-slate-900"
            )}
            showRatingBeforeName={false}
            className="gap-1.5"
          />
          {hasChatsDelete && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={handleMenuButtonClick}
                className={cn(
                  "p-1 rounded-md transition-colors",
                  selected ? "hover:bg-white/20" : "hover:bg-slate-100"
                )}
              >
                <MoreVertical
                  className={cn(
                    "size-4",
                    selected ? "text-white" : "text-slate-600"
                  )}
                />
              </button>
              {isMenuOpen && (
                <div
                  className={cn(
                    "absolute right-0 top-full mt-1 border rounded-lg shadow-lg z-50 min-w-[160px]",
                    selected
                      ? "bg-[#1B54FE] border-blue-600"
                      : "bg-white border-slate-200"
                  )}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      setShowDeleteModal(true);
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg",
                      selected
                        ? "text-red-200 hover:bg-red-500/20"
                        : "text-red-600 hover:bg-red-50"
                    )}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 my-2">
          <AlertBadge count={alerts} selected={selected} />
          <MessageBadge count={messages} selected={selected} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="size-6 text-red-600" />
              <h3 className="text-lg font-semibold">Delete Conversation</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteConversationMutation.isPending}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteConversationMutation.isPending}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteConversationMutation.isPending
                  ? "Deleting..."
                  : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
