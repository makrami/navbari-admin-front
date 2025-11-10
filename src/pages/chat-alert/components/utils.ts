/**
 * Handles keyboard events for chat alert item selection
 */
export function handleChatAlertKeyDown(
  e: React.KeyboardEvent,
  onSelect: (id: string) => void,
  id: string
) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    onSelect(id);
  }
}

/**
 * Handles click events for menu buttons (prevents item selection)
 */
export function handleMenuClick(e: React.MouseEvent) {
  e.stopPropagation();
}

