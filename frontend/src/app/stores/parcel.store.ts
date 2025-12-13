import { create } from "zustand";

type ParcelState = Record<string, never>;

export const useParcelStore = create<ParcelState>(() => ({}));
