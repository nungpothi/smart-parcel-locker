import { create } from 'zustand'

export type DepositSize = 'S' | 'M' | 'L' | null

type DepositState = {
  receiverPhone: string
  senderPhone: string
  size: DepositSize
  lockerId: string | null
  lockerLabel: string | null
  parcelId: string | null
  parcelCode: string | null
  pickupCode: string | null
  status: string | null
  isSubmitting: boolean
  errorMessage: string | null
  setReceiverPhone: (phone: string) => void
  setSenderPhone: (phone: string) => void
  setSize: (size: DepositSize) => void
  setLocker: (lockerId: string, lockerLabel: string) => void
  setDepositResult: (
    parcelId: string,
    parcelCode: string,
    pickupCode: string | null,
    status: string,
  ) => void
  setSubmitting: (isSubmitting: boolean) => void
  setError: (message: string | null) => void
  resetDeposit: () => void
}

const initialState = {
  receiverPhone: '',
  senderPhone: '',
  size: null,
  lockerId: null,
  lockerLabel: null,
  parcelId: null,
  parcelCode: null,
  pickupCode: null,
  status: null,
  isSubmitting: false,
  errorMessage: null,
}

export const useDepositStore = create<DepositState>((set) => ({
  ...initialState,
  setReceiverPhone: (receiverPhone) => set({ receiverPhone }),
  setSenderPhone: (senderPhone) => set({ senderPhone }),
  setSize: (size) => set({ size }),
  setLocker: (lockerId, lockerLabel) => set({ lockerId, lockerLabel }),
  setDepositResult: (parcelId, parcelCode, pickupCode, status) =>
    set({ parcelId, parcelCode, pickupCode, status }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setError: (errorMessage) => set({ errorMessage }),
  resetDeposit: () => set({ ...initialState }),
}))
