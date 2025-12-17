import { create } from 'zustand'

export type DepositSize = 'S' | 'M' | 'L' | null

type DepositState = {
  receiverPhone: string
  senderPhone: string
  size: DepositSize
  setReceiverPhone: (phone: string) => void
  setSenderPhone: (phone: string) => void
  setSize: (size: DepositSize) => void
  resetDeposit: () => void
}

export const useDepositStore = create<DepositState>((set) => ({
  receiverPhone: '',
  senderPhone: '',
  size: null,
  setReceiverPhone: (receiverPhone) => set({ receiverPhone }),
  setSenderPhone: (senderPhone) => set({ senderPhone }),
  setSize: (size) => set({ size }),
  resetDeposit: () => set({ receiverPhone: '', senderPhone: '', size: null }),
}))
