import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  user?: {
    isEmailVerified: boolean;
    isPhoneNumberVerified: boolean;
  };
  setAuthenticated: (isAuthenticated: boolean, user?: AuthState["user"]) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  // Start with optimistic authentication state (true by default)
  // This allows the app to load without redirecting to login on every page refresh
  // The HTTP interceptor will handle 401 errors and redirect to login when needed
  isAuthenticated: true,
  user: undefined,
  setAuthenticated: (isAuthenticated, user) => set({ isAuthenticated, user }),
  logout: () => set({ isAuthenticated: false, user: undefined }),
}));

// Helper to check if user is authenticated
export const isAuthenticated = () => useAuthStore.getState().isAuthenticated;


