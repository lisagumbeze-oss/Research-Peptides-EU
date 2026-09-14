import { create } from 'zustand';

type ChromeState = {
  cookieBannerOpen: boolean;
  setCookieBannerOpen: (open: boolean) => void;
};

/** Shared mobile chrome flags so fixed overlays don't stack on buy actions. */
export const useChromeStore = create<ChromeState>((set) => ({
  cookieBannerOpen: false,
  setCookieBannerOpen: (open) => set({ cookieBannerOpen: open }),
}));
