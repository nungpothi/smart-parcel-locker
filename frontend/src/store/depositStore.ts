import { create } from 'zustand'

export type ParcelSize = 'small' | 'medium' | 'large' | ''

type DepositState = {
  primaryPhone: string
  secondaryPhone: string
  size: ParcelSize
  setPrimaryPhone: (phone: string) => void
  setSecondaryPhone: (phone: string) => void
  setSize: (size: ParcelSize) => void
  reset: () => void
}

export const useDepositStore = create<DepositState>((set) => ({
  primaryPhone: '',
  secondaryPhone: '',
  size: '',
  setPrimaryPhone: (primaryPhone) => set({ primaryPhone }),
  setSecondaryPhone: (secondaryPhone) => set({ secondaryPhone }),
  setSize: (size) => set({ size }),
  reset: () => set({ primaryPhone: '', secondaryPhone: '', size: '' }),
}))
