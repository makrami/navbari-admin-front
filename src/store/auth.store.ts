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
  isAuthenticated: false,
  user: undefined,
  setAuthenticated: (isAuthenticated, user) => set({ isAuthenticated, user }),
  logout: () => set({ isAuthenticated: false, user: undefined }),
}));

// Helper to check if user is authenticated
export const isAuthenticated = () => useAuthStore.getState().isAuthenticated;


