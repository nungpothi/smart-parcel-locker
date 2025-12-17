import { create } from 'zustand'

export type PickupParcel = {
  id: string
  size: 'small' | 'medium' | 'large'
  locker: string
  readyAt: string
}

type PickupState = {
  phone: string
  otp: string
  token: string
  parcels: PickupParcel[]
  setPhone: (phone: string) => void
  setOtp: (otp: string) => void
  setToken: (token: string) => void
  setParcels: (parcels: PickupParcel[]) => void
  reset: () => void
}

export const usePickupStore = create<PickupState>((set) => ({
  phone: '',
  otp: '',
  token: '',
  parcels: [],
  setPhone: (phone) => set({ phone }),
  setOtp: (otp) => set({ otp }),
  setToken: (token) => set({ token }),
  setParcels: (parcels) => set({ parcels }),
  reset: () => set({ phone: '', otp: '', token: '', parcels: [] }),
}))
