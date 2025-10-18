import { create } from "zustand";

type AuthState = {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  setToken: (token) => set({ token }),
  get isAuthenticated() {
    return !!get().token;
  },
  logout: () => set({ token: null }),
}));


