import {create} from 'zustand';

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('chat-theme') || 'light', // Default to 'light' if no theme is set
  isThemeChanging: false,

  setTheme: (theme) => {
    localStorage.setItem('chat-theme', theme);
    set({ theme:theme});
  },

  resetTheme: () => {
   
  },
}));