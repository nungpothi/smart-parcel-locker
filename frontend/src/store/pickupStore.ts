import { create } from 'zustand'

export type PickupParcel = {
  id: string
  locker: string
  size: 'S' | 'M' | 'L'
  depositedAt: string
}

type PickupState = {
  phone: string
  otpRef: string | null
  otpCode: string
  pickupCode: string | null
  pickupToken: string | null
  isSubmitting: boolean
  errorMessage: string | null
  parcels: PickupParcel[]
  selectedParcelId: string | null
  setPhone: (phone: string) => void
  setOtpRef: (otpRef: string | null) => void
  setOtpCode: (otpCode: string) => void
  setPickupCode: (pickupCode: string | null) => void
  setPickupToken: (pickupToken: string | null) => void
  setSubmitting: (isSubmitting: boolean) => void
  setError: (message: string | null) => void
  setParcels: (parcels: PickupParcel[]) => void
  selectParcel: (parcelId: string | null) => void
  resetPickup: () => void
}

export const usePickupStore = create<PickupState>((set) => ({
  phone: '',
  otpRef: null,
  otpCode: '',
  pickupCode: null,
  pickupToken: null,
  isSubmitting: false,
  errorMessage: null,
  parcels: [],
  selectedParcelId: null,
  setPhone: (phone) => set({ phone }),
  setOtpRef: (otpRef) => set({ otpRef }),
  setOtpCode: (otpCode) => set({ otpCode }),
  setPickupCode: (pickupCode) => set({ pickupCode }),
  setPickupToken: (pickupToken) => set({ pickupToken }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setError: (errorMessage) => set({ errorMessage }),
  setParcels: (parcels) => set({ parcels }),
  selectParcel: (selectedParcelId) => set({ selectedParcelId }),
  resetPickup: () =>
    set({
      phone: '',
      otpRef: null,
      otpCode: '',
      pickupCode: null,
      pickupToken: null,
      isSubmitting: false,
      errorMessage: null,
      parcels: [],
      selectedParcelId: null,
    }),
}))
