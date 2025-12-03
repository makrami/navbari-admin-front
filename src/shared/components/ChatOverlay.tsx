import {X, MessageSquareText} from "lucide-react";
import {ChatSection} from "../../pages/chat-alert/components/ChatSection";
import type {ActionableAlertChip} from "../../pages/chat-alert/types/chat";
import type {UseChatWithRecipientReturn} from "../hooks/useChatWithRecipient";

export interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  chatHook: UseChatWithRecipientReturn;
  actionableAlerts: ActionableAlertChip[];
  emptyStateText?: string;
  initialTab?: "all" | "chats" | "alerts";
}

export function ChatOverlay({
  isOpen,
  onClose,
  recipientName,
  chatHook,
  actionableAlerts,
  emptyStateText,
  initialTab = "all",
}: ChatOverlayProps) {
  if (!isOpen) return null;

  const {
    messages,
    handleSendMessage,
    handleAlertChipClick,
    sendMessageMutation,
    sendAlertMutation,
    messagesLoading,
    conversation,
    canLoadMore,
    fetchNextPage,
    isFetchingNextPage,
    isTyping,
    isEmpty,
  } = chatHook;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Chat Panel */}
      <div
        className="fixed bottom-4 right-4 w-full max-w-md h-[600px] bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 id="chat-title" className="text-lg font-semibold text-slate-900">
            Chat with {recipientName}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Chat Section */}
        <div className="flex-1 min-h-0">
          <ChatSection
            key={conversation?.id || recipientName}
            messages={messages}
            actionableAlerts={actionableAlerts}
            onSendMessage={handleSendMessage}
            onAlertChipClick={handleAlertChipClick}
            isSendingMessage={
              sendMessageMutation.isPending || sendAlertMutation.isPending
            }
            isLoading={
              conversation ? messagesLoading && messages.length === 0 : false
            }
            canLoadMore={canLoadMore}
            onLoadMore={() => fetchNextPage()}
            isFetchingMore={isFetchingNextPage}
            isTyping={isTyping}
            initialTab={initialTab}
            emptyState={
              isEmpty
                ? {
                    icon: (
                      <div className="relative inline-block mb-4">
                        <MessageSquareText className="size-16 text-slate-300" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-0.5 bg-slate-400 rotate-45" />
                        </div>
                      </div>
                    ),
                    text:
                      emptyStateText || `Start Messaging to ${recipientName}`,
                  }
                : undefined
            }
          />
        </div>
      </div>
    </>
  );
}
