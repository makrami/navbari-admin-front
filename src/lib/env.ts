const getEnv = (key: string, fallback: string = "") => {
  const value = (import.meta as any).env?.[key] ?? (globalThis as any).process?.env?.[key];
  return value ?? fallback;
};

export const ENV = {
  API_BASE_URL: getEnv("VITE_API_BASE_URL", "/api"),
};


