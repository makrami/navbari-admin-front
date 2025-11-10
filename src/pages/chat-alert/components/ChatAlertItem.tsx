import { cn } from "../../../shared/utils/cn";
import type { ChatAlert } from "../data";
import { ChatAlertAvatar } from "./ChatAlertAvatar";
import { ChatAlertHeader } from "./ChatAlertHeader";
import { ChatAlertFooter } from "./ChatAlertFooter";
import { handleChatAlertKeyDown, handleMenuClick } from "./utils";

type ChatAlertItemProps = {
  chatAlert: ChatAlert;
  selected?: boolean;
  onSelect: (id: string) => void;
  onMenuClick?: () => void;
};

export function ChatAlertItem({
  chatAlert,
  selected = false,
  onSelect,
  onMenuClick,
}: ChatAlertItemProps) {
  const handleMenuButtonClick = (e: React.MouseEvent) => {
    handleMenuClick(e);
    onMenuClick?.();
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors",
        selected ? "bg-[#1B54FE] text-white" : "bg-white hover:bg-slate-50"
      )}
      onClick={() => onSelect(chatAlert.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => handleChatAlertKeyDown(e, onSelect, chatAlert.id)}
    >
      <ChatAlertAvatar avatarUrl={chatAlert.avatarUrl} name={chatAlert.name} />

      <div className="flex-1 min-w-0">
        <ChatAlertHeader
          name={chatAlert.name}
          alerts={chatAlert.alerts}
          messages={chatAlert.messages}
          selected={selected}
          onMenuClick={handleMenuButtonClick}
        />

        <ChatAlertFooter
          messagePreview={chatAlert.messagePreview}
          timestamp={chatAlert.timestamp}
          selected={selected}
          onMenuClick={handleMenuButtonClick}
        />
      </div>
    </div>
  );
}
