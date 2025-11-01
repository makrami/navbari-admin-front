import { create } from "zustand";

type ProfileState = {
  language: string;
  setLanguage: (lang: string) => void;
};

export const useProfileStore = create<ProfileState>()((set) => ({
  language: localStorage.getItem("selectedLanguage") || "en",
  setLanguage: (lang) => {
    localStorage.setItem("selectedLanguage", lang);
    set({ language: lang });
  },
}));

