import { create } from 'zustand'

export type PickupParcel = {
  id: string
  locker: string
  size: 'S' | 'M' | 'L'
  depositedAt: string
}

type PickupState = {
  phone: string
  pickupCode: string | null
  otp: string
  pickupToken: string | null
  parcels: PickupParcel[]
  selectedParcelId: string | null
  setPhone: (phone: string) => void
  setPickupCode: (pickupCode: string | null) => void
  setOtp: (otp: string) => void
  setPickupToken: (pickupToken: string | null) => void
  setParcels: (parcels: PickupParcel[]) => void
  selectParcel: (parcelId: string | null) => void
  resetPickup: () => void
}

export const usePickupStore = create<PickupState>((set) => ({
  phone: '',
  pickupCode: null,
  otp: '',
  pickupToken: null,
  parcels: [],
  selectedParcelId: null,
  setPhone: (phone) => set({ phone }),
  setPickupCode: (pickupCode) => set({ pickupCode }),
  setOtp: (otp) => set({ otp }),
  setPickupToken: (pickupToken) => set({ pickupToken }),
  setParcels: (parcels) => set({ parcels }),
  selectParcel: (selectedParcelId) => set({ selectedParcelId }),
  resetPickup: () =>
    set({
      phone: '',
      pickupCode: null,
      otp: '',
      pickupToken: null,
      parcels: [],
      selectedParcelId: null,
    }),
}))
