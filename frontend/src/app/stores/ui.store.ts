import { create } from "zustand";

type UiState = {
  loading: boolean;
  currentStep: number;
};

type UiActions = {
  setLoading: (value: boolean) => void;
  setStep: (step: number) => void;
  resetStep: () => void;
};

const initialState: UiState = {
  loading: false,
  currentStep: 0
};

export const useUiStore = create<UiState & UiActions>((set) => ({
  ...initialState,

  setLoading: (value) => set({ loading: value }),

  setStep: (step) => set({ currentStep: step }),

  resetStep: () => set({ currentStep: initialState.currentStep })
}));
