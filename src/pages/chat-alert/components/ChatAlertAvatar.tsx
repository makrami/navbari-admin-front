type ChatAlertAvatarProps = {
  avatarUrl: string;
  name: string;
};

export function ChatAlertAvatar({
  avatarUrl,
  name,
}: ChatAlertAvatarProps) {
  return (
    <img
      src={avatarUrl}
      alt={name}
      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
    />
  );
}

