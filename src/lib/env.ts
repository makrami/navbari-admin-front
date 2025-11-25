const getEnv = (key: string, fallback: string = "") => {
  const value =
    (import.meta as unknown as { env: Record<string, string> }).env?.[key] ??
    (globalThis as unknown as { process: { env: Record<string, string> } })
      .process?.env?.[key];
  return value ?? fallback;
};

// Use relative path in development (for Vite proxy) or full URL in production
const isDev = import.meta.env.DEV;
const defaultApiUrl = isDev ? "/api/v1" : "https://api-nav.dimansoft.ir/api/v1";
const defaultFileBaseUrl = "https://api-nav.dimansoft.ir";
const defaultChatSocketUrl = isDev
  ? "/ws/chat"
  : "https://api-nav.dimansoft.ir/ws/chat";

export const ENV = {
  API_BASE_URL: getEnv("VITE_API_BASE_URL", defaultApiUrl),
  FILE_BASE_URL: getEnv("VITE_FILE_BASE_URL", defaultFileBaseUrl),
  CHAT_SOCKET_URL: getEnv("VITE_CHAT_SOCKET_URL", defaultChatSocketUrl),
};
